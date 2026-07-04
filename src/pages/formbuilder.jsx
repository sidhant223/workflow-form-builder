import { useState } from "react";
import { Link } from "react-router-dom";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useFormStore } from "../store/formStore";
import { exampleEmployeeForm } from "../schemas/formSchema";
import FieldPalette from "../components/builder/FieldPalette";
import SortableCanvas from "../components/builder/SortableCanvas";
import PropertyPanel from "../components/builder/PropertyPanel";
import FormMetadata from "../components/builder/FormMetadata";
import StepManagerPanel from "../components/builder/StepManagerPanel";
import TemplatePickerModal from "../components/builder/TemplatePickerModal";
import Button from "../components/ui/button";
import Badge from "../components/ui/badge";

function FormBuilder() {
  const fields = useFormStore((s) => s.fields);
  const selectedFieldId = useFormStore((s) => s.selectedFieldId);
  const formName = useFormStore((s) => s.formName);
  const addField = useFormStore((s) => s.addField);
  const removeField = useFormStore((s) => s.removeField);
  const selectField = useFormStore((s) => s.selectField);
  const duplicateField = useFormStore((s) => s.duplicateField);
  const reorderFields = useFormStore((s) => s.reorderFields);
  const resetForm = useFormStore((s) => s.resetForm);
  const loadSchema = useFormStore((s) => s.loadSchema);
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      const fieldType = active.data.current?.type;
      if (fieldType && active.data.current?.isFromPalette) {
        addField(fieldType);
      }
      return;
    }

    if (active.id !== over.id) {
      const fromPalette = active.data.current?.isFromPalette;
      if (fromPalette) {
        const fieldType = active.data.current?.type;
        addField(fieldType);
      } else {
        const fromIndex = fields.findIndex((f) => f.id === active.id);
        const toIndex = fields.findIndex((f) => f.id === over.id);
        if (fromIndex !== -1 && toIndex !== -1) {
          reorderFields(fromIndex, toIndex);
        }
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div>
        {/* PAGE HEADER */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
            <p className="mt-1 text-gray-600">
              Drag fields to add or reorder. Edit properties on the right.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => loadSchema({ fields: exampleEmployeeForm })}
            >
              Load Sample
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setTemplateModalOpen(true)}>
              Use Template
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
            <h2 className="mb-4 font-semibold text-gray-900">📚 Field Palette</h2>
            <FieldPalette />
          </div>

          {/* CENTER — BUILDER CANVAS */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">🎨 Canvas</h2>
                {formName && (
                  <p className="text-sm text-gray-600 mt-1">{formName}</p>
                )}
              </div>
              {fields.length > 0 && (
                <Badge text={`${fields.length} field${fields.length > 1 ? "s" : ""}`} type="neutral" />
              )}
            </div>

            <div className="max-h-[560px] min-h-[460px] overflow-y-auto rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/60 p-4">
              <SortableCanvas
                fields={fields}
                selectedFieldId={selectedFieldId}
                onSelectField={selectField}
                onDeleteField={removeField}
                onDuplicateField={duplicateField}
                onReorderFields={reorderFields}
              />
            </div>
          </div>

          {/* RIGHT — PROPERTY PANEL */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm overflow-y-auto max-h-[680px]">
            <h2 className="mb-4 font-semibold text-gray-900">⚙️ Properties</h2>
            <StepManagerPanel />
            <FormMetadata />
            <PropertyPanel />
          </div>
        </div>
      </div>

      <TemplatePickerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelect={(template) => loadSchema(template)}
      />
    </DndContext>
  );
}

export default FormBuilder;
