# Week 5 — Form Engine Design Spec

Source: `Sidhant-Week-5-Task-Details.pdf` (Workflow / Dynamic Form Builder — Week 5 tasks).
Builds on the Week 1–4 app in `workflow-form-builder/` (schema-driven renderer, Zustand
store, drag-and-drop builder).

## Goals

Transform the form builder from a design tool into a working form engine: dynamic
validation, submission handling, conditional fields, multi-step forms, templates, a
real submissions page, and a polished preview/success flow — all 16 tasks in the
source document.

## Scope decisions

1. **Single-form model stays.** The app has never supported a library of multiple
   named forms (Weeks 1–4 only ever built one form at a time in the global Zustand
   store; Dashboard's "Recent Forms" is decorative, hardcoded data). The PDF's
   `"formId": "employee_form"` is illustrative sample data, not a mandate for
   multi-form CRUD. "Submissions" means every time someone fills out *the one form
   currently built* via `/preview`. `formId` is derived by slugifying `formName`
   (fallback `"untitled_form"`) purely to match the storage shape shown in the spec.
   No backend, no auth — everything is local/localStorage, consistent with the rest
   of the app.

2. **Validation config lives on the flat field object**, matching the PDF's example
   schema exactly (`required`, `minLength`, `maxLength` already shown there). New
   properties added the same way: `min`, `max` (numeric range), `pattern`,
   `patternMessage` (regex). No nested `validation: {}` object — keeps
   `formSchema.js` / `PropertyPanel.jsx` changes additive and simple.

   Email format validation is automatic for `type: "email"` — no separate toggle,
   since the field type already communicates the intent ("Email Fields: Enable
   email validation" from the spec is satisfied by field-type selection itself).

3. **React Hook Form via `Controller`, not `register()`.** The existing field
   components (`Input`, `Select`, `Checkbox`, `Radio`, `Textarea`) are plain
   prop-driven wrappers, not `forwardRef`-native inputs, so `Controller` is the
   correct integration point for custom components. `FormRenderer` is rebuilt
   around `useForm()`:
   - `handleSubmit` drives the real submit flow (replaces the ad-hoc
     `onSubmit(values)` callback wired to local `useState`).
   - `formState.errors` renders inline error messages beneath each field.
   - `watch()` provides live field values for two things: real-time validation
     feedback and evaluating `showIf` conditions (see below) — no separate
     mechanism needed for conditional fields.

   The builder canvas (`DraggableField`) does not render live inputs today (just a
   label/type/required summary card) — so this change is scoped to `FormRenderer`
   and anything that mounts it (`/preview`, the multi-step wizard). The builder
   canvas is untouched.

4. **Validation engine** — a pure function `getValidationRules(field)` in
   `src/validation/buildValidationRules.js` maps a field's flat properties to an
   RHF rules object. Length/range checks use RHF's native `required` / `minLength`
   / `maxLength` / `min` / `max` keys; email format and custom regex use RHF's
   `validate` map (composable, avoids collisions between built-in `pattern` and a
   user-supplied one). Error messages match the spec's exact wording ("Name is
   required", "Minimum 3 characters", "Invalid email address", etc.).

5. **Conditional fields** — add `showIf: { field: <fieldId>, value: <matchValue> }`
   (nullable) to the field object. Property panel gets a "Show this field only
   when…" control: a dropdown of other fields, then a value picker (dropdown of
   that field's options if it's select/radio, otherwise a text input). Hidden
   fields are skipped from both rendering and validation in `FormRenderer`.

6. **Multi-step forms reuse the already-scaffolded `sections` array** in
   `formStore.js` (`addSection`/`updateSection`/`removeSection` exist today,
   "prepared for future implementation"). Add `sectionId` (nullable) to fields and
   a step-assignment dropdown in the property panel. Behavior:
   - `sections.length === 0` → form renders single-page, exactly as today. Fully
     backward compatible with every existing saved form.
   - `sections.length > 0` → `FormRenderer` groups fields by `sectionId` (fields
     with no `sectionId` land in the first step) and renders Previous/Next
     controls plus a "Step X of N" progress indicator. One additional **Review &
     Submit** step is auto-appended after the user's own steps, showing a
     read-only summary of every answer before the real Submit button — no extra
     configuration required to get a review step.

7. **Form templates** — new `src/schemas/templates.js` exporting three full form
   bundles (formName/description/fields/sections):
   - **Employee Registration** — Name (required, minLength 3), Email (type email,
     required), Department (select, required).
   - **Leave Request** — Leave Type, Start Date, End Date, Reason; split across two
     steps to double as a live multi-step demo.
   - **Customer Feedback** — Rating (select 1–5), Comments (textarea).

   A "Use Template" button on the Form Builder toolbar opens a small modal listing
   the three templates with a one-line description and a "Create From Template"
   button per card, calling the existing `loadSchema()` store action. No new route
   — this mirrors the existing "Load Sample" button already on that toolbar.

8. **Submissions** — new `src/store/submissionStore.js`, a separate persisted
   Zustand store (kept separate from `formStore` so submission history doesn't get
   wiped by `resetForm()`/schema edits). Shape:
   ```js
   { id, formId, formName, submittedAt, responses, referenceNumber }
   ```
   `referenceNumber` is generated as `FORM-000123` from an incrementing counter
   persisted alongside the submissions array. `/submissions` (`submissions.jsx`,
   currently a static stub) becomes real:
   - Table: Name (best-effort — first text/email-ish field value, else formName) /
     Submitted Date.
   - Search by name/email; filter by Today / Last 7 Days / Last 30 Days.
   - "View Details" opens a modal with the full response (label: value pairs) and
     the reference number.

9. **Preview & success screen** — `/preview` renders the real `FormRenderer`
   (RHF-backed, multi-step aware). On successful submit it records the submission
   via `submissionStore` and shows a dedicated "Thank You" screen (message +
   reference number + "Submit Another Response" reset + link back to the builder),
   replacing today's raw-JSON green confirmation box. The `JSONViewer` dev tool
   stays as-is, unaffected.

10. **Docs** — one `WEEK5-IMPLEMENTATION.md` at the project root (matching the
    existing `WEEK4-IMPLEMENTATION.md` convention), covering: the validation
    concepts research write-up (task 1 deliverable: why validation matters,
    validation types, examples from Google Forms/Microsoft Forms/Typeform),
    architecture notes for validation/conditional/multi-step/submission storage,
    and the testing/screenshot checklist. This also serves as prep material for
    the demo session topics listed in the spec.

## File-level plan

**New files**
- `src/validation/buildValidationRules.js` — schema → RHF rules mapping.
- `src/schemas/templates.js` — the three form templates.
- `src/store/submissionStore.js` — submissions persistence + `addSubmission()`.
- `src/components/builder/ConditionalPanel.jsx` — `showIf` editor (part of Property Panel).
- `src/components/builder/StepPanel.jsx` — step/section assignment + management UI.
- `src/components/builder/TemplatePickerModal.jsx` — template picker.
- Thank You screen: implemented as an inline state within `preview.jsx` (not a new
  route), consistent with how the current submitted-data box already works there.
- `src/components/submissions/SubmissionDetailModal.jsx`.
- `WEEK5-IMPLEMENTATION.md`.

**Modified files**
- `src/schemas/formSchema.js` — add `minLength`, `maxLength`, `min`, `max`,
  `pattern`, `patternMessage`, `showIf`, `sectionId` to `createField()`.
- `src/store/formStore.js` — no structural change expected (sections already exist);
  verify `partialize` includes any new top-level keys if added.
- `src/renderer/FormRenderer.jsx` — rebuilt on `useForm()`/`Controller`, multi-step
  aware, conditional-aware.
- `src/renderer/DynamicField.jsx` and `src/renderer/fields/*.jsx` — accept
  `error` (message string) for inline error display; wire into `Controller`.
- `src/components/builder/PropertyPanel.jsx` — validation fields per type (Min/Max
  Length, Regex + message, Min/Max Value), embeds `ConditionalPanel` and `StepPanel`.
- `src/pages/preview.jsx` — real submit flow, Thank You screen, multi-step progress UI.
- `src/pages/submissions.jsx` — real table, search/filter, view-details modal.
- `src/pages/formbuilder.jsx` — "Use Template" toolbar button + modal wiring.
- `package.json` — add `react-hook-form` dependency.
- `README.md` — Week 5 section.

## Out of scope

- Multi-form library / dashboard-of-forms.
- Backend submission endpoint (localStorage only, per the spec).
- Undo/redo, collaborative editing, form versioning history (already called out as
  future work in `WEEK4-IMPLEMENTATION.md` and not part of the Week 5 task list).
