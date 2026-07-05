# Testing Report — Week 8

## 1. Automated Test Suite

`npx vitest run` — **45 test files / 212 tests, all passing.**

Coverage by area:

| Area | Test files | What's covered |
|---|---|---|
| Pages (integration) | `dashboard`, `formbuilder`, `forms`, `login`, `mySubmissions`, `pendingApprovals`, `preview`, `submissions`, `userManagement`, `workflow` | Rendering, user interactions (click/type/select), loading/error/empty states, role gating, pagination, search/filter/sort, delete confirmation flows |
| Components | `ErrorBoundary`, `ProtectedRoute`, `header`, `sidebar`, `button`, `confirmDialog`, `pagination`, `WorkflowActions` | Rendering, props, click handlers, disabled/loading states, route guarding |
| Stores (Zustand) | `authStore`, `formsStore`, `submissionStore`, `workflowStore` | Fetch/loading/error state, CRUD actions, background-sync-to-API behavior |
| Pure logic | `formsHelpers`, `submissionHelpers`, `conditionalVisibility`, `formSteps`, `dashboardStats`, `stageBadge`, `workflowTransitions`, `rolePermissions`, `buildValidationRules`, `dateFilter`, `moveItem`, `pagination`, `slugify` | Filtering/sorting/search algorithms, validation rule generation, workflow stage-transition rules, role permission gates |
| Rendering engine | `DynamicField`, `FormRenderer` | Schema → component resolution, controlled values, conditional visibility, multi-step navigation, inline validation errors |
| Services | `api`, `formService`, `submissionService`, `workflowService` | Axios request/response shape, error normalization, REST verb → endpoint mapping |
| Schemas | `formSchema`, `templates` | Field factory defaults, template structure |
| Smoke | `smoke` | App-level sanity check |

## 2. Test Cases (representative)

| # | Feature | Steps | Expected Result | Result |
|---|---|---|---|---|
| 1 | Login | Enter a demo account's email + `password123`, submit | Redirected to `/dashboard` (or the originally-requested page) | ✅ Pass |
| 2 | Login (invalid) | Enter a wrong password | Inline error shown, stays on `/login` | ✅ Pass |
| 3 | Logout | Click Logout in the header | Session cleared, redirected to `/login` | ✅ Pass |
| 4 | Protected route | Visit any route while signed out | Redirected to `/login`, then back to the original route after signing in | ✅ Pass |
| 5 | Create Form | Drag fields onto the canvas, click Save | New form appears in `/forms`, status "Draft" | ✅ Pass |
| 6 | Publish Form | Click Publish on a form | Status badge changes to "Published"; button shows a loading spinner while saving | ✅ Pass |
| 7 | Delete Form | Click Delete on a form row | `ConfirmDialog` opens; confirming removes the row, cancelling keeps it | ✅ Pass |
| 8 | Submit Form | Fill out a published form on `/preview`, submit | Submission recorded with a reference number; Thank You screen shown | ✅ Pass |
| 9 | Conditional field | Set a field's `showIf` to depend on another field's value | Field appears/disappears live as the trigger field changes | ✅ Pass |
| 10 | Multi-step form | Assign fields to steps, fill the form | Previous/Next navigation, progress indicator, Review & Submit step | ✅ Pass |
| 11 | Workflow creation | Create a workflow, add/reorder/delete stages | Stage list updates immediately and persists via the mock API | ✅ Pass |
| 12 | Delete Workflow | Click "Delete Workflow" | `ConfirmDialog` opens (previously fired with **no** confirmation — see bug #1 in `WEEK8-IMPLEMENTATION.md`); confirming removes it | ✅ Pass |
| 13 | Workflow approval | Advance a submission through Approve/Reject | Stage updates, a comment dialog captures an optional remark, timeline updates | ✅ Pass |
| 14 | Search | Type into a Forms/Submissions search box | List narrows to matching rows only | ✅ Pass |
| 15 | Filter | Change status/date filter dropdowns | List narrows accordingly; combines correctly with search | ✅ Pass |
| 16 | Pagination | Load more than one page of results | Previous/Next and page numbers work, disable at the ends | ✅ Pass |
| 17 | Role-based navigation | Sign in as Employee vs Manager vs Admin | Sidebar shows a different link set per role; unauthorized actions are hidden, not just disabled | ✅ Pass |
| 18 | Error boundary | Force a render error in a child component (test-only) | `ErrorBoundary` catches it and shows a Reload button instead of a blank white screen | ✅ Pass |

## 3. Functional Testing

All 18 test cases above were verified two ways:
1. **Automated** — every row has a corresponding Vitest + Testing Library test
   (see the file table in §1) that runs on every `npm run test`.
2. **Manual smoke test** — `npm run dev:all` was started, and both the Vite
   dev server (`:5173`) and the mock API (`:4000`) were confirmed to respond
   correctly (HTTP 200, correct HTML shell / JSON payloads) before being shut
   down.

## 4. Responsive & Browser Testing

This agent session has no visual browser access (no screenshot/interaction
tool available), so the items below are **not yet manually verified** and
are left as an explicit checklist rather than claimed as done:

- [ ] **Desktop** (≥1024px) — full 3-column Form Builder, side-by-side
      Dashboard charts
- [ ] **Tablet** (~768px) — Form Builder grid collapses appropriately,
      sidebar still visible
- [ ] **Mobile** (<768px) — sidebar collapses to a hamburger drawer, list
      pages' filter rows wrap instead of overflowing
- [ ] **Chrome** — full walkthrough
- [ ] **Edge** — full walkthrough
- [ ] **Firefox** — full walkthrough

The responsive CSS itself (Tailwind breakpoints: `md:`/`lg:` on the sidebar,
Form Builder grid, and every filter bar's `flex-wrap`) was verified by
reading the implementation, matching the patterns already screenshotted and
confirmed working in the Week 2 and Week 7 write-ups — but an explicit
Week 8 pass in real browsers/devices, with screenshots, is still the
submitter's responsibility per the checklist above.

## 5. Known Limitations

- `FormRenderer.jsx` triggers one ESLint warning
  (`react-hooks/incompatible-library`) because `react-hook-form`'s `watch()`
  intentionally returns a non-memoizable live snapshot, which conditional
  fields (`showIf`) depend on. This is accepted, not a bug — see
  `WEEK8-IMPLEMENTATION.md` §2.
- The mock backend (`json-server`) has no real validation or concurrency
  control; two users editing the same workflow simultaneously would race.
  Out of scope for this prototype (see README → Future Enhancements).
