// src/components/ui/input.jsx
// Reusable Input component.
// Covers Text / Number / Email / Password inputs via the `type` prop.
// Supports: label, placeholder, error message, disabled state, required flag,
// and any native input props (value, onChange, name, etc.) via spreading.

export default function Input({
  label,
  type = "text",
  placeholder,
  error,
  disabled = false,
  required = false,
  id,
  className = "",
  ...rest
}) {
  const inputId = id || (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        className={`w-full rounded-lg border p-2.5 text-sm text-gray-900 transition-colors
          placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400
          ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:border-violet-500 focus:ring-violet-300"
          } ${className}`}
        {...rest}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
