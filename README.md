# Workflow Form Builder

A React-based frontend prototype for a **Workflow & Dynamic Form Builder** application.
It pairs the Week 1 dashboard and **Week 2 reusable UI component library** with a
**Week 3 schema-driven Dynamic Form Rendering Engine**, **Week 4 drag-and-drop form designer**, and a working Form Builder.

## Project Overview

The app lets users build forms visually with an interactive drag-and-drop interface. The Form Builder is fully **schema-driven**: fields are
described as plain JSON, a **field registry** maps each field type to a React
component, and a **dynamic renderer** turns the schema into a live form — no
hard-coded `<input/>` markup. Builder state lives in a global **Zustand** store
that **persists to localStorage**, so a form survives a page refresh.

## Tech Stack

- **React 19** (Vite)
- **Tailwind CSS 4** (`@tailwindcss/vite`)
- **React Router 7**
- **Zustand** (global state; forms/workflows/submissions are now API-backed,
  see Week 7 below)
- **Axios** (REST API layer, see Week 7 below)
- **json-server** (mock REST backend for local development)
- **@dnd-kit** (drag-and-drop toolkit for field reordering and creation)
- **Recharts** (dashboard chart)

## Week 2 Features

### Reusable UI component library (`src/components/ui/`)
- **Button** — `primary` / `secondary` / `danger` / `outline` variants, `sm`/`md`/`lg`
  sizes, hover effects, disabled state, full-width option, prop spreading.
- **Input** — text / number / email / password, with label, placeholder, error
  message and disabled support.
- **Textarea** — same API as Input with a configurable `rows`.
- **Select** — label, placeholder, dynamic options (strings or `{label, value}`),
  error and disabled states.
- **Checkbox** & **Radio** — controlled (`checked` / `onChange`), labelled,
  disabled support; group radios with a shared `name`.
- **Card** — padded, rounded, shadowed container with optional `title`.
- **Modal** — controlled (`isOpen` / `onClose`), overlay, Escape-to-close,
  title, content slot and optional footer.
- **Badge** — `success` / `warning` / `error` / `neutral` status variants.
- **Toast** — `success` / `error` / `info` / `warning`, auto-dismiss + manual close.

### Pages
- **Form Builder** (`/form-builder`) — 3-column layout: field palette, builder
  canvas (with empty state + scroll), property panel built from reusable inputs.
- **Components** (`/components`) — live, interactive showcase of every component.
- Improved **Sidebar** (active-route highlighting, icons) and **Header**
  (dynamic page title, notification icon, profile dropdown).
- Fully responsive (sidebar collapses to a hamburger drawer on mobile).

## Week 3 Features — Dynamic Form Rendering Engine

### Schema-driven UI
Every form is just an array of field objects (`src/schemas/formSchema.js`):

```json
{
  "id": "field_1",
  "type": "text",
  "label": "Full Name",
  "placeholder": "Enter name",
  "required": true,
  "defaultValue": ""
}
```

Supported field types: **text · email · number · password · textarea · dropdown
(select) · checkbox · radio · date**. `select` and `radio` carry an extra
`options` array.

### Field registry (`src/renderer/fieldRegistry.js`)
Maps each schema `type` to the React component that renders it:

```js
const fieldRegistry = {
  text: TextField, email: TextField, number: TextField, password: TextField,
  date: TextField, textarea: TextareaField, select: SelectField,
  checkbox: CheckboxField, radio: RadioField,
};
```

Adding a new field type = build a component + add one line here.

### Dynamic renderer (`src/renderer/`)
- **`FormRenderer.jsx`** — reads the schema, loops through fields, owns the live
  (controlled) values and an optional Submit button.
- **`DynamicField.jsx`** — looks the field's component up in the registry and
  mounts it, wiring `value` / `onChange`.

The same engine powers both the builder canvas preview and the `/preview` page.

### Global state (`src/store/formStore.js`)
A **Zustand** store is the single source of truth for the schema:

| Action | Purpose |
| ------ | ------- |
| `addField(type)` | auto-generate a field and append it |
| `removeField(id)` | delete a field |
| `updateField(id, data)` | patch a field's properties |
| `selectField(id)` | open a field in the property panel |
| `resetForm()` | clear the form |
| `loadSchema(fields)` | load an example schema |

The `persist` middleware mirrors the schema to **localStorage** (`form-builder-schema`),
so refreshing the page reloads the form automatically.

### Builder workflow
- **Field palette** — click a field type to add it to the canvas.
- **Builder canvas** — renders each field with the real UI components, shows an
  empty state (“No fields added yet”), a selected-field highlight, and a delete
  button per card.
- **Property panel** — edit label, placeholder, default value, required, and
  (for dropdown/radio) the option list; changes reflect live.
- **Preview** (`/preview`) — renders the final, interactive form with a Submit
  button; submitting prints the captured values.

### Dynamic rendering flow

```
Field palette click
      │  addField(type)
      ▼
Zustand store (fields[])  ──persist──►  localStorage
      │
      ▼
FormRenderer  ──maps──►  DynamicField  ──registry lookup──►  Field component
```

## Week 4 Features — Drag-and-Drop & Advanced Form Design

### Drag-and-Drop Functionality
- **@dnd-kit integration** — industry-standard drag-and-drop library
- **Field palette drag source** — drag field types from left panel
- **Canvas drop target** — drop fields to create new form fields
- **Sortable canvas** — reorder fields by dragging within canvas
- **Smooth animations** — visual feedback during drag operations

### Field Operations
- **Field duplication** — duplicate button creates exact copy with unique ID
- **Smart naming** — duplicated fields append " Copy" to label
- **Field reordering** — drag fields to change order in form
- **Instant updates** — all changes immediately reflect in store and preview

### Enhanced Property Panel
- **Label editing** — change field labels
- **Placeholder configuration** — set field placeholder text
- **Default values** — pre-fill fields with default values
- **Help text support** — add instructional text below fields
- **Required toggle** — mark fields as required
- **Option management** — add/edit/remove options for dropdowns and radio buttons
- **Quick actions** — duplicate and delete buttons for convenience

### Form Metadata Management
- **Form title/name** — set form title
- **Form description** — add form description
- **Author tracking** — record who created the form
- **Version management** — track form versions
- **Metadata display** — shows on preview page

### Enhanced Preview Page
- **Form header** — displays title and description
- **Metadata info** — shows author and version
- **Help text rendering** — displays help text on fields
- **Professional layout** — polished form presentation
- **Form submission** — captures and displays submitted data

### Debugging Tools
- **JSON Schema Viewer** — floating button shows live JSON schema
- **Real-time inspection** — view complete form structure
- **Copy to clipboard** — easily export schema
- **Schema includes metadata** — full form data visible

### UI/UX Improvements
- **Better spacing** — improved visual hierarchy
- **Hover effects** — interactive field cards
- **Selection highlighting** — blue highlight for selected fields
- **Grab cursor** — indicates draggable items
- **Empty states** — helpful messages for empty forms
- **Emoji icons** — visual indicators for field types
- **Responsive design** — works on all screen sizes

## Week 5 Features — Validation, Submission & Multi-Step Engine

### Dynamic Validation
- Schema-driven validation engine (`src/validation/buildValidationRules.js`)
  generates react-hook-form rules from each field's flat schema properties:
  required, min/max length, numeric range, email format, and custom regex.
- `FormRenderer` is now built on `react-hook-form` (`useForm` + `Controller`),
  with inline error messages rendered beneath each field.

### Conditional Fields
- Any field can declare `showIf: { field, value }` to only appear when another
  field's live value matches. Configurable per field in the Property Panel.

### Multi-Step Forms
- Forms can be split into steps by reusing the builder's existing section
  concept — assign each field to a step in the Property Panel. Multi-step forms
  get Previous/Next navigation, a progress indicator, and an automatic
  Review & Submit step.

### Form Templates
- Three ready-made templates (Employee Registration, Leave Request, Customer
  Feedback) loadable from the Form Builder's "Use Template" button.

### Submission Storage & Management
- Every `/preview` submission is recorded (separate `submissionStore.js`,
  localStorage-backed) with a generated reference number.
- `/submissions` now shows real data: search by name/form, filter by date, and
  view full response details per submission.

See `WEEK5-IMPLEMENTATION.md` for the full write-up (validation research,
architecture notes, testing strategy, and the demo/screenshot checklist).

## Week 6 Features — Workflow Management System

### Workflow Configuration
- `/workflow` lets you create named workflows and add/edit/delete/reorder
  their stages (e.g. Draft → Submitted → Manager Review → Approved/Rejected).
  Only the simulated Admin role can edit; other roles see a read-only view.

### Linking Workflows to Forms
- Attach a workflow to a form from the Form Builder's Form Settings panel —
  every submission of that form then starts its life in the workflow's first
  stage.

### State Transitions & Actions
- `workflowTransitions.js` derives valid next moves from a workflow's stage
  list: sequential advance through review stages, Approve/Reject as a branch
  before the terminal "Approved"/"Rejected" stages, no actions once terminal.
  Action buttons on a submission change dynamically to match.

### Timeline, History & Comments
- Every submission tracks a full audit trail — stage, action, user, and an
  optional comment per transition — visualized as a timeline on its detail
  page. Approve/Reject actions prompt for a comment before completing.

### Role Simulation & Task Assignment
- A header dropdown simulates being logged in as Admin, Manager, or Employee
  (no real auth) — this gates which workflow actions are available. Submissions
  can be assigned to a mock user for review.

### Workflow Dashboard & Notifications
- `/dashboard` now shows real KPI cards (Pending Reviews, Approved Today,
  Rejected, Draft Forms) and two live charts (Forms by Status, Workflow
  Distribution). Toast notifications fire on submission and every workflow
  action.

See `WEEK6-IMPLEMENTATION.md` for the full write-up (workflow concepts,
architecture notes, testing strategy, and the demo/screenshot checklist).

## Week 7 Features — API Integration, Authentication & Production Readiness

### REST API Layer
- `src/services/api.js` — a shared Axios instance (base URL, headers,
  10s timeout, a request interceptor attaching a mock bearer token, and a
  response interceptor normalizing every error into `{ message, status }`).
- `formService.js` / `workflowService.js` / `submissionService.js` — thin
  `getX`/`createX`/`updateX`/`deleteX` wrappers per resource, backed by a
  local **json-server** mock REST API (`db.json`).
- `formsStore` (the saved-forms list — distinct from the Form Builder's
  in-progress draft), `workflowStore`, and `submissionStore` all fetch from
  and persist to this API instead of localStorage.

### Authentication & Protected Routes
- `/login` matches email/password against three mock accounts
  (`admin@test.com` / `manager@test.com` / `employee@test.com`, password
  `password123`), session persisted to `sessionStorage`.
- Every other route sits behind `ProtectedRoute`, which redirects signed-out
  visitors to `/login` and returns them to where they were headed after
  signing in.

### Role-Based Navigation
- The sidebar now shows a different set of links per simulated role
  (Employee: Dashboard/Forms/My Submissions; Manager: Dashboard/Pending
  Approvals/Workflows; Admin: Dashboard/Forms/Workflows/User Management).

### Data Management
- **Forms** (`/forms`) — a new page listing saved forms with search, status/
  date filters, sort, and per-role actions (Admin: New/Edit/Delete; everyone:
  Fill Form). The Form Builder gained Save/Publish buttons wired to this API.
- **Submissions** — search now also matches response values (e.g. email),
  plus a stage filter (Approved/Pending/Rejected).
- **Pagination** — Forms, Workflows, and Submissions are all paginated.

### Loading, Error & Empty States
- Shared `Spinner`/`ErrorBanner`/`EmptyState` components across every list
  page, and a global `ErrorBoundary` around the whole app.

### Performance
- Every route is code-split via `React.lazy`/`Suspense`; list rows and
  Dashboard's stat/chart calculations are memoized (`React.memo`, `useMemo`,
  `useCallback`) so unrelated re-renders don't redo unrelated work.

See `WEEK7-IMPLEMENTATION.md` for the full write-up (REST API research
notes, architecture decisions, testing strategy, and the demo/screenshot
checklist).

## Routes

| Route                | Page                          | Access          |
| --------------------- | ----------------------------- | --------------- |
| `/login`              | Login                         | Public          |
| `/dashboard`          | Dashboard                     | All roles       |
| `/forms`              | Forms List                    | All roles       |
| `/form-builder`       | Form Builder (with DnD)       | All roles       |
| `/workflow`           | Workflow Configuration        | All roles (edit: Admin) |
| `/preview`            | Preview (with metadata)       | All roles       |
| `/submissions`        | Submissions                   | All roles       |
| `/pending-approvals`  | Pending Approvals (scoped)    | All roles       |
| `/my-submissions`     | My Submissions (scoped)       | All roles       |
| `/user-management`    | User Management (placeholder) | All roles       |
| `/components`         | Component Showcase            | All roles       |

All routes except `/login` require an authenticated session; the sidebar
only *links* to the subset relevant to the current simulated role (see
Week 7 → Role-Based Navigation above).

## Getting Started

```bash
# install dependencies
npm install

# start the mock API (http://localhost:4000) AND the dev server (http://localhost:5173) together
npm run dev:all

# — or run them separately —
npm run server   # mock REST API only
npm run dev      # Vite dev server only

# production build
npm run build

# lint
npm run lint

# tests
npm run test
```

Sign in at `/login` with any of the demo accounts shown on the page
(password `password123` for all three). The API base URL defaults to
`http://localhost:4000`; override it with a `VITE_API_BASE_URL` env var if
you point the app at a different backend.

## Screenshots

> Add screenshots here for submission:
> - Components page (buttons, inputs, dropdowns)
> - Form Builder page (left palette, center canvas, right property panel)
> - Responsive mobile view (collapsed sidebar / hamburger)

| Components Page | Form Builder | Mobile View |
| --------------- | ------------ | ----------- |
| _screenshot_    | _screenshot_ | _screenshot_|

## Project Structure

```
src/
├── components/
│   ├── header.jsx
│   ├── sidebar.jsx                # role-based nav (Week 7)
│   ├── ProtectedRoute.jsx         # auth route guard (Week 7)
│   ├── ErrorBoundary.jsx          # global error boundary (Week 7)
│   ├── ui/                       # reusable component library
│   │   ├── badge.jsx
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── checkbox.jsx
│   │   ├── input.jsx             # (enhanced with helpText)
│   │   ├── modal.jsx
│   │   ├── radio.jsx
│   │   ├── select.jsx
│   │   ├── textarea.jsx          # (enhanced with helpText)
│   │   ├── toast.jsx
│   │   ├── spinner.jsx           # loading spinner (Week 7)
│   │   ├── emptyState.jsx        # "No X Available" placeholder (Week 7)
│   │   ├── errorBanner.jsx       # error message + Retry (Week 7)
│   │   └── pagination.jsx        # Previous/1 2 3/Next control (Week 7)
│   ├── builder/                  # Week 4: Drag-and-drop components
│   │   ├── FieldPalette.jsx      # Draggable field type selection
│   │   ├── SortableCanvas.jsx    # Reorderable field list
│   │   ├── DraggableField.jsx    # Individual draggable field item
│   │   ├── PropertyPanel.jsx     # Field property editor
│   │   └── FormMetadata.jsx      # Form-level settings editor
│   ├── workflow/                 # Week 6: workflow UI
│   │   ├── WorkflowStageEditor.jsx
│   │   ├── WorkflowTimeline.jsx
│   │   ├── WorkflowActions.jsx
│   │   └── CommentDialog.jsx
│   ├── submissions/
│   │   ├── SubmissionDetailModal.jsx
│   │   └── SubmissionRow.jsx      # memoized list row (Week 7)
│   ├── forms/
│   │   └── FormRow.jsx            # memoized list row (Week 7)
│   └── viewer/
│       └── JSONViewer.jsx        # Schema inspector modal
├── services/                     # REST API layer (Week 7)
│   ├── api.js                    # shared Axios instance + interceptors
│   ├── formService.js
│   ├── workflowService.js
│   └── submissionService.js
├── schemas/
│   ├── formSchema.js             # field model, factory + example schemas
│   ├── templates.js              # form templates
│   └── workflowSchema.js
├── renderer/                     # schema-driven rendering engine
│   ├── FormRenderer.jsx          # reads schema → renders the form
│   ├── DynamicField.jsx          # one schema field → one component
│   ├── fieldRegistry.js          # type → component map
│   ├── conditionalVisibility.js
│   ├── formSteps.js
│   └── fields/                   # per-type field components
│       ├── TextField.jsx
│       ├── TextareaField.jsx
│       ├── SelectField.jsx
│       ├── CheckboxField.jsx
│       └── RadioField.jsx
├── validation/
│   └── buildValidationRules.js
├── workflow/
│   ├── workflowTransitions.js
│   ├── rolePermissions.js        # canPerformAction/canConfigureWorkflows/canManageForms
│   ├── dashboardStats.js
│   └── stageBadge.js
├── navigation/
│   └── navItems.js                # role → sidebar links (Week 7)
├── utils/
│   ├── slugify.js
│   └── pagination.js              # paginate() helper (Week 7)
├── store/
│   ├── formStore.js               # Form Builder's single in-progress draft (localStorage)
│   ├── formsStore.js              # saved-forms list, API-backed (Week 7)
│   ├── formsHelpers.js            # Forms search/filter/sort (Week 7)
│   ├── workflowStore.js           # API-backed (Week 7)
│   ├── submissionStore.js         # API-backed (Week 7)
│   ├── submissionHelpers.js
│   └── authStore.js               # mock auth + session (Week 7)
├── layouts/
│   └── MainLayout.jsx
├── pages/
│   ├── components.jsx
│   ├── dashboard.jsx
│   ├── login.jsx                  # Week 7
│   ├── forms.jsx                  # Week 7
│   ├── formbuilder.jsx            # DnD-enabled builder, now with Save/Publish
│   ├── preview.jsx
│   ├── submissions.jsx            # also powers pendingApprovals/mySubmissions via `mode`
│   ├── pendingApprovals.jsx       # Week 7
│   ├── mySubmissions.jsx          # Week 7
│   ├── userManagement.jsx         # Week 7 (placeholder)
│   └── workflow.jsx
├── main.jsx                       # wraps <App/> in <ErrorBoundary>
└── App.jsx                        # lazy-loaded routes behind ProtectedRoute
```
