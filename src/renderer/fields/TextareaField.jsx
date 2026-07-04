// src/renderer/fields/TextareaField.jsx
// Multi-line text field. Wraps the shared <Textarea/> primitive.

import Textarea from "../../components/ui/textarea";

export default function TextareaField({ field, value, onChange, error, disabled }) {
  return (
    <Textarea
      label={field.label}
      placeholder={field.placeholder}
      helpText={field.helpText}
      required={field.required}
      disabled={disabled}
      error={error}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
