// src/components/ui/textarea.jsx
// Reusable Textarea component with the same API surface as Input
// (label, placeholder, error, disabled) plus a `rows` prop.

export default function Textarea({
  label,
  placeholder,
  error,
  helpText,
  disabled = false,
  required = false,
  rows = 4,
  id,
  className = "",
  ...rest
}) {
  const fieldId = id || (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);

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

      <textarea
        id={fieldId}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        className={`w-full resize-y rounded-lg border p-2.5 text-sm text-gray-900 transition-colors
          placeholder:text-gray-400 focus:outline-none focus:ring-2
          disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400
          ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:border-violet-500 focus:ring-violet-300"
          } ${className}`}
        {...rest}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
      {helpText && !error && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}
