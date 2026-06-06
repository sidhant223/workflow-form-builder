// src/components/ui/select.jsx
// Reusable Select / Dropdown component.
// `options` accepts an array of strings OR { label, value } objects.
// Supports: label, placeholder, error message, disabled state, dynamic options.

export default function Select({
  label,
  options = [],
  placeholder,
  error,
  disabled = false,
  required = false,
  id,
  className = "",
  ...rest
}) {
  const fieldId = id || (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);

  const normalized = options.map((opt) =>
    typeof opt === "object" ? opt : { label: opt, value: opt }
  );

  // Only fall back to a placeholder defaultValue when the caller isn't driving
  // the select with a controlled `value` — avoids React's controlled/uncontrolled warning.
  const isControlled = rest.value !== undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <select
        id={fieldId}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        defaultValue={!isControlled && placeholder ? "" : undefined}
        className={`w-full rounded-lg border bg-white p-2.5 text-sm text-gray-900 transition-colors
          focus:outline-none focus:ring-2
          disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400
          ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:border-violet-500 focus:ring-violet-300"
          } ${className}`}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {normalized.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
