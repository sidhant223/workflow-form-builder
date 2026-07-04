# Week 5 Implementation Summary — Form Engine

## 1. Why Validation Matters

A form with no validation silently accepts garbage: empty required answers, malformed
emails, out-of-range numbers. That pushes the cost of catching bad data downstream —
onto whoever has to read the responses — instead of catching it at the moment the
person filling out the form can still fix it. Client-side validation also gives
immediate feedback (no round trip needed) and reduces frustration versus a form that
only reports "something went wrong" after submission.

## 2. Validation Types Implemented

| Type | Config | Example message |
| --- | --- | --- |
| Required | `required: true` | "Full Name is required" |
| Minimum length | `minLength: 3` | "Minimum 3 characters" |
| Maximum length | `maxLength: 50` | "Maximum 50 characters" |
| Email format | `type: "email"` (automatic) | "Invalid email address" |
| Numeric range | `min` / `max` on a Number field | "Minimum: 1" / "Maximum: 100" |
| Regex pattern | `pattern` + `patternMessage` | e.g. "10 digits only" |

All rules are generated from the flat field schema by
`src/validation/buildValidationRules.js` and fed to `react-hook-form` as per-field
rules via `<Controller rules={...}>`. Validation runs on blur, revalidates live once
a field has been touched, and always re-runs in full on submit.

## 3. Examples From Popular Form Systems

- **Google Forms** — per-question "Required" toggle, plus response-type validation
  (number range, text length, regex) configurable per question; shows inline errors
  beneath the offending question on submit.
- **Microsoft Forms** — similar per-question required/format rules; also supports
  branching ("Go to section based on answer"), which this app's `showIf` conditional
  fields and multi-step sections mirror.
- **Typeform** — one question per screen (informed the multi-step wizard design
  here), with logic jumps that skip/show later questions based on earlier answers —
  the direct inspiration for `showIf`.

## 4. Architecture Notes

- **Validation engine**: `src/validation/buildValidationRules.js` — pure function,
  schema in, react-hook-form rules out. Unit tested in isolation.
- **React Hook Form integration**: `src/renderer/FormRenderer.jsx` uses `useForm()`
  (`handleSubmit`, `formState.errors`, `watch`, `trigger`, `getValues`) with
  `Controller` wrapping each schema-driven field component (the field components are
  plain prop-driven wrappers, not `forwardRef` inputs, so `Controller` — not
  `register()` — is the correct integration point). The `<form>` sets `noValidate`
  so the browser's native constraint validation (triggered by the `required`
  attribute on inputs, for accessibility/semantics) never intercepts submission
  before react-hook-form's own validation runs.
- **Conditional fields**: a field's `showIf: { field, value }` is evaluated against
  `watch()`'s live values via `src/renderer/conditionalVisibility.js`. Hidden fields
  are unregistered (`unregister(name, { keepValue: true })`) so a hidden required
  field can never block submission, while its value survives if the field becomes
  visible again.
- **Multi-step forms**: reuse the `sections` array already scaffolded in
  `formStore.js`. `src/renderer/formSteps.js` groups fields by `sectionId`.
  `FormRenderer` renders Previous/Next + a "Step X of N" progress bar, and always
  appends one extra **Review & Submit** step summarizing every answer before the
  real submit button. Forms with no sections render exactly as they always have —
  single page, no wizard chrome.
- **Submission storage**: `src/store/submissionStore.js` (a separate persisted
  Zustand store from the builder's own `formStore.js`, so submission history
  survives a form reset/edit) records `{ id, formId, formName, displayName,
  submittedAt, responses, referenceNumber }` on every successful preview submit.
  `formId` is a slug of the form's name (`src/utils/slugify.js`).
- **Template loading**: `src/schemas/templates.js` exports full `loadSchema()`-ready
  bundles (fields + sections + metadata) for Employee Registration, Leave Request
  (a live 2-step demo), and Customer Feedback. `TemplatePickerModal` calls the
  existing `loadSchema()` store action — no new persistence mechanism. (Loading this
  also exposed and fixed a pre-existing bug: the "Load Sample" button was calling
  `loadSchema()` with a bare array instead of `{ fields: [...] }`, so it silently
  loaded an empty form.)

## 5. Testing Strategy

Pure logic (validation rules, conditional visibility, step grouping, submission
helpers, the submission store itself) has Vitest unit tests. `FormRenderer` — the
piece where validation, conditional fields, and multi-step interact — has
Testing-Library tests covering required/format validation, conditional show/hide
(including that a field's validation is dropped once it's hidden again), and the
full multi-step-to-review-to-submit flow. The Form Builder, Preview, and
Submissions pages each have Testing-Library integration tests exercising the new
Week 5 wiring end-to-end (loading a template onto the canvas, configuring
validation/conditional/step settings, submitting and recording a response, search
and filtering submissions) — no manual browser session was available in this
environment, so these automated integration tests are the verification evidence in
place of a click-through.

One jsdom-specific quirk surfaced while writing the Form Builder tests: a
draggable field card's root element carries `@dnd-kit`'s pointer-sensor listeners,
which swallow `userEvent`'s simulated pointerdown/pointerup/click sequence before
the card's own `onClick` fires. Field-selection clicks in those tests use
`fireEvent.click` (a bare click event) instead — this is a test-environment
workaround, not a product behavior change; a real browser click is unaffected.

Run `npm run test` for the automated suite (57 tests across 14 files at the time of
writing).

## 6. Screenshots Checklist

- **Form Builder** — validation settings in the property panel.
- **Preview Page** — an inline error message; multi-step navigation.
- **Submission Page** — the response list; a single response's detail view.
- **Conditional Fields** — before the condition is met; after.

## 7. Demo Session Prep

1. **Validation architecture** — walk through `buildValidationRules.js` and how a
   field's flat schema properties become RHF rules.
2. **React Hook Form integration** — `useForm`, `Controller`, `formState.errors`,
   `watch()` doing double duty for live errors and conditional visibility.
3. **Conditional rendering logic** — `showIf` + `isFieldVisible` + the
   unregister-on-hide fix.
4. **Multi-step form implementation** — `sections` reuse, `groupFieldsBySection`,
   the auto-appended review step.
5. **Submission storage structure** — the `submissionStore.js` shape and why it's a
   separate store from the builder schema.
6. **Template loading mechanism** — `templates.js` bundles feeding the existing
   `loadSchema()` action.
