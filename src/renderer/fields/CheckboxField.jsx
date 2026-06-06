// src/renderer/fields/CheckboxField.jsx
// Single boolean checkbox. The field label sits beside the box, with the
// required "*" shown inline. `value` is a boolean here.

import Checkbox from "../../components/ui/checkbox";

export default function CheckboxField({ field, value, onChange, disabled }) {
  return (
    <div className="space-y-1.5">
      <Checkbox
        id={`field-${field.id}`}
        label={
          <span>
            {field.label}
            {field.required && <span className="ml-0.5 text-red-500">*</span>}
          </span>
        }
        checked={!!value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
}
