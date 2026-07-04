// src/components/workflow/CommentDialog.jsx
// Popup shown before an Approve/Reject action completes, per the spec:
// capture an optional remark and store it alongside the workflow history entry.

import { useState } from "react";
import Modal from "../ui/modal";
import Button from "../ui/button";

export default function CommentDialog({ isOpen, actionLabel, onClose, onConfirm }) {
  const [comment, setComment] = useState("");

  const handleConfirm = () => {
    onConfirm(comment);
    setComment("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${actionLabel} — Add a Comment`}>
      <div className="space-y-3">
        <label htmlFor="workflow-comment" className="block text-sm font-medium text-gray-700">
          Comments
        </label>
        <textarea
          id="workflow-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Add a remark (optional)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={actionLabel === "Reject" ? "danger" : "primary"} onClick={handleConfirm}>
            {actionLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
