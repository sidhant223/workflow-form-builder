// src/components/forms/FormRow.jsx
// A single row in the Forms list. Memoized so changing a filter/sort option
// (which re-renders the whole list) doesn't re-render rows whose underlying
// form object hasn't changed.

import { memo } from "react";
import Badge from "../ui/badge";

function FormRow({ form, canManage, onFill, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 p-4 transition-colors last:border-b-0 hover:bg-gray-50">
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-800">{form.formName || "Untitled Form"}</p>
          <Badge
            text={form.status || "Draft"}
            type={form.status === "Published" ? "success" : "neutral"}
          />
        </div>
        <p className="text-sm text-gray-500">
          {form.formDescription || "No description"} · Created{" "}
          {new Date(form.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onFill(form)}
          className="text-sm font-medium text-violet-600 hover:underline"
        >
          Fill Form
        </button>
        {canManage && (
          <>
            <button
              onClick={() => onEdit(form)}
              className="text-sm font-medium text-gray-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(form)}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default memo(FormRow);
