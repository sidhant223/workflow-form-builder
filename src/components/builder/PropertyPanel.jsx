import { useFormStore, useSelectedField } from "../../store/formStore";
import { OPTION_FIELD_TYPES } from "../../schemas/formSchema";
import ConditionalPanel from "./ConditionalPanel";

export default function PropertyPanel() {
  const selectedField = useSelectedField();
  const { updateField, removeField, duplicateField } = useFormStore();
  const sections = useFormStore((s) => s.sections);

  if (!selectedField) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
        <span className="mb-2 text-3xl">🔧</span>
        <p className="font-medium">Select a field to edit</p>
      </div>
    );
  }

  const handleChange = (key, value) => {
    updateField(selectedField.id, { [key]: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...selectedField.options];
    newOptions[index] = value;
    updateField(selectedField.id, { options: newOptions });
  };

  const handleAddOption = () => {
    const newOptions = [...(selectedField.options || [])];
    newOptions.push(`Option ${newOptions.length + 1}`);
    updateField(selectedField.id, { options: newOptions });
  };

  const handleRemoveOption = (index) => {
    const newOptions = selectedField.options.filter((_, i) => i !== index);
    updateField(selectedField.id, { options: newOptions });
  };

  return (
    <div className="space-y-4">
      <div className="pb-4 border-b">
        <h3 className="font-bold text-gray-700 mb-2">Field Properties</h3>
        <div className="flex gap-2">
          <button
            onClick={() => duplicateField(selectedField.id)}
            className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
          >
            📋 Duplicate
          </button>
          <button
            onClick={() => removeField(selectedField.id)}
            className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Field Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Label
        </label>
        <input
          type="text"
          value={selectedField.label}
          onChange={(e) => handleChange("label", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Field label"
        />
      </div>

      {/* Placeholder */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Placeholder
        </label>
        <input
          type="text"
          value={selectedField.placeholder || ""}
          onChange={(e) => handleChange("placeholder", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Hint text"
        />
      </div>

      {/* Default Value */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Default Value
        </label>
        <input
          type="text"
          value={selectedField.defaultValue || ""}
          onChange={(e) => handleChange("defaultValue", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Default value"
        />
      </div>

      {/* Help Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Help Text
        </label>
        <textarea
          value={selectedField.helpText || ""}
          onChange={(e) => handleChange("helpText", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          placeholder="Additional instructions"
          rows="2"
        />
      </div>

      {/* Required */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="required"
          checked={selectedField.required || false}
          onChange={(e) => handleChange("required", e.target.checked)}
          className="rounded"
        />
        <label htmlFor="required" className="text-sm font-medium text-gray-700">
          Required
        </label>
      </div>

      {/* Step assignment (multi-step forms) */}
      {sections.length > 0 && (
        <div>
          <label htmlFor="prop-step" className="block text-sm font-medium text-gray-700 mb-1">
            Step
          </label>
          <select
            id="prop-step"
            value={selectedField.sectionId || sections[0].id}
            onChange={(e) => handleChange("sectionId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Length validation (text-like fields) */}
      {["text", "textarea", "password", "email"].includes(selectedField.type) && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="prop-minLength" className="block text-sm font-medium text-gray-700 mb-1">
              Min Length
            </label>
            <input
              id="prop-minLength"
              type="number"
              min="0"
              value={selectedField.minLength ?? ""}
              onChange={(e) =>
                handleChange("minLength", e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="prop-maxLength" className="block text-sm font-medium text-gray-700 mb-1">
              Max Length
            </label>
            <input
              id="prop-maxLength"
              type="number"
              min="0"
              value={selectedField.maxLength ?? ""}
              onChange={(e) =>
                handleChange("maxLength", e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* Regex pattern (plain text fields only — email already has built-in format validation) */}
      {["text", "textarea"].includes(selectedField.type) && (
        <div className="space-y-2">
          <div>
            <label htmlFor="prop-pattern" className="block text-sm font-medium text-gray-700 mb-1">
              Regex Pattern
            </label>
            <input
              id="prop-pattern"
              type="text"
              value={selectedField.pattern ?? ""}
              onChange={(e) => handleChange("pattern", e.target.value)}
              placeholder="e.g. ^[0-9]{10}$"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
            />
          </div>
          <div>
            <label htmlFor="prop-patternMessage" className="block text-sm font-medium text-gray-700 mb-1">
              Pattern Error Message
            </label>
            <input
              id="prop-patternMessage"
              type="text"
              value={selectedField.patternMessage ?? ""}
              onChange={(e) => handleChange("patternMessage", e.target.value)}
              placeholder="10 digits only"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* Numeric range (number fields) */}
      {selectedField.type === "number" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="prop-min" className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Value
            </label>
            <input
              id="prop-min"
              type="number"
              value={selectedField.min ?? ""}
              onChange={(e) => handleChange("min", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="prop-max" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Value
            </label>
            <input
              id="prop-max"
              type="number"
              value={selectedField.max ?? ""}
              onChange={(e) => handleChange("max", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* Options (for select/radio) */}
      {OPTION_FIELD_TYPES.includes(selectedField.type) && (
        <div className="pt-4 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options
          </label>
          <div className="space-y-2">
            {(selectedField.options || []).map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  onClick={() => handleRemoveOption(index)}
                  className="px-2 py-2 text-gray-500 hover:bg-red-100 rounded transition"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleAddOption}
            className="mt-2 w-full px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
          >
            + Add Option
          </button>
        </div>
      )}

      <ConditionalPanel field={selectedField} />
    </div>
  );
}
