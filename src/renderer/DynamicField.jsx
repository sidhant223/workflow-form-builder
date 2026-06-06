// src/renderer/DynamicField.jsx
// Looks up a single field's component in the registry and renders it.
// Acts as the bridge between a schema entry and a real, controlled React input.
//
// We resolve the component from the registry and mount it with createElement —
// the registry holds stable, module-level components, so this is a lookup, not
// a per-render component definition.

import { createElement } from "react";
import { getFieldComponent } from "./fieldRegistry";

export default function DynamicField({ field, value, onChange, disabled = false }) {
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
    onChange: (next) => onChange(field.id, next),
  });
}
