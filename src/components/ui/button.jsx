// src/components/ui/button.jsx
// Reusable Button component
// Variants: primary | secondary | danger | outline
// Sizes:    sm | md | lg
// Supports: hover effects, disabled state, full width, and any native
// button props (onClick, type, etc.) via prop spreading.

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  fullWidth = false,
  disabled = false,
  className = "",
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium " +
    "transition-colors duration-200 focus:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-violet-600 text-white hover:bg-violet-700 focus-visible:ring-violet-500",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-400",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
    outline:
      "border border-violet-600 text-violet-600 hover:bg-violet-50 focus-visible:ring-violet-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
