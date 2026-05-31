// src/components/ui/radio.jsx
// Reusable Radio component. Group radios together by passing the same `name`.
// Supports label, value, checked/onChange control and disabled state.

export default function Radio({
  label,
  name,
  value,
  checked,
  onChange,
  disabled = false,
  id,
  className = "",
  ...rest
}) {
  const fieldId =
    id || (label ? `r-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

  return (
    <label
      htmlFor={fieldId}
      className={`inline-flex items-center gap-2 text-sm text-gray-700 ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${className}`}
    >
      <input
        id={fieldId}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 border-gray-300 text-violet-600 focus:ring-violet-500"
        {...rest}
      />
      {label}
    </label>
  );
}
