// src/components/ui/card.jsx
// Reusable Card container. Provides padding, rounded corners, border and a
// subtle shadow. An optional `title` renders a header, and `className` lets
// callers extend or override styling.

export default function Card({ children, title, className = "", ...rest }) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${className}`}
      {...rest}
    >
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
      )}
      {children}
    </div>
  );
}
