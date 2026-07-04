// src/components/builder/StepManagerPanel.jsx
import { useState } from "react";
import { useFormStore } from "../../store/formStore";

export default function StepManagerPanel() {
  const sections = useFormStore((s) => s.sections);
  const addSection = useFormStore((s) => s.addSection);
  const updateSection = useFormStore((s) => s.updateSection);
  const removeSection = useFormStore((s) => s.removeSection);
  const [newStepName, setNewStepName] = useState("");

  const handleAdd = () => {
    addSection(newStepName.trim() || `Step ${sections.length + 1}`);
    setNewStepName("");
  };

  return (
    <div className="space-y-3 pb-4 border-b mb-4">
      <h3 className="font-bold text-gray-700">
        Steps {sections.length > 0 && `(${sections.length})`}
      </h3>
      <p className="text-xs text-gray-500">
        Add steps to turn this form into a multi-step wizard. Leave empty for a single-page form.
      </p>

      {sections.map((section) => (
        <div key={section.id} className="flex gap-2">
          <input
            type="text"
            value={section.name}
            onChange={(e) => updateSection(section.id, { name: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => removeSection(section.id)}
            className="px-2 py-2 text-gray-500 hover:bg-red-100 rounded transition"
            title="Remove step"
          >
            ❌
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        <input
          type="text"
          value={newStepName}
          onChange={(e) => setNewStepName(e.target.value)}
          placeholder="New step name"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
        >
          + Add Step
        </button>
      </div>
    </div>
  );
}
