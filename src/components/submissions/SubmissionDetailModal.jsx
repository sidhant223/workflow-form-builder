// src/components/submissions/SubmissionDetailModal.jsx
import Modal from "../ui/modal";

export default function SubmissionDetailModal({ submission, onClose }) {
  return (
    <Modal isOpen={!!submission} onClose={onClose} title="Submission Details">
      {submission && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Reference Number:{" "}
            <span className="font-mono font-semibold text-gray-900">
              {submission.referenceNumber}
            </span>
          </p>
          <p className="text-xs text-gray-500">
            Submitted {new Date(submission.submittedAt).toLocaleString()}
          </p>
          <div className="space-y-2 pt-2 border-t">
            {Object.entries(submission.responses).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 text-sm">
                <span className="font-medium text-gray-600">{key}</span>
                <span className="text-gray-900">
                  {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "—")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
