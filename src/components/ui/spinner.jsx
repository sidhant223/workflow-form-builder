// src/components/ui/spinner.jsx
// Reusable loading spinner shown while a store's fetch is in flight.

export default function Spinner({ label = "Loading…", size = "md", className = "" }) {
  const sizes = { sm: "h-4 w-4 border-2", md: "h-8 w-8 border-2", lg: "h-12 w-12 border-4" };

  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center gap-2 py-10 text-gray-500 ${className}`}
    >
      <span
        className={`inline-block animate-spin rounded-full border-violet-600 border-t-transparent ${sizes[size]}`}
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
