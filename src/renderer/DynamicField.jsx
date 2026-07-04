// src/renderer/DynamicField.jsx
// Looks up a single field's component in the registry and renders it.
// `onChange` is forwarded as-is (single new-value argument) — the caller
// (FormRenderer, wired to react-hook-form's Controller) already knows which
// field this is via the `name` it registered the Controller under.

import { createElement } from "react";
import { getFieldComponent } from "./fieldRegistry";

export default function DynamicField({ field, value, onChange, error, disabled = false }) {
  const fieldComponent = getFieldComponent(field.type);

  if (!fieldComponent) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700">
        Unsupported field type: <code>{field.type}</code>
      </div>
    );
  }

  return createElement(fieldComponent, {
    field,
    value,
    disabled,
    error,
    onChange,
  });
}
