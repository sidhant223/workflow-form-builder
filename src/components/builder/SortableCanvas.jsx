import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DraggableField from "./DraggableField";

export default function SortableCanvas({
  fields,
  selectedFieldId,
  onSelectField,
  onDeleteField,
  onDuplicateField,
}) {
  if (!fields.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-400">
        <span className="mb-2 text-3xl">📝</span>
        <p className="font-medium">Drag fields here to build your form</p>
      </div>
    );
  }

  return (
    <SortableContext
      items={fields.map((f) => f.id)}
      strategy={verticalListSortingStrategy}
    >
      <div className="space-y-3">
        {fields.map((field) => (
          <DraggableField
            key={field.id}
            field={field}
            isSelected={selectedFieldId === field.id}
            onSelect={onSelectField}
            onDelete={onDeleteField}
            onDuplicate={onDuplicateField}
          />
        ))}
      </div>
    </SortableContext>
  );
}
