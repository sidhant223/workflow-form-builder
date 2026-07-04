// src/components/ui/errorBanner.jsx
// Reusable inline error message with an optional Retry action, shown when a
// store's fetch/save/delete call fails.

import Button from "./button";

export default function ErrorBanner({ message = "Something went wrong. Please try again.", onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <span>{message}</span>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
