import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function DraggableField({ field, isSelected, onSelect, onDelete, onDuplicate }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
      onClick={() => onSelect(field.id)}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium text-gray-700">{field.label || "Untitled"}</div>
          <div className="text-sm text-gray-400">{field.type}</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(field.id);
            }}
            className="p-2 text-gray-500 hover:bg-blue-100 rounded"
            title="Duplicate"
          >
            📋
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(field.id);
            }}
            className="p-2 text-gray-500 hover:bg-red-100 rounded"
            title="Delete"
          >
            ❌
          </button>
        </div>
      </div>
      {field.required && (
        <div className="mt-2 text-xs text-red-600">Required</div>
      )}
    </div>
  );
}
