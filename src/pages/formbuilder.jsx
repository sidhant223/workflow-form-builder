// src/pages/formbuilder.jsx
// The Form Builder: a 3-column workspace —
//   Palette (add fields) · Canvas (live, schema-driven preview) · Properties.
// All state lives in the Zustand store, so the canvas and property panel always
// reflect the same schema and the form survives a page refresh.

import { Link } from "react-router-dom";
import { useFormStore, useSelectedField } from "../store/formStore";
import {
  FIELD_TYPES,
  FIELD_TYPE_MAP,
  hasOptions,
  exampleEmployeeForm,
} from "../schemas/formSchema";
import DynamicField from "../renderer/DynamicField";
import Input from "../components/ui/input";
import Checkbox from "../components/ui/checkbox";
import Button from "../components/ui/button";
import Badge from "../components/ui/badge";

const noop = () => {};

function FormBuilder() {
  const fields = useFormStore((s) => s.fields);
  const selectedFieldId = useFormStore((s) => s.selectedFieldId);
  const addField = useFormStore((s) => s.addField);
  const removeField = useFormStore((s) => s.removeField);
  const updateField = useFormStore((s) => s.updateField);
  const selectField = useFormStore((s) => s.selectField);
  const resetForm = useFormStore((s) => s.resetForm);
  const loadSchema = useFormStore((s) => s.loadSchema);

  const selectedField = useSelectedField();

  return (
    <div>
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
          <p className="mt-1 text-gray-600">
            Click a field to add it, edit its properties, and preview the form
            live.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadSchema(exampleEmployeeForm)}
          >
            Load Sample
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetForm}
            disabled={fields.length === 0}
          >
            Reset
          </Button>
          <Link to="/preview">
            <Button size="sm">Preview →</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* LEFT — FIELD PALETTE */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Field Palette</h2>
          <div className="space-y-2">
            {FIELD_TYPES.map((meta) => (
              <button
                key={meta.type}
                onClick={() => addField(meta.type)}
                className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left text-sm text-gray-700 transition hover:border-violet-500 hover:bg-violet-50"
              >
                <span className="text-base">{meta.icon}</span>
                <span>{meta.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CENTER — BUILDER CANVAS */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Builder Canvas</h2>
            {fields.length > 0 && (
              <Badge text={`${fields.length} field${fields.length > 1 ? "s" : ""}`} type="neutral" />
            )}
          </div>

          <div className="max-h-[560px] min-h-[460px] overflow-y-auto rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/60 p-4">
            {fields.length === 0 ? (
              <div className="flex h-[400px] flex-col items-center justify-center text-center text-gray-400">
                <span className="mb-2 text-4xl">📋</span>
                <p className="font-medium text-gray-500">No fields added yet</p>
                <p className="text-sm">
                  Click a field in the palette to add it to the form.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field) => {
                  const isSelected = selectedFieldId === field.id;
                  const meta = FIELD_TYPE_MAP[field.type];
                  return (
                    <div
                      key={field.id}
                      onClick={() => selectField(field.id)}
                      className={`cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition ${
                        isSelected
                          ? "border-violet-600 ring-2 ring-violet-200"
                          : "border-gray-200 hover:border-violet-300"
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
                          <span>{meta?.icon}</span>
                          {meta?.label || field.type}
                          {field.required && (
                            <Badge text="Required" type="error" className="ml-1" />
                          )}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeField(field.id);
                          }}
                          aria-label="Delete field"
                          className="rounded-md px-2 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50"
                        >
                          ✕ Delete
                        </button>
                      </div>

                      {/* Live, schema-driven preview of the field */}
                      <div className="pointer-events-none">
                        <DynamicField
                          field={field}
                          value={field.defaultValue}
                          onChange={noop}
                          disabled
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — PROPERTY PANEL */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Property Panel</h2>
          {!selectedField ? (
            <p className="text-sm text-gray-500">
              Select a field from the canvas to edit its properties.
            </p>
          ) : (
            <PropertyPanel
              field={selectedField}
              onChange={(data) => updateField(selectedField.id, data)}
              onDelete={() => removeField(selectedField.id)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Property Panel — edits the common props plus per-type extras (dropdown/radio
// options). Every change is pushed to the store immediately, so the canvas and
// preview update live.
// -----------------------------------------------------------------------------
function PropertyPanel({ field, onChange, onDelete }) {
  const showOptions = hasOptions(field.type);

  const updateOption = (index, value) => {
    const options = [...(field.options || [])];
    options[index] = value;
    onChange({ options });
  };

  const addOption = () => {
    const options = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
    onChange({ options });
  };

  const removeOption = (index) => {
    const options = (field.options || []).filter((_, i) => i !== index);
    onChange({ options });
  };

  return (
    <div className="space-y-4">
      <Input
        label="Field Label"
        value={field.label}
        onChange={(e) => onChange({ label: e.target.value })}
      />

      {field.type !== "checkbox" && (
        <Input
          label="Placeholder"
          value={field.placeholder || ""}
          onChange={(e) => onChange({ placeholder: e.target.value })}
        />
      )}

      {/* Default value editor adapts to the field type */}
      {field.type === "checkbox" ? (
        <Checkbox
          label="Checked by default"
          checked={!!field.defaultValue}
          onChange={(e) => onChange({ defaultValue: e.target.checked })}
        />
      ) : (
        <Input
          label="Default Value"
          type={field.type === "date" ? "date" : "text"}
          value={field.defaultValue || ""}
          onChange={(e) => onChange({ defaultValue: e.target.value })}
        />
      )}

      {showOptions && (
        <div className="space-y-2">
          <span className="block text-sm font-medium text-gray-700">Options</span>
          {(field.options || []).map((opt, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                value={opt}
                onChange={(e) => updateOption(index, e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
              <button
                onClick={() => removeOption(index)}
                aria-label="Remove option"
                className="shrink-0 rounded-md px-2 py-1 text-sm text-red-500 hover:bg-red-50"
              >
                ✕
              </button>
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={addOption}>
            + Add Option
          </Button>
        </div>
      )}

      <Checkbox
        label="Required Field"
        checked={field.required}
        onChange={(e) => onChange({ required: e.target.checked })}
      />

      <div className="border-t border-gray-100 pt-4">
        <Button variant="danger" fullWidth onClick={onDelete}>
          Delete Field
        </Button>
      </div>
    </div>
  );
}

export default FormBuilder;
