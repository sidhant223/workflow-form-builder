// src/renderer/fields/SelectField.jsx
// Dropdown field. Feeds the field's `options` array into the <Select/> primitive.

import Select from "../../components/ui/select";

export default function SelectField({ field, value, onChange, error, disabled }) {
  return (
    <Select
      label={field.label}
      required={field.required}
      disabled={disabled}
      error={error}
      placeholder={field.placeholder || "Select an option"}
      options={field.options || []}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
