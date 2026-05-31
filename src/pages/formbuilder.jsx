import { useRef, useState } from "react";
import Input from "../components/ui/input";
import Select from "../components/ui/select";
import Checkbox from "../components/ui/checkbox";
import Button from "../components/ui/button";
import Badge from "../components/ui/badge";

const fieldTypes = [
  { type: "Text Input", icon: "📝" },
  { type: "Email", icon: "✉️" },
  { type: "Number", icon: "🔢" },
  { type: "Dropdown", icon: "🔽" },
  { type: "Checkbox", icon: "☑️" },
  { type: "Radio", icon: "🔘" },
  { type: "Textarea", icon: "📄" },
  { type: "Date", icon: "📅" },
];

function FormBuilder() {
  const [formFields, setFormFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const nextId = useRef(1);

  const addField = (type) => {
    const newField = {
      id: nextId.current++,
      type,
      label: type,
      placeholder: `Enter ${type.toLowerCase()}`,
      required: false,
      validation: "None",
    };
    setFormFields((prev) => [...prev, newField]);
    setSelectedField(newField);
  };

  const updateField = (key, value) => {
    if (!selectedField) return;
    setFormFields((prev) =>
      prev.map((field) =>
        field.id === selectedField.id ? { ...field, [key]: value } : field
      )
    );
    setSelectedField((prev) => ({ ...prev, [key]: value }));
  };

  const deleteField = () => {
    if (!selectedField) return;
    setFormFields((prev) => prev.filter((f) => f.id !== selectedField.id));
    setSelectedField(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
        <p className="mt-1 text-gray-600">
          Add fields from the palette, arrange them on the canvas and edit
          their properties.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* LEFT PANEL — FIELD PALETTE */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Field Palette</h2>
          <div className="space-y-2">
            {fieldTypes.map((field) => (
              <button
                key={field.type}
                onClick={() => addField(field.type)}
                className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left text-sm text-gray-700 transition hover:border-violet-500 hover:bg-violet-50"
              >
                <span>{field.icon}</span>
                <span>{field.type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CENTER PANEL — BUILDER CANVAS */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Builder Canvas</h2>
            {formFields.length > 0 && (
              <Badge text={`${formFields.length} fields`} type="neutral" />
            )}
          </div>

          <div className="max-h-[520px] min-h-[450px] overflow-y-auto rounded-xl border-2 border-dashed border-gray-300 p-4">
            {formFields.length === 0 ? (
              <div className="flex h-[400px] flex-col items-center justify-center text-center text-gray-400">
                <span className="mb-2 text-4xl">📋</span>
                <p className="font-medium text-gray-500">Drop form fields here</p>
                <p className="text-sm">
                  Click a field in the palette to add it to the form.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {formFields.map((field) => (
                  <div
                    key={field.id}
                    onClick={() => setSelectedField(field)}
                    className={`cursor-pointer rounded-lg border p-4 transition ${
                      selectedField?.id === field.id
                        ? "border-violet-600 bg-violet-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">
                        {field.label}
                      </span>
                      {field.required && <Badge text="Required" type="error" />}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">{field.type}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL — PROPERTY PANEL */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Property Panel</h2>

          {!selectedField ? (
            <p className="text-sm text-gray-500">
              Select a field from the canvas to edit its properties.
            </p>
          ) : (
            <div className="space-y-4">
              <Input
                label="Field Label"
                value={selectedField.label}
                onChange={(e) => updateField("label", e.target.value)}
              />
              <Input
                label="Placeholder"
                value={selectedField.placeholder}
                onChange={(e) => updateField("placeholder", e.target.value)}
              />
              <Select
                label="Validation"
                value={selectedField.validation}
                onChange={(e) => updateField("validation", e.target.value)}
                options={["None", "Required", "Email", "Number"]}
              />
              <Checkbox
                label="Required Field"
                checked={selectedField.required}
                onChange={(e) => updateField("required", e.target.checked)}
              />
              <Button variant="danger" fullWidth onClick={deleteField}>
                Delete Field
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FormBuilder;
