// src/components/workflow/WorkflowStageEditor.jsx
// Editor for a single workflow definition: rename it, and add/edit/delete/
// reorder its stages. Read-only view is handled by the parent (workflow.jsx)
// gating this component behind `canConfigureWorkflows(role)`.

import { useState } from "react";
import { useWorkflowStore } from "../../store/workflowStore";
import Button from "../ui/button";

export default function WorkflowStageEditor({ workflow, onDelete }) {
  const updateWorkflowName = useWorkflowStore((s) => s.updateWorkflowName);
  const addStage = useWorkflowStore((s) => s.addStage);
  const updateStage = useWorkflowStore((s) => s.updateStage);
  const removeStage = useWorkflowStore((s) => s.removeStage);
  const reorderStage = useWorkflowStore((s) => s.reorderStage);
  const [newStageName, setNewStageName] = useState("");

  const handleAddStage = () => {
    if (!newStageName.trim()) return;
    addStage(workflow.id, newStageName.trim());
    setNewStageName("");
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={workflow.workflowName}
          onChange={(e) => updateWorkflowName(workflow.id, e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-lg font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-violet-300"
          aria-label="Workflow Name"
        />
        <button
          onClick={() => onDelete(workflow.id)}
          className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          🗑️ Delete Workflow
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {workflow.stages.map((stage, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-6 text-sm text-gray-400">{index + 1}.</span>
            <input
              type="text"
              value={stage}
              onChange={(e) => updateStage(workflow.id, index, e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
              aria-label={`Stage ${index + 1}`}
            />
            <button
              onClick={() => reorderStage(workflow.id, index, index - 1)}
              disabled={index === 0}
              aria-label={`Move ${stage} up`}
              className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >
              ↑
            </button>
            <button
              onClick={() => reorderStage(workflow.id, index, index + 1)}
              disabled={index === workflow.stages.length - 1}
              aria-label={`Move ${stage} down`}
              className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >
              ↓
            </button>
            <button
              onClick={() => removeStage(workflow.id, index)}
              aria-label={`Delete ${stage}`}
              className="rounded px-2 py-1 text-gray-500 hover:bg-red-100"
            >
              ❌
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={newStageName}
          onChange={(e) => setNewStageName(e.target.value)}
          placeholder="New stage name"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
        />
        <Button size="sm" onClick={handleAddStage}>
          + Add Stage
        </Button>
      </div>
    </div>
  );
}
