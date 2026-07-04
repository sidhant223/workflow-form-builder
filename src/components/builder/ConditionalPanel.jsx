// src/components/builder/ConditionalPanel.jsx
import { useFormStore } from "../../store/formStore";

function valueOptionsFor(targetField) {
  if (!targetField) return null;
  if (targetField.type === "checkbox") return ["true", "false"];
  if (["select", "radio"].includes(targetField.type)) return targetField.options || [];
  return null; // free text
}

export default function ConditionalPanel({ field }) {
  const fields = useFormStore((s) => s.fields);
  const updateField = useFormStore((s) => s.updateField);

  const otherFields = fields.filter((f) => f.id !== field.id);
  const showIf = field.showIf || null;
  const targetField = showIf ? fields.find((f) => f.id === showIf.field) : null;
  const valueOptions = valueOptionsFor(targetField);

  if (!otherFields.length) return null;

  const handleTargetChange = (targetId) => {
    if (!targetId) {
      updateField(field.id, { showIf: null });
      return;
    }
    updateField(field.id, { showIf: { field: targetId, value: "" } });
  };

  const handleValueChange = (value) => {
    updateField(field.id, { showIf: { field: showIf.field, value } });
  };

  return (
    <div className="pt-4 border-t space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Show this field only when…
      </label>
      <select
        value={showIf?.field || ""}
        onChange={(e) => handleTargetChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Always show</option>
        {otherFields.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>

      {showIf &&
        (valueOptions ? (
          <select
            value={showIf.value}
            onChange={(e) => handleValueChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select expected value</option>
            {valueOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={showIf.value}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Expected value"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        ))}
    </div>
  );
}
