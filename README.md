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
- **Zustand** (global builder state + localStorage persistence)
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

## Routes

| Route           | Page              |
| --------------- | ----------------- |
| `/dashboard`    | Dashboard         |
| `/form-builder` | Form Builder (with DnD) |
| `/workflow`     | Workflow Configuration |
| `/preview`      | Preview (with metadata) |
| `/submissions`  | Submissions       |
| `/components`   | Component Showcase|

## Getting Started

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev

# production build
npm run build

# lint
npm run lint
```

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
│   ├── sidebar.jsx
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
│   │   └── toast.jsx
│   ├── builder/                  # Week 4: Drag-and-drop components
│   │   ├── FieldPalette.jsx      # Draggable field type selection
│   │   ├── SortableCanvas.jsx    # Reorderable field list
│   │   ├── DraggableField.jsx    # Individual draggable field item
│   │   ├── PropertyPanel.jsx     # Field property editor
│   │   └── FormMetadata.jsx      # Form-level settings editor
│   └── viewer/
│       └── JSONViewer.jsx        # Schema inspector modal
├── schemas/
│   └── formSchema.js             # field model, factory + example schemas (enhanced)
├── renderer/                     # schema-driven rendering engine
│   ├── FormRenderer.jsx          # reads schema → renders the form
│   ├── DynamicField.jsx          # one schema field → one component
│   ├── fieldRegistry.js          # type → component map
│   └── fields/                   # per-type field components
│       ├── TextField.jsx         # (enhanced with helpText)
│       ├── TextareaField.jsx     # (enhanced with helpText)
│       ├── SelectField.jsx
│       ├── CheckboxField.jsx
│       └── RadioField.jsx
├── store/
│   └── formStore.js              # Zustand store + localStorage (Week 4: enhanced with metadata, sections, duplication, reordering)
├── layouts/
│   └── MainLayout.jsx
├── pages/
│   ├── components.jsx
│   ├── dashboard.jsx
│   ├── formbuilder.jsx           # DnD-enabled builder with metadata
│   ├── preview.jsx               # preview with metadata + JSON viewer
│   ├── submissions.jsx
│   └── workflow.jsx
└── App.jsx
```


