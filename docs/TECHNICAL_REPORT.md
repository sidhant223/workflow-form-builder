# Technical Report — Workflow & Dynamic Form Builder

**Project:** FormFlow — Workflow & Dynamic Form Builder
**Duration:** 8-week internship (Week 1 – Week 8)
**Stack:** React 19 (Vite) · Tailwind CSS 4 · React Router 7 · Zustand 5 · react-hook-form · @dnd-kit · Recharts · Axios · json-server

---

## 1. Introduction

FormFlow is a frontend prototype for a **Workflow & Dynamic Form Builder** —
an internal tool that lets an organization design its own data-collection
forms and attach an approval process to them, without a developer writing a
single line of form-specific code.

The problem it solves is a familiar one inside most companies: a large
fraction of internal processes — leave requests, expense claims, onboarding
paperwork, purchase approvals, customer feedback — boil down to "someone
fills in a structured form, and then one or more other people need to review
and decide on it." Historically this is handled with email chains, shared
spreadsheets, or a hard-coded form for every single use case, each requiring
a developer to build, test, and maintain a bespoke `<form>` and a bespoke
approval script. That doesn't scale: every new form type is a new
development cycle, and every approval process outgrows an email thread the
moment more than one reviewer or more than one stage is involved.

FormFlow's answer is to make both halves of that problem **data, not code**:

- A form is not React markup — it's a JSON schema (an array of field
  descriptions) that a single, generic **rendering engine** turns into a
  live, validated, multi-step form.
- A workflow is not a bespoke approval script — it's a named, ordered list
  of stages that a single, generic **transition engine** turns into "what
  actions are available right now, and who is allowed to click them."

The intended audience is **internal teams** — HR, IT, finance, operations —
who need to stand up a new form-plus-approval-process quickly: an Admin
designs the form and the workflow visually, an Employee fills it in, and a
Manager reviews it, all without anyone touching source code. Because both the
form and the workflow are just data, the same small set of components
(the form renderer, the field registry, the transition engine) serves every
form and every workflow the organization will ever need, instead of one
codebase per process.

## 2. Objectives

The project was scoped as an 8-week build-out, with each week adding one
layer of the final system:

1. **Week 1–2 — Reusable component library.** Build a small design system
   (`Button`, `Input`, `Select`, `Checkbox`, `Radio`, `Card`, `Modal`,
   `Badge`, `Toast`, etc.) that every later screen — including the form
   renderer itself — would be built from, instead of one-off markup per page.
2. **Week 3 — Dynamic, schema-driven forms.** Prove that a form can be
   *data* (a JSON array of field objects) instead of hand-written JSX, via a
   field registry and a generic renderer.
3. **Week 4 — Drag-and-drop form builder.** Give non-developers a visual way
   to produce that JSON schema: a palette, a canvas, and a property panel,
   wired together with `@dnd-kit`.
4. **Week 5 — Validation, multi-step forms, and submissions.** Make the
   generated forms actually enforce data quality (required/length/format/
   range rules), support conditional fields and multi-step wizards, and
   record every submission somewhere durable.
5. **Week 6 — Workflow engine.** Add the second half of the product: named
   workflows with ordered stages, a rules engine that derives valid actions
   from that stage list, a timeline/history view, and role-gated actions.
6. **Week 7 — REST API integration and authentication.** Replace
   `localStorage` with a real (if mocked) REST backend via Axios, add
   email/password login and protected routes, and round out list pages with
   search/filter/sort/pagination and loading/error/empty states.
7. **Week 8 — Bug-fixing, polish, testing, deployment, documentation.** No
   new features: fix known bugs, unify visual styling, replace native
   browser dialogs with in-app ones, verify the test suite and production
   build, prepare deployment configuration, and write the documentation set
   this report is part of.

## 3. Architecture

FormFlow is a single-page React application with a clear top-to-bottom data
flow, best understood as five layers:

```
schemas  →  renderer  →  stores (Zustand)  →  services (REST)  →  pages  →  routing (App.jsx)
```

**Schemas (`src/schemas/`)** are the plain-data contracts the rest of the app
is built on. `formSchema.js` defines `FIELD_TYPES` (the catalogue of
supported field types: text, email, number, password, textarea, select,
checkbox, radio, date) and a `createField(type, id)` factory that produces a
field object with sensible defaults (including the Week 5 additions:
`minLength`/`maxLength`/`min`/`max`/`pattern`/`patternMessage` for
validation, `showIf` for conditional visibility, and `sectionId` for
multi-step assignment). `workflowSchema.js` defines a workflow as `{ id,
workflowName, stages: [...] }` — nothing more than a name and an ordered
array of stage-name strings.

**Renderer (`src/renderer/`)** is the schema-driven rendering engine. Given
a schema (an array of field objects), `FormRenderer.jsx` builds a live,
`react-hook-form`-backed form: it owns `useForm()`, wraps each field in a
`Controller`, and pulls each field's per-type validation rules from
`src/validation/buildValidationRules.js`. `DynamicField.jsx` is the one
place that turns a field object into an actual component, by looking its
`type` up in `fieldRegistry.js` — a straight `{ type: Component }` map. This
is the crux of "schema-driven": neither `FormRenderer` nor `DynamicField`
contains a single hard-coded `<input>`; adding a new field type is "write a
component, add one line to the registry," not "modify the renderer."

**Stores (`src/store/`)** hold all mutable application state, using
Zustand. There are five: `formStore` (the Form Builder's single
in-progress draft), `formsStore` (the saved-forms list), `workflowStore`
(workflow definitions), `submissionStore` (recorded submissions), and
`authStore` (the mock session). Section 3.1 below explains why two
different persistence strategies are used across them.

**Services (`src/services/`)** are the REST API layer: `api.js` is one
shared Axios instance (base URL from `VITE_API_BASE_URL`, a 10s timeout, a
request interceptor that attaches `Authorization: Bearer <mock-token>` from
`authStore`, and a response interceptor that normalizes every failure into
`{ message, status }`). `formService.js`, `workflowService.js`, and
`submissionService.js` are thin `getX`/`createX`/`updateX`/`deleteX`
wrappers around it, each resource backed by its own collection in a local
**json-server** instance reading from `db.json`.

**Pages (`src/pages/`)** are the screens: `login`, `dashboard`, `forms`,
`formbuilder`, `workflow`, `preview`, `submissions` (and its two role-scoped
wrapper pages, `pendingApprovals` and `mySubmissions`), `userManagement`,
and `components`. Pages read from stores via Zustand selector hooks, call
store actions on user interaction, and are otherwise thin — the actual
list-filtering, validation, and transition logic lives in small, independently
tested pure modules (`src/store/formsHelpers.js`, `src/store/
submissionHelpers.js`, `src/workflow/workflowTransitions.js`, etc.), not
inlined in the page components.

**Routing (`src/App.jsx`)** wires it together: every page is loaded with
`React.lazy()` inside one `<Suspense>` boundary (so, for example, the
Recharts-heavy Dashboard chunk downloads only when `/dashboard` is actually
visited), and every route except `/login` is nested inside a `<Route
element={<ProtectedRoute />}>` — a layout-route guard that checks
`authStore`'s `isAuthenticated` flag and redirects signed-out visitors to
`/login`, remembering where they were headed (via router state) so `Login`
can send them back after a successful sign-in.

### 3.1 Two sync strategies, and why

Rather than committing to one blanket persistence pattern, the store layer
uses whichever strategy fits the stakes and frequency of the mutation it's
handling:

- **Background sync** (`workflowStore.js`, `submissionStore.js`): actions
  like editing a workflow's stages, advancing a submission's stage, or
  assigning a reviewer update the in-memory Zustand state *immediately* —
  the UI never blocks on a network round trip — and then fire the matching
  API call in the background (`.catch((err) => set({ error: err.message
  }))`). A client-generated id (e.g. `submission_${Date.now()}_${random}`)
  is attached at creation time specifically so the local record and the
  eventual server record agree without waiting on the server to assign an
  id. This trades a small risk (a background call could fail silently from
  the user's point of view, beyond setting `error` for the next fetch to
  surface) for responsiveness on actions a user performs *often* — every
  drag of a stage, every Approve click — against a mock backend that in
  practice rarely disagrees with the optimistic local state.
- **Await-then-commit** (`formsStore.js`): `saveForm` and `deleteFormById`
  are explicit, infrequent, deliberate user actions — a click on "Save,"
  "Publish," or a confirmed "Delete" — so they `await` the API call and
  only update local state once it resolves, returning `{ success, form }`
  or `{ success: false, error }` to the caller. This lets `formbuilder.jsx`
  show a real "Form saved."/"Form published." or a real failure toast,
  driven by `Button`'s `isLoading` prop, instead of assuming the network
  call succeeded.

The dividing line is essentially: *if the user needs to know whether this
specific action succeeded before doing anything else, await it; if it's a
high-frequency, low-individual-stakes edit, apply it optimistically and let
errors surface on the next read.* `formStore.js` (the Form Builder's
single draft) sits outside this API-backed group entirely — it is a small,
`localStorage`-persisted scratch pad, kept deliberately separate so a page
refresh mid-edit doesn't lose work, until `saveForm` promotes its contents
into the API-backed `formsStore` list.

### 3.2 Mock authentication and role-based navigation

`src/store/authStore.js` matches a submitted email against a fixed
`MOCK_USERS` array (Admin/Manager/Employee, one shared password,
`password123`) — there is no real backend validating credentials. A
successful login sets `isAuthenticated: true` and a mock bearer `token`
(`mock-token-<userId>`), both persisted to **`sessionStorage`** rather than
`localStorage` — a deliberate choice so a session ends when the browser tab
closes, unlike the rest of the app's longer-lived local state.
`src/services/api.js`'s request interceptor attaches that token as an
`Authorization` header on every outgoing request, modeling the shape of
real token-based API auth even though the mock server doesn't check it.

Once signed in, `src/navigation/navItems.js`'s `getNavItemsForRole(role)`
determines what the sidebar shows: Employees see Dashboard / Forms / My
Submissions; Managers see Dashboard / Pending Approvals / Workflows; Admins
see Dashboard / Forms / Workflows / User Management. `src/workflow/
rolePermissions.js` separately gates *actions* rather than *navigation*:
`canPerformAction(role, actionType)` (Employees can only `advance`;
Managers and Admins can additionally `approve`/`reject`),
`canConfigureWorkflows(role)` (Admin only), and `canManageForms(role)`
(Admin only, gating the Forms page's New/Edit/Delete controls).

## 4. Folder Structure

```
src/
├── components/
│   ├── ui/                 # Reusable design-system primitives (Button, Input,
│   │                       #   Select, Checkbox, Radio, Card, Modal, Badge,
│   │                       #   Toast, Spinner, EmptyState, ErrorBanner,
│   │                       #   Pagination, ConfirmDialog)
│   ├── builder/             # Form Builder UI (FieldPalette, SortableCanvas,
│   │                       #   DraggableField, PropertyPanel, ConditionalPanel,
│   │                       #   StepManagerPanel, FormMetadata, TemplatePickerModal)
│   ├── workflow/            # Workflow UI (WorkflowStageEditor, WorkflowTimeline,
│   │                       #   WorkflowActions, CommentDialog)
│   ├── submissions/         # SubmissionDetailModal, memoized SubmissionRow
│   ├── forms/               # Memoized FormRow
│   ├── viewer/               # JSONViewer (schema/debug inspector modal)
│   ├── header.jsx / sidebar.jsx   # App chrome; sidebar is role-based nav
│   ├── ProtectedRoute.jsx   # Auth route guard
│   └── ErrorBoundary.jsx    # Global render-error fallback
├── services/                # REST API layer (api.js + one service per resource)
├── schemas/                 # Field/workflow data model + form templates
├── renderer/                 # Schema-driven rendering engine (FormRenderer,
│                             #  DynamicField, fieldRegistry, conditionalVisibility,
│                             #  formSteps) + per-type field components
├── validation/                # buildValidationRules.js — schema → react-hook-form rules
├── workflow/                  # Pure logic: workflowTransitions, rolePermissions,
│                             #  dashboardStats, stageBadge
├── navigation/                 # navItems.js — role → sidebar links
├── utils/                     # slugify, pagination, moveItem, dateFilter
├── store/                     # Zustand stores: formStore, formsStore, workflowStore,
│                             #  submissionStore, authStore + their helper modules
├── layouts/                   # MainLayout (sidebar + header shell)
├── pages/                     # One file per route
├── main.jsx                    # Wraps <App/> in <ErrorBoundary>
└── App.jsx                     # Lazy-loaded routes behind ProtectedRoute
```

Each top-level folder has exactly one job: `schemas` defines what the data
*is*, `renderer` turns that data into UI, `validation` and `workflow` hold
pure business-rule logic with no React in them, `store` holds mutable state
and orchestrates `services`, `services` talks to the network, `pages`
assemble all of the above into a screen, and `App.jsx` decides which screen
is showing.

## 5. Application Flow

To see how the layers cooperate, trace one concrete, end-to-end journey:
**an Admin builds and publishes a form, links it to a workflow, an Employee
submits it, and a Manager approves it.**

1. **Admin signs in** at `/login`. `authStore.login("admin@test.com",
   "password123")` matches `MOCK_USERS`, sets `isAuthenticated`, and the
   Admin lands on `/dashboard` (empty, since nothing has been submitted
   yet). The sidebar shows Dashboard / Forms / Workflows / User Management,
   per `getNavItemsForRole("Admin")`.

2. **Admin designs a workflow** at `/workflow`. Because
   `canConfigureWorkflows("Admin")` is true, the page shows the editable
   `WorkflowStageEditor` view. Clicking **+ New Workflow** calls
   `workflowStore.addWorkflow("Leave Approval")`, which creates a workflow
   seeded with `["Draft", "Submitted", "Approved", "Rejected"]` and persists
   it to the API in the background. The Admin adds a "Manager Review" stage
   in the middle via `addStage`, giving the sequence `Draft → Submitted →
   Manager Review → Approved/Rejected`.

3. **Admin builds a form** at `/form-builder`. Dragging a field type out of
   the `FieldPalette` and releasing it over the canvas triggers
   `formStore.addField(type)`, which mints a new field object via
   `createField()` and appends it. Clicking a field selects it
   (`selectField(id)`) and opens `PropertyPanel`, where the Admin sets its
   label, placeholder, help text, and marks it `required` — each edit calls
   `updateField(id, { ... })`. Dragging fields within the canvas reorders
   them via `reorderFields(fromIndex, toIndex)`. In `FormMetadata`, the
   Admin names the form ("Leave Request"), and — critically — picks the
   "Leave Approval" workflow from the **Workflow** dropdown, which calls
   `updateFormMetadata({ workflowId: "workflow_..." })`, linking the form to
   the workflow built in step 2.

4. **Admin publishes it.** Clicking **Publish** calls `handleSave("Published")`
   in `formbuilder.jsx`, which awaits `formsStore.saveForm({ ..., status:
   "Published" })`. Because the form has no `id` yet, `saveForm` `POST`s a
   new record (via `createForm`) with a freshly generated id, adds it to the
   `forms` array on success, and returns `{ success: true, form }` — the
   builder then shows a "Form published." toast.

5. **Employee signs in** and goes to `/forms`. `Forms` fetches the saved
   list on mount (`fetchForms()`) and lists "Leave Request" with status
   Published. Since Employees can't manage forms (`canManageForms`
   is false for that role), only the **Fill Form** action is available.
   Clicking it calls `loadSchema(form)` (loading the saved schema into the
   Form Builder's draft store) and navigates to `/preview`.

6. **Employee submits the form** at `/preview`. `FormRenderer` renders the
   schema with live validation; on submit, `preview.jsx`'s `handleSubmit`
   calls `submissionStore.addSubmission({ formId, formName, responses,
   fields, workflowId, stages: linkedWorkflow.stages, submittedBy })`. This
   creates a submission record whose `stage` is initialized to the linked
   workflow's *first* stage ("Draft") and whose `history` gets one "Created"
   entry — then the record is optimistically added to the store and
   persisted to the API in the background. The Employee sees a "Thank You"
   screen with a generated reference number (`FORM-000001`, etc.).

7. **Manager reviews it** at `/pending-approvals` (a thin wrapper rendering
   `<Submissions mode="pending" />`, pre-filtered by `filterSubmissions`'s
   `isPending()` check so only non-terminal-stage submissions show). Opening
   the submission's row shows `SubmissionDetailModal`: its current stage
   badge, a `WorkflowTimeline` (built from `getTimelineStages(stages,
   history)`), and `WorkflowActions`, which calls
   `getAvailableActions(stages, currentStage)` to compute what buttons to
   show. At "Draft", the only sequential action is "Submit" → moves to
   "Submitted"; at "Manager Review" (the last non-outcome stage), the
   computed actions become **Approve**/**Reject**, each jumping straight to
   the workflow's respective outcome stage. Since the Manager's role
   permits `approve`/`reject` (`canPerformAction("Manager", "approve")` is
   true), both buttons render. Clicking **Approve** opens `CommentDialog`
   for an optional remark, then calls `submissionStore.advanceStage(id, {
   toStage: "Approved", action: "approve", user, comment })`, which appends
   a new `history` entry and updates `stage` — again optimistic-then-
   background-persisted.

8. **It shows up on the Dashboard.** `/dashboard` recomputes
   `computeDashboardStats(submissions)` from the live `submissionStore` and
   `workflowStore` data via `useMemo`: "Approved Today" increments (the
   approval's timestamp is checked against today's calendar date), "Pending
   Reviews" decrements (the submission is no longer in a non-outcome
   stage), and the "Forms by Status" bar chart and "Workflow Distribution"
   pie chart (from `computeFormsByStatus`/`computeWorkflowDistribution`)
   update to reflect the new state — no page beyond the store subscriptions
   needed to know a decision was made.

## 6. Key Features

Across all eight weeks, the application delivers:

- **Schema-driven forms** — every form is a JSON array of field objects; a
  field registry (`fieldRegistry.js`) maps each `type` to its React
  component, so the renderer never hard-codes an `<input>`.
- **Drag-and-drop form building** — `@dnd-kit`-powered field palette,
  sortable canvas, field duplication, and live property editing.
- **Validation** — required/min-length/max-length/numeric-range/email-
  format/regex-pattern rules, generated per-field by
  `buildValidationRules.js` and enforced via `react-hook-form`.
- **Conditional fields** — a field's `showIf: { field, value }` hides/shows
  it live against another field's current value (`isFieldVisible`), with
  its validation rules unregistered while hidden so it can never block
  submission.
- **Multi-step forms** — fields assigned to named steps (`sectionId`) are
  grouped by `groupFieldsBySection`, rendered with Previous/Next navigation,
  a progress bar, and an auto-appended Review & Submit step.
- **Form templates** — three ready-made schemas (Employee Registration,
  Leave Request, Customer Feedback) loadable via `loadSchema()`.
- **Workflow engine** — named workflows with an ordered, freely editable
  stage list; `getAvailableActions`/`getTimelineStages` derive valid next
  moves and timeline rendering purely from that array, with "Approved"/
  "Rejected" recognized (case-insensitively) as terminal outcomes.
- **Timeline, history, and comments** — every submission carries an
  append-only `history` of `{ stage, action, user, comment, timestamp }`,
  visualized as a filled/hollow-dot timeline; Approve/Reject prompt for an
  optional comment via `CommentDialog` first.
- **REST API integration** — a shared Axios instance with request/response
  interceptors, backed by a local `json-server` mock API over `db.json`.
- **Mock authentication, protected routes, and role-based navigation** —
  email/password login against `MOCK_USERS`, `sessionStorage`-persisted
  sessions, `ProtectedRoute` guarding every other route, and a sidebar whose
  contents change per role.
- **Search, filter, sort, and pagination** — consistently available on
  Forms (name search, status/date filter, name/date sort), Workflows, and
  Submissions (name/form/response-value search, date/stage filter),
  all sharing one `paginate()` helper and `Pagination` component.
- **Loading, error, and empty states** — `Spinner`, `ErrorBanner` (with
  Retry), and `EmptyState` used consistently across every list page, plus a
  global `ErrorBoundary` around the whole app.
- **Performance** — every route code-split via `React.lazy`/`Suspense`;
  list rows (`FormRow`, `SubmissionRow`) and dashboard calculations
  memoized (`React.memo`/`useMemo`/`useCallback`).
- **This week's UX/UI polish** — a styled `ConfirmDialog` replacing native
  `window.confirm()` for form/workflow deletion, a reusable `isLoading`
  spinner state on `Button`, and a single consistent violet accent across
  every screen (the Form Builder's leftover blue classes were unified).

## 7. Challenges Faced

**1. Keeping the Form Builder's draft separate from the saved-forms list.**
`formStore.js` (the single, `localStorage`-persisted in-progress draft the
Form Builder edits) and `formsStore.js` (the API-backed list of saved
forms shown on `/forms`) look like they should be one store, but merging
them would mean every keystroke while editing a form triggers a network
request, and closing the tab mid-edit would either lose the draft or spam
the server with half-finished forms. Keeping them separate — with
`saveForm` as the one explicit bridge between them, and `loadSchema()` as
the one way data flows back the other way (Edit/Fill Form) — solved this
without a full rearchitecture, at the cost of two stores that both hold a
notion of "the current form" and have to be kept conceptually distinct in
every page that touches either.

**2. Choosing two different sync strategies instead of one.** Committing
either to fully optimistic writes everywhere or to awaiting every API call
would have been simpler to reason about, but wrong for at least one class of
mutation: awaiting every workflow stage edit would make dragging a stage
feel laggy for no real safety benefit (a mock backend essentially never
disagrees with the optimistic state), while firing-and-forgetting a form
Delete would mean the user has no way to know whether their data actually
survived. The two-strategy split (Section 3.1) is the resolution, but it
means two different mutation shapes exist in the codebase side by side, and
any new store has to make a deliberate choice about which one it needs
rather than copy-pasting a pattern.

**3. `showIf` conditional fields vs. `watch()`'s memoization.**
`FormRenderer` needs `react-hook-form`'s `watch()` to return the live
values of every field, on every keystroke, so `isFieldVisible` can decide
whether to hide/show a dependent field in real time. But `watch()` is
intentionally a non-memoizable snapshot — there's no way to make it satisfy
the React Compiler's automatic memoization checks without breaking the
"reacts to every keystroke" behavior the feature needs. The team's decision
(documented in the Week 8 write-up) was to accept the resulting
`react-hooks/incompatible-library` ESLint warning rather than compromise
the conditional-visibility feature — a case where a linter's default
assumption doesn't fit a legitimate use case.

**4. Deriving workflow actions from an ordered array, with no hardcoded
stage names.** A naive implementation might special-case "if stage is
'Manager Review', show Approve/Reject" — which breaks the moment an Admin
renames that stage or adds a workflow with a different stage vocabulary
entirely. `workflowTransitions.js` instead only special-cases the *outcome*
stages by name (`isOutcomeStage` checks for "approved"/"rejected"
case-insensitively) and treats everything else as a purely positional,
sequential walk through the array — so `getAvailableActions` works
identically whether the workflow has three stages or eight, and whatever
they're called.

**5. Making a hidden required field never block submission, without losing
its value.** The naive fix for "a `showIf`-hidden field with `required:
true` still fails validation" is to just clear the field when it's hidden —
but that loses the answer if the condition becomes true again later (e.g. a
user toggles a checkbox back and forth). The actual fix,
`unregister(field.id, { keepValue: true, keepError: false })`, drops the
field's validation rules from `react-hook-form`'s tracking while explicitly
preserving its last entered value — a subtlety that isn't obvious from
`react-hook-form`'s default unregister behavior (which drops the value too)
and had to be found via its `keepValue` option.

**6. Keeping three list pages (Forms/Workflows/Submissions) behaviorally
consistent without duplicating logic.** Each list needs its own
search/filter/sort/paginate pipeline, but "the same shape of feature, three
times" easily rots into three subtly different implementations. The
solution was to push each pipeline into its own pure, independently tested
helper module (`formsHelpers.js`, `submissionHelpers.js`) and share the
generic pieces (`utils/pagination.js`'s `paginate()`, the `Pagination`
component, `Spinner`/`ErrorBanner`/`EmptyState`) — so a bug fix or a new
filter option is written and tested once, not per page. The
`/pending-approvals` and `/my-submissions` routes push this further: they
are not separate pages at all, just the same `Submissions` component
rendered with a different `mode` prop.

## 8. Learning Outcomes

Building FormFlow over eight weeks is a concrete, hands-on tour through
several skills a frontend developer needs on real product teams:

- **Schema-driven UI design** — the discipline of representing a UI's
  content as plain data (a field registry mapping `type → Component`)
  instead of hardcoding it, and the tradeoffs that come with it (a new
  field type requires touching exactly two files, not the whole renderer).
- **Drag-and-drop interaction design** with `@dnd-kit` — sensors, draggable
  vs. droppable roles, distinguishing "dragged in from a palette" from
  "reordered within a list" inside one `onDragEnd` handler.
- **Controlled forms at scale** with `react-hook-form` — `useForm`,
  `Controller` (the correct integration point when field components are
  plain prop-driven wrappers rather than `forwardRef` inputs), per-field
  dynamic validation rules, and the `unregister`/`keepValue` mechanics
  needed for conditional fields.
- **Zustand state-management patterns** — multiple independent stores each
  scoped to one concern, selector hooks to avoid over-rendering,
  optimistic vs. awaited mutations, and `persist` middleware for the one
  store that still needs `localStorage`.
- **REST integration with Axios** — a single shared instance, request/
  response interceptors as the place to centralize cross-cutting concerns
  (auth headers, error normalization) instead of repeating them per call
  site.
- **Mock authentication and role-based access control** — modeling a
  session, a bearer token, and per-role UI/permission gating even without a
  real identity provider behind it, in a way that would drop into a real
  backend with minimal change.
- **Code-splitting and memoization** — `React.lazy`/`Suspense` at the route
  level, and `React.memo`/`useMemo`/`useCallback` applied where re-render
  cost is actually measurable (list rows, O(n) dashboard calculations)
  rather than everywhere.
- **Automated testing** — writing Vitest unit tests for pure logic modules
  and Testing-Library integration tests for pages/components, including
  environment-specific workarounds (e.g. `fireEvent.click` over
  `userEvent.click` where a drag library's pointer-sensor listeners
  interfere with simulated events in jsdom).
- **Deployment preparation** — SPA rewrite configuration (`vercel.json`),
  environment-variable-driven API base URLs (`VITE_API_BASE_URL`), and
  understanding what a static host can and can't serve (a long-running
  mock API server needs its own host, unlike the static frontend build).

## 9. Future Scope

The README's Future Enhancements section outlines the natural next steps
beyond this prototype:

- **A real backend.** Replace the local `json-server` + `db.json` mock with
  an actual persistence layer (e.g. Postgres or MongoDB behind a small API
  server), so data survives beyond a single developer's machine and the
  application can be deployed as a fully self-contained product rather than
  a frontend prototype paired with a local mock.
- **Real authentication.** Swap the shared-password mock login for a real
  auth provider — either a JWT-issuing backend with per-user hashed
  credentials, or a third-party OAuth provider — so `authStore`'s token
  actually gets verified server-side instead of merely being shaped like a
  bearer token.
- **Real-time updates.** Add a WebSocket or Server-Sent-Events channel so
  that when a Manager approves or rejects a submission, anyone else already
  viewing that submission's detail view sees the change immediately, instead
  of needing to re-fetch or reopen it.
- **File-upload and signature-capture field types.** Extend the field
  registry with a couple of new entries — a file-upload field and a
  signature-capture field — which the schema-driven architecture is
  designed to absorb without touching the renderer itself.
- **Exportable workflow analytics.** Let the Dashboard's KPI/chart data be
  exported as CSV or PDF, so the same numbers currently only visible in the
  app can be shared in a report or a meeting outside it.
- **Automated end-to-end browser tests.** Add a Playwright suite covering
  the golden path this report walks through in Section 5 (login → build a
  form → link a workflow → submit → approve) end-to-end in a real browser,
  complementing the existing Vitest/Testing-Library unit and integration
  suite rather than replacing it.
