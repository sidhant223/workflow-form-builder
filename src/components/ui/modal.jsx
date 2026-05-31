// src/components/ui/modal.jsx
// Reusable Modal / dialog.
// Controlled via `isOpen` + `onClose`. Renders nothing when closed.
// Features: background overlay (click to close), Escape-to-close,
// a `title`, a reusable content slot (`children`) and an optional `footer`.

import { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children, footer }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-5 text-sm text-gray-600">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 border-t border-gray-100 p-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
