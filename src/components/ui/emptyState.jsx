// src/components/ui/emptyState.jsx
// Reusable "nothing here yet" placeholder for lists (Forms, Workflows,
// Submissions) once loaded with zero items.

export default function EmptyState({ icon = "📭", title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-400">
      <span className="mb-2 text-3xl">{icon}</span>
      <p className="font-medium">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
    </div>
  );
}
