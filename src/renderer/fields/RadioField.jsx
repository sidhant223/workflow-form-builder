// src/renderer/fields/RadioField.jsx
// Radio group. Renders one <Radio/> per option, all sharing the field id as
// their `name` so the browser treats them as a single mutually-exclusive group.

import Radio from "../../components/ui/radio";

export default function RadioField({ field, value, onChange, disabled }) {
  const options = field.options || [];

  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      <div className="flex flex-col gap-2 pt-0.5">
        {options.map((opt, index) => (
          <Radio
            key={`${field.id}-${index}`}
            id={`field-${field.id}-${index}`}
            name={`field-${field.id}`}
            label={opt}
            value={opt}
            checked={value === opt}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
          />
        ))}
      </div>
    </div>
  );
}
