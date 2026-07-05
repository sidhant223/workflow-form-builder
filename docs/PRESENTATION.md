# Presentation Deck — Workflow / Dynamic Form Builder

Slide-by-slide content for the final (Week 8) project presentation. Paste each
section into its own slide; bullets are written to fit on-screen, not as
paragraphs.

---

## Slide 1 — Title

- **Workflow / Dynamic Form Builder**
- A schema-driven form builder with a configurable workflow approval engine
- 8-Week Internship Project — React 19 Frontend Prototype
- [Your Name] · [Date]

---

## Slide 2 — Project Overview

- A React app that lets users visually build forms with a drag-and-drop
  designer — no hard-coded `<input/>` markup anywhere
- Forms are pure JSON schemas rendered by a shared field registry, so the
  same engine powers the builder canvas, `/preview`, and live submission
- Every form can be linked to a multi-stage workflow, so a submission moves
  through Draft → Review → Approved/Rejected with a full audit trail
- Three simulated roles (Admin, Manager, Employee) see different navigation
  and different workflow actions
- Backed by a REST API layer (Axios + json-server) with authentication and
  protected routes

---

## Slide 3 — Objectives

- Build a reusable, prop-driven UI component library as the foundation for
  every screen
- Build a schema-driven Dynamic Form Rendering Engine (field registry +
  renderer) instead of one-off form markup
- Add drag-and-drop visual form design with field reordering, duplication,
  and a live property panel
- Layer in validation, conditional field visibility, and multi-step wizard
  forms
- Model a configurable workflow engine: stages, state transitions, role
  permissions, and an audit-trail timeline
- Integrate a REST API, authentication, and production polish — tested,
  documented, and deployable

---

## Slide 4 — Technology Stack

- **React 19** (Vite) — component framework and dev tooling
- **Tailwind CSS 4** (`@tailwindcss/vite`) — utility-first styling, single
  violet accent theme
- **React Router 7** — routing, nested layouts, protected routes
- **Zustand** — global state (form draft, saved forms, workflows,
  submissions, auth), several stores API-backed rather than localStorage
- **react-hook-form** — schema-driven validation and controlled field wiring
- **@dnd-kit** (core/sortable/utilities) — drag-and-drop field palette and
  canvas reordering
- **Recharts** — Dashboard bar and pie charts
- **Axios + json-server** — REST API layer and local mock backend
- **Vitest + Testing Library** — unit and integration test suite

---

## Slide 5 — System Architecture

*[insert architecture diagram here]*

A simple layered flow, top to bottom:

- **Schemas** — `formSchema.js` / `workflowSchema.js` / `templates.js` define
  the plain-JSON shape of a field, a workflow, and a form template
- **Renderer & Stores** — `FormRenderer` + `DynamicField` + `fieldRegistry`
  turn a schema into a live form; Zustand stores (`formStore`, `formsStore`,
  `workflowStore`, `submissionStore`, `authStore`) hold and mutate that state
- **Services / API** — a shared Axios instance with request/response
  interceptors, wrapped by per-resource services (`formService`,
  `workflowService`, `submissionService`) that talk to the json-server mock
  backend
- **Pages / Routing** — React Router pages behind `ProtectedRoute`, with a
  role-aware `Sidebar` and `Header` composing everything above into screens

---

## Slide 6 — Application Screens

Screenshots to include for this slide:

- Login (demo accounts + sign-in form)
- Dashboard (KPI cards + Forms by Status / Workflow Distribution charts)
- Form Builder (palette, canvas, property panel)
- Workflow Configuration (stage editor)
- Submissions (search/filter/pagination + detail view)
- Workflow Timeline (a submission's approval history)

---

## Slide 7 — Features Implemented

- Schema-driven Dynamic Form Rendering Engine — 9 field types through one
  field registry, shared by the builder, preview, and live forms
- Drag-and-drop Form Builder (@dnd-kit) — reorder, duplicate, and configure
  fields; form templates and a JSON schema viewer for debugging
- Validation engine (react-hook-form) + conditional field visibility
  (`showIf`) + multi-step wizard forms with an auto-generated review step
- Workflow Configuration (stage CRUD/reorder) + a state-transition engine
  (advance/approve/reject) gated by role permissions
- REST API integration (Axios + json-server) with authentication, protected
  routes, and role-based sidebar navigation
- Search/filter/sort/pagination across Forms, Workflows, and Submissions,
  with shared loading/error/empty states, a global error boundary, and a
  responsive mobile layout

---

## Slide 8 — Challenges & Solutions

- **Challenge:** field components are plain prop-driven wrappers, not
  `forwardRef` inputs, so react-hook-form's `register()` couldn't wire them
  directly. **Solution:** integrate via `Controller` instead.
- **Challenge:** a hidden conditional field with `required: true` could still
  block form submission. **Solution:** `unregister(name, { keepValue: true })`
  on hide, so hidden fields never validate but keep their value if shown again.
- **Challenge:** the whole app had converged on a violet accent, but the Form
  Builder still had leftover `blue-*` Tailwind classes from early prototyping
  — a visible inconsistency. **Solution:** recolored every builder component
  to match the shared violet theme.
- **Challenge:** `window.confirm()` for delete actions looked inconsistent
  with the styled UI and couldn't be reliably unit-tested. **Solution:** a
  reusable `ConfirmDialog` component built on the existing `Modal` primitive.
- **Challenge:** choosing one sync strategy for every API mutation didn't fit
  every action's stakes. **Solution:** background-sync (instant local update,
  persist after) for frequent workflow/stage edits; await-then-commit for
  explicit, infrequent Save/Delete actions on forms.

---

## Slide 9 — Future Scope

- Replace the mock `json-server` backend with a real persistence layer
  (Postgres/MongoDB + a small API server)
- Replace mock email/password authentication with a real auth provider (JWT
  or OAuth) and per-user hashed credentials
- Real-time updates (WebSocket/SSE) so an Approve/Reject action is reflected
  live for anyone else viewing that submission
- Field-level file upload / signature-capture field types for the Form
  Builder
- Exportable workflow analytics (CSV/PDF) from the Dashboard
- Automated end-to-end browser tests (Playwright) covering the golden path:
  login → build a form → submit → approve

---

## Slide 10 — Conclusion

- Delivered a full front-end prototype of a schema-driven form builder paired
  with a configurable workflow approval engine, built incrementally over 8
  weeks
- Progressed from a reusable component library, to a dynamic rendering
  engine, to drag-and-drop design, validation and conditional logic, a
  workflow state machine, REST/auth integration, and final polish
- Backed by an automated Vitest/Testing-Library suite and a clean production
  build, with `vercel.json` in place for one-click deployment
- Demonstrates that a form is more useful as a *process* — data collection
  plus a defined approval lifecycle — than as a one-shot data entry screen

---

## Slide 11 — Live Demo

- Switch to the running application
- Follow `docs/DEMO_SCRIPT.md` for the full walkthrough (Login → Dashboard →
  Form Builder → Workflow → Submission → Approval → Responsive view)

---

## Slide 12 — Q&A

- Questions & Discussion
- Happy to go deeper into any layer — schema design, the workflow state
  machine, the API/auth layer, or the testing strategy
