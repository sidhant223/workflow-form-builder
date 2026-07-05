// src/renderer/fieldRegistry.js
// -----------------------------------------------------------------------------
// The Field Registry maps each schema `type` to the React component that knows
// how to render it. This is the heart of the schema-driven engine: the renderer
// never hard-codes <input/> or <select/> — it just looks the type up here.
//
// Adding a new field type = build a component + add one line below.
// -----------------------------------------------------------------------------

import TextField from "./fields/TextField";
import TextareaField from "./fields/TextareaField";
import SelectField from "./fields/SelectField";
import CheckboxField from "./fields/CheckboxField";
import RadioField from "./fields/RadioField";

const fieldRegistry = {
  text: TextField,
  email: TextField,
  number: TextField,
  password: TextField,
  date: TextField, // <input type="date"> — handled by the same primitive
  textarea: TextareaField,
  select: SelectField,
  checkbox: CheckboxField,
  radio: RadioField,
};

// Resolve a component for a given type (null when the type is unknown).
export function getFieldComponent(type) {
  return fieldRegistry[type] || null;
}
