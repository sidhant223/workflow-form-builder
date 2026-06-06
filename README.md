# Workflow Form Builder

A React-based frontend prototype for a **Workflow & Dynamic Form Builder** application.
It pairs the Week 1 dashboard and **Week 2 reusable UI component library** with a
**Week 3 schema-driven Dynamic Form Rendering Engine** and a working Form Builder.

## Project Overview

The app lets users build forms visually and manage workflow stages through a
responsive dashboard. The Form Builder is fully **schema-driven**: fields are
described as plain JSON, a **field registry** maps each field type to a React
component, and a **dynamic renderer** turns the schema into a live form — no
hard-coded `<input/>` markup. Builder state lives in a global **Zustand** store
that **persists to localStorage**, so a form survives a page refresh.

## Tech Stack

- **React 19** (Vite)
- **Tailwind CSS 4** (`@tailwindcss/vite`)
- **React Router 7**
- **Zustand** (global builder state + localStorage persistence)
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

## Routes

| Route           | Page              |
| --------------- | ----------------- |
| `/dashboard`    | Dashboard         |
| `/form-builder` | Form Builder      |
| `/workflow`     | Workflow          |
| `/preview`      | Preview           |
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
│   └── ui/                # reusable component library
│       ├── badge.jsx
│       ├── button.jsx
│       ├── card.jsx
│       ├── checkbox.jsx
│       ├── input.jsx
│       ├── modal.jsx
│       ├── radio.jsx
│       ├── select.jsx
│       ├── textarea.jsx
│       └── toast.jsx
├── schemas/
│   └── formSchema.js      # field model, factory + example schemas
├── renderer/              # schema-driven rendering engine
│   ├── FormRenderer.jsx   # reads schema → renders the form
│   ├── DynamicField.jsx   # one schema field → one component
│   ├── fieldRegistry.js   # type → component map
│   └── fields/            # per-type field components
│       ├── TextField.jsx
│       ├── TextareaField.jsx
│       ├── SelectField.jsx
│       ├── CheckboxField.jsx
│       └── RadioField.jsx
├── store/
│   └── formStore.js       # Zustand store + localStorage persistence
├── layouts/
│   └── MainLayout.jsx
├── pages/
│   ├── components.jsx
│   ├── dashboard.jsx
│   ├── formbuilder.jsx    # palette · canvas · property panel
│   ├── preview.jsx        # final form preview + submit
│   ├── submissions.jsx
│   └── workflow.jsx
└── App.jsx
```


