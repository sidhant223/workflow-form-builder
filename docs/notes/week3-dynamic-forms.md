# Dynamic Form Rendering — Week 3 Notes

## What is schema-driven UI?

Schema-driven UI means the interface is **described by data** (a JSON schema)
rather than written by hand in JSX. Instead of hard-coding markup like:

```jsx
<input />
<select />
<textarea />
```

we describe each field as a plain object…

```json
[{ "id": "name", "type": "text", "label": "Full Name", "required": true }]
```

…and a generic **renderer** walks that array and produces the matching React
components automatically. The component to use for each `type` comes from a
**field registry** (`{ text: TextField, select: SelectField, … }`), so the
renderer never needs to know about specific field types.

Key React concepts that make this work:

- **JSON / schema-driven rendering** — UI = `schema.map(field => <Component />)`.
- **Component mapping (registry pattern)** — a lookup table from `type` → component.
- **Controlled components** — every input's value lives in state and flows back
  through `onChange`, so the form has a single source of truth.
- **Dynamic rendering** — the same code renders any form; change the data, not
  the code.

## Benefits of dynamic forms

- **No code changes to add a form** — ship new forms by editing/serving JSON.
- **Reusable & DRY** — one renderer handles every field type and every form.
- **Consistent** — all forms share the same components, styling and behaviour.
- **Easy to persist & transport** — a form is just JSON: store it in
  localStorage or a database, send it over an API, version it.
- **Extensible** — adding a field type is one component + one registry line.
- **Separation of concerns** — *what* the form contains (schema) is decoupled
  from *how* it renders (components).

## Real-world examples

- **Google Forms / Microsoft Forms / Typeform** — users build forms visually; the
  structure is stored as data and rendered dynamically.
- **JSON Forms / react-jsonschema-form** — open-source libraries that render
  forms from a JSON Schema.
- **Survey platforms (SurveyMonkey, Qualtrics)** — questionnaires defined as data.
- **CMS / low-code builders (Webflow, Retool, Salesforce)** — admin-configured
  fields rendered at runtime.
- **Checkout / onboarding flows** — country-specific fields driven by config so
  the same UI adapts without redeploying.

## How it maps to this project

| Concept | Where it lives |
| ------- | -------------- |
| Schema model + examples | `src/schemas/formSchema.js` |
| Field registry (type → component) | `src/renderer/fieldRegistry.js` |
| Dynamic renderer | `src/renderer/FormRenderer.jsx`, `DynamicField.jsx` |
| Field components | `src/renderer/fields/*` |
| Global state + persistence | `src/store/formStore.js` (Zustand + localStorage) |
| Builder UI | `src/pages/formbuilder.jsx` |
| Live preview | `src/pages/preview.jsx` |
