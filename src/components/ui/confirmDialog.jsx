// src/components/ui/confirmDialog.jsx
// Reusable confirmation dialog for destructive actions (delete, discard, etc).
// Replaces native window.confirm() so styling stays consistent with the app.

import Modal from "./modal";
import Button from "./button";

export default function ConfirmDialog({
  isOpen,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p>{message}</p>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
