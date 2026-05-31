// src/components/ui/toast.jsx
// Reusable Toast notification.
// Variants: success | error | info | warning
// Auto-dismisses after `duration` ms (set duration={0} to disable) and can be
// dismissed manually. Renders fixed to the top-right of the screen.

import { useEffect } from "react";

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
}) {
  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const variants = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
    warning: "bg-yellow-500 text-gray-900",
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  return (
    <div
      className={`fixed right-5 top-5 z-50 flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
        variants[type] || variants.success
      }`}
      role="alert"
    >
      <span className="font-bold">{icons[type]}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="ml-2 opacity-80 transition-opacity hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
