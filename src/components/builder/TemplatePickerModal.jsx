// src/components/builder/TemplatePickerModal.jsx
import Modal from "../ui/modal";
import Button from "../ui/button";
import { templates } from "../../schemas/templates";

export default function TemplatePickerModal({ isOpen, onClose, onSelect }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose a Template">
      <div className="space-y-3">
        {templates.map((template) => (
          <div key={template.key} className="rounded-lg border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-900">{template.name}</h4>
            <p className="mt-1 text-sm text-gray-600">{template.description}</p>
            <Button
              size="sm"
              className="mt-3"
              onClick={() => {
                onSelect(template);
                onClose();
              }}
            >
              Create From Template
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
