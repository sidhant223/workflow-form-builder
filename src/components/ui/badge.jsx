// src/components/ui/badge.jsx
// Reusable status Badge.
// Variants: success | warning | error | neutral
// Accepts either a `text` prop or `children`.

export default function Badge({ text, children, type = "neutral", className = "" }) {
  const variants = {
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
    neutral: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        variants[type] || variants.neutral
      } ${className}`}
    >
      {text || children}
    </span>
  );
}
