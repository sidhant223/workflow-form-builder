// src/renderer/fields/TextField.jsx
// Renders the family of single-line inputs driven purely by `field.type`:
// text · email · number · password · date. The shared <Input/> primitive
// forwards `type` to the native element, so one component covers them all.

import Input from "../../components/ui/input";

export default function TextField({ field, value, onChange, disabled }) {
  return (
    <Input
      label={field.label}
      type={field.type}
      placeholder={field.placeholder}
      required={field.required}
      disabled={disabled}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
