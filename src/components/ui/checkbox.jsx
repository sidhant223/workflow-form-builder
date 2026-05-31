// src/components/ui/checkbox.jsx
// Reusable Checkbox component with label, checked/onChange control and
// disabled support. Extra native props are spread onto the input.

export default function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  id,
  className = "",
  ...rest
}) {
  const fieldId = id || (label ? `cb-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

  return (
    <label
      htmlFor={fieldId}
      className={`inline-flex items-center gap-2 text-sm text-gray-700 ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${className}`}
    >
      <input
        id={fieldId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
        {...rest}
      />
      {label}
    </label>
  );
}
