import { useDraggable } from "@dnd-kit/core";
import { FIELD_TYPES } from "../../schemas/formSchema";

function DraggableFieldType({ type, label, icon }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, isFromPalette: true },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 rounded-lg border border-gray-300 cursor-grab text-center transition ${
        isDragging
          ? "opacity-50 bg-violet-100 border-violet-400"
          : "bg-white hover:bg-gray-50 hover:border-gray-400"
      }`}
    >
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-xs font-medium text-gray-700">{label}</div>
    </div>
  );
}

export default function FieldPalette() {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Field Types</h3>
        <div className="grid grid-cols-2 gap-2">
          {FIELD_TYPES.map((fieldType) => (
            <DraggableFieldType
              key={fieldType.type}
              type={fieldType.type}
              label={fieldType.label}
              icon={fieldType.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
