# Reusable Component Design — Notes

## What are reusable components?

Reusable components are self-contained pieces of UI that are written once and
used in many places. They expose their behaviour and appearance through
**props** instead of hard-coding values, so the same component can render
differently depending on where it is used (for example one `<Button>` that can
be primary, danger or outline).

## Why are they useful?

- **Consistency** — every button, input and badge looks and behaves the same
  across the whole app.
- **Less duplication (DRY)** — fix or restyle a component in one file and the
  change propagates everywhere.
- **Faster development** — pages are assembled from existing building blocks.
- **Easier testing & maintenance** — small, focused components are simpler to
  reason about.

## Key React concepts used

- **Props** — inputs to a component (`variant`, `size`, `label`, `options`,
  `disabled`, `onClick`, …). They are read-only from the component's side.
- **State vs Props** — *props* are passed in by a parent and don't change inside
  the component; *state* (`useState`) is data a component owns and updates over
  time (e.g. `isModalOpen`, the list of form fields). In this project the Form
  Builder keeps the field list in **state**, while the reusable inputs receive
  their current value as **props**.
- **Composition** — building bigger UI by nesting components and passing
  `children`. For example `<Card>`, `<Modal>` and the showcase page wrap other
  components rather than re-implementing layout each time.
- **Prop spreading (`...rest`)** — forwarding native attributes (`onChange`,
  `name`, `type`) so the wrappers stay flexible.

## Examples from this project

- **Button** used everywhere (showcase, modal footer, form builder).
- **Modal** reused for confirmation dialogs via `isOpen` / `onClose`.
- **Input / Select / Checkbox** reused in the showcase *and* the Form Builder
  property panel.
