// src/renderer/FormRenderer.jsx
// -----------------------------------------------------------------------------
// The Dynamic Form Renderer.
//
//   Read schema  →  loop through fields  →  render the correct component.
//
// It owns the live form values (controlled inputs), seeds them from each
// field's `defaultValue`, and reconciles them whenever fields are added or
// removed so it can be reused both on the builder canvas and the preview page.
// -----------------------------------------------------------------------------

import { useState } from "react";
import DynamicField from "./DynamicField";
import Button from "../components/ui/button";

function seedValue(field) {
  if (field.defaultValue !== undefined && field.defaultValue !== "") {
    return field.defaultValue;
  }
  return field.type === "checkbox" ? false : "";
}

function buildInitialValues(schema) {
  return schema.reduce((acc, field) => {
    acc[field.id] = seedValue(field);
    return acc;
  }, {});
}

export default function FormRenderer({
  schema = [],
  disabled = false,
  showSubmit = false,
  submitLabel = "Submit",
  onSubmit,
  emptyMessage = "No fields added yet",
}) {
  const [values, setValues] = useState(() => buildInitialValues(schema));
  const [fieldSignature, setFieldSignature] = useState(() =>
    schema.map((f) => f.id).join("|")
  );

  // Keep `values` in sync with the schema when fields are added or removed.
  // Adjusting state during render (when a derived signature changes) is React's
  // recommended alternative to an effect — no cascading re-render, no stale input.
  const signature = schema.map((f) => f.id).join("|");
  if (signature !== fieldSignature) {
    setFieldSignature(signature);
    setValues((prev) => {
      const next = {};
      schema.forEach((field) => {
        next[field.id] = field.id in prev ? prev[field.id] : seedValue(field);
      });
      return next;
    });
  }

  const handleChange = (id, value) =>
    setValues((prev) => ({ ...prev, [id]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSubmit) onSubmit(values);
  };

  if (!schema.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-400">
        <span className="mb-2 text-3xl">🗒️</span>
        <p className="font-medium text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {schema.map((field) => (
        <DynamicField
          key={field.id}
          field={field}
          value={values[field.id]}
          onChange={handleChange}
          disabled={disabled}
        />
      ))}

      {showSubmit && (
        <div className="pt-2">
          <Button type="submit" size="lg">
            {submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}
