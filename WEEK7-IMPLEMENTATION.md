# Week 7 Implementation Summary — API Integration, Auth & Production Readiness

## 1. REST API Integration — Research Notes

- **What is a REST API?** A REST API exposes server-side resources (forms,
  workflows, submissions) as URLs, and lets clients read/change them using
  standard HTTP methods instead of a custom protocol. Each resource has a
  predictable shape (JSON) and a predictable set of operations, so any client
  — this app, a mobile app, `curl` — can talk to it the same way.
- **GET vs POST vs PUT vs DELETE:**
  - `GET` — read a resource or collection; no side effects, safe to retry.
  - `POST` — create a new resource; the server usually assigns its identity.
  - `PUT` — replace an existing resource with the given representation.
  - `DELETE` — remove a resource.
- **Why frontend apps use APIs:** the browser can't talk to a database
  directly (no credentials, no driver, and every user would need direct
  network access to it). An API is the one narrow, versioned surface the
  server exposes instead — the frontend calls it, the server decides what's
  actually allowed to happen to the data.
- **API authentication:** a real API would check a token (e.g. a JWT bearer
  header) on every request to know who's calling and reject requests without
  one. This app models that shape (see below) even though the mock server
  doesn't enforce it, precisely so the pattern is in place for a real backend.

## 2. Mock Backend & API Layer

Since no real backend was provided, **json-server** simulates one from
`db.json` (three collections: `forms`, `workflows`, `submissions`). Run it
alongside Vite with `npm run dev:all`, or separately with `npm run server`
(defaults to `http://localhost:4000`).

`src/services/api.js` is the single Axios instance every service module
shares:

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});
```

- A **request interceptor** attaches `Authorization: Bearer <mock-token>`
  from `authStore` whenever a session exists.
- A **response interceptor** normalizes every failure into `{ message,
  status }`, so callers never branch on axios's error shape directly.

`formService.js` / `workflowService.js` / `submissionService.js` are thin
wrappers (`getX`, `createX`, `updateX`, `deleteX`) around that instance —
each one is the "reusable API layer" the spec asks for, and each has its own
Vitest suite mocking `axios` at that boundary.

## 3. Store Architecture: Two Sync Strategies

Rather than one blanket pattern, mutations use whichever strategy fits the
stakes of the action:

- **Background sync** (`workflowStore.js`, `submissionStore.js`): editing a
  workflow's stages or advancing a submission's status updates local state
  *immediately* — the UI never blocks on the network — then persists the
  change to the API in the background. A client-generated id is included on
  create, so the local and server records agree without waiting on a round
  trip. If the background call fails, `error` is set for the next fetch/retry
  to surface, but the optimistic local change stands (this is a frequent,
  low-stakes action; a demo/mock backend rarely disagrees with local state).
- **Await-then-commit** (`formsStore.js`): saving or deleting a form is an
  explicit, infrequent, user-triggered action, so `saveForm`/`deleteFormById`
  `await` the API call and only update local state on success — the caller
  gets back `{ success, form }` or `{ success: false, error }` and can show a
  real "saved" or "failed" toast instead of assuming success.

All three "list" stores (`formsStore`, `workflowStore`, `submissionStore`)
expose `isLoading`/`error` and a `fetchX()` that pages call once on mount —
replacing the `zustand/persist` localStorage middleware those stores used
through Week 6. `formStore.js` (the Form *Builder's* single in-progress
draft) is a separate, smaller store and keeps its own localStorage
persistence — it's just a scratch pad until `saveForm` promotes it into the
API-backed forms list.

## 4. Authentication & Protected Routes

- `src/store/authStore.js` (replacing Week 6's role-switcher-only
  `roleStore.js`) matches `/login`'s email + password against three mock
  accounts (`admin@test.com` / `manager@test.com` / `employee@test.com`, all
  password `password123`) and stores `isAuthenticated` + a mock bearer
  `token`, persisted to **sessionStorage** (cleared when the tab closes,
  unlike the rest of the app's localStorage-backed state).
- `src/components/ProtectedRoute.jsx` is a layout-route guard: if
  `isAuthenticated` is false it redirects to `/login`, remembering the
  originally requested page in router state so Login can send the user back
  after signing in.
- `/dashboard`, `/forms`, `/form-builder`, `/workflow`, `/preview`,
  `/submissions`, `/pending-approvals`, `/my-submissions`,
  `/user-management`, and `/components` all sit behind that guard; `/login`
  is the only public route.
- Header's Logout button now actually calls `logout()` and redirects to
  `/login` — Week 6's "Viewing as" dropdown is gone, since a real session now
  determines the active user.

## 5. Role-Based Navigation

`src/navigation/navItems.js` is a pure `getNavItemsForRole(role)` lookup,
matching the spec's example exactly:

| Role     | Sees                                              |
| -------- | -------------------------------------------------- |
| Employee | Dashboard, Forms, My Submissions                   |
| Manager  | Dashboard, Pending Approvals, Workflows            |
| Admin    | Dashboard, Forms, Workflows, User Management        |

`Pending Approvals` and `My Submissions` are thin wrapper pages
(`pendingApprovals.jsx`, `mySubmissions.jsx`) around the same `Submissions`
component used by `/submissions`, passed a `mode` prop (`"pending"` /
`"mine"`) that pre-filters the list — no duplicated list-rendering logic.
`User Management` is an explicit placeholder (per the spec's own
"(Placeholder)" label) listing the mock accounts read-only.

## 6. Data Management: Search, Filter, Sort, Pagination

- **Forms** (`src/store/formsHelpers.js`): search by name, filter by status
  (Draft/Published) and created date, sort by name or newest-first.
- **Submissions** (`src/store/submissionHelpers.js`, extended from Week 5):
  search now also matches values inside `responses` (so an email field is
  searchable, not just the computed display name), plus a stage filter
  (Approved/Pending/Rejected).
- **Pagination** (`src/utils/pagination.js` + `src/components/ui/
  pagination.jsx`): a small pure `paginate(items, page, pageSize)` helper
  (clamps out-of-range pages) shared by Forms, Workflows, and Submissions,
  with a Previous/page-numbers/Next control that hides itself when there's
  only one page.

## 7. Loading, Error & Empty States

Three small reusable components replace one-off markup across every list
page: `Spinner` (animated, shown while a store's `isLoading` is true),
`ErrorBanner` (the failure message plus a Retry button that just re-calls
`fetchX()`), and `EmptyState` (the "No Forms Available" / "No submissions
yet" style copy the spec asks for). A **global `ErrorBoundary`**
(`src/components/ErrorBoundary.jsx`, wrapped around `<App />` in
`main.jsx`) catches any render error the app doesn't otherwise handle and
shows "Something went wrong. Please refresh the application." with a Reload
button instead of a blank white screen.

## 8. Performance Optimization

- **Route-level code splitting**: every page in `App.jsx` is loaded via
  `React.lazy()` inside one `<Suspense>` boundary, so (for example) the
  Recharts-heavy Dashboard bundle only downloads when `/dashboard` is
  actually visited.
- **`React.memo`**: list rows (`SubmissionRow`, `FormRow`) and
  `WorkflowStageEditor`/`ReadOnlyWorkflowCard` are extracted into their own
  memoized components, so typing in a search box (which re-renders the whole
  list) skips re-rendering rows whose underlying data object hasn't changed.
- **`useCallback`**: the row action handlers (`onSelect`, `onEdit`,
  `onFill`, `onDelete`) are wrapped so their identity stays stable across
  renders — otherwise passing a fresh inline function every render would
  defeat the `memo` above.
- **`useMemo`**: Dashboard's `computeDashboardStats` /
  `computeFormsByStatus` / `computeWorkflowDistribution` calls (each an O(n)
  scan over submissions) only re-run when `submissions`/`workflows` actually
  change, and every list page's filter → sort → paginate pipeline is
  similarly memoized on its actual inputs.

## 9. Testing Strategy

Every new pure module (`api.js`'s interceptors, all four service modules,
`authStore`, `navItems`, `formsHelpers`, `pagination`) has a Vitest unit
suite. Store tests mock the corresponding service module (`vi.mock`) so
mutation logic is verified without a real network call. Page-level
integration tests mock the same service and, where a page fetches on mount,
resolve that mock with whatever the test already seeded into the store —
modeling a same-data refresh rather than a real network round trip, so
tests stay fast and deterministic while still exercising the real
loading → loaded transition (`await screen.findByText(...)`).

As in Weeks 5–6, no browser session was available in this environment, so
this automated suite (**200 tests across 41 files**, plus `npm run lint` and
`npm run build` both clean) is the verification evidence in place of a
manual click-through — please still exercise the login flow, protected
routing, and each role's nav in a real browser before treating this as
final.

## 10. Screenshots Checklist

- **Login Page** — the form itself, and the demo-account hint.
- **Protected Route** — being redirected to `/login` when signed out (e.g.
  hitting `/dashboard` directly), then landing back on it after signing in.
- **Forms List** — search/filter/sort controls and the row actions.
- **Workflow List** — `/workflow`, Admin view with the stage editor.
- **Search & Filter** — a filtered result on Forms or Submissions.
- **Pagination** — a list with more than one page of results.
- **Loading Spinner** — reload a list page and catch the spinner before data
  arrives.
- **Error State** — stop `npm run server` and reload a list page to see the
  ErrorBanner + Retry button.

## 11. Demo Session Prep

1. **API architecture** — `src/services/api.js`'s shared Axios instance and
   the per-resource service modules built on it.
2. **Axios configuration** — base URL, headers, timeout, and the two
   interceptors (auth header, error normalization).
3. **Authentication flow** — `authStore.login()` matching email/password
   against `MOCK_USERS`, session persisted to `sessionStorage`.
4. **Protected routes** — `ProtectedRoute.jsx`'s redirect-and-remember-
   destination pattern.
5. **Role-based navigation** — `navItems.js`'s per-role lookup and how
   `Sidebar.jsx` consumes it.
6. **Search and filtering logic** — `formsHelpers.js` / `submissionHelpers.js`
   as pure, independently-tested functions the pages just call.
7. **Performance optimization techniques** — lazy-loaded routes,
   `React.memo`'d list rows, and `useMemo`'d dashboard calculations.
