// src/components/submissions/SubmissionDetailModal.jsx
import { useWorkflowStore } from "../../store/workflowStore";
import { useSubmissionStore } from "../../store/submissionStore";
import { MOCK_USERS } from "../../store/authStore";
import { stageBadgeType } from "../../workflow/stageBadge";
import Modal from "../ui/modal";
import Badge from "../ui/badge";
import WorkflowTimeline from "../workflow/WorkflowTimeline";
import WorkflowActions from "../workflow/WorkflowActions";

const ACTION_MESSAGES = {
  approve: (user) => `${user} approved the request.`,
  reject: () => "Request rejected.",
  advance: (_user, toStage) => `Moved to ${toStage}.`,
};

export default function SubmissionDetailModal({ submission, onClose, onNotify }) {
  const workflows = useWorkflowStore((s) => s.workflows);
  const advanceStage = useSubmissionStore((s) => s.advanceStage);
  const assignUser = useSubmissionStore((s) => s.assignUser);

  const workflow = submission
    ? workflows.find((w) => w.id === submission.workflowId) || null
    : null;

  const handleAction = ({ toStage, action, user, comment }) => {
    if (!submission) return;
    advanceStage(submission.id, { toStage, action, user, comment });
    const buildMessage = ACTION_MESSAGES[action] || ACTION_MESSAGES.advance;
    onNotify?.(buildMessage(user, toStage));
  };

  return (
    <Modal isOpen={!!submission} onClose={onClose} title="Submission Details">
      {submission && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Reference Number:{" "}
            <span className="font-mono font-semibold text-gray-900">
              {submission.referenceNumber}
            </span>
          </p>
          <p className="text-xs text-gray-500">
            Submitted {new Date(submission.submittedAt).toLocaleString()}
          </p>

          {submission.stage && (
            <div>
              <p className="mb-1 text-sm font-medium text-gray-700">Current Status</p>
              <Badge text={submission.stage} type={stageBadgeType(submission.stage)} />
            </div>
          )}

          {workflow && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Workflow History</p>
              <WorkflowTimeline
                stages={workflow.stages}
                history={submission.history}
                currentStage={submission.stage}
              />
            </div>
          )}

          {workflow && (
            <div>
              <label htmlFor="assign-to" className="mb-2 block text-sm font-medium text-gray-700">
                Assigned To
              </label>
              <select
                id="assign-to"
                value={submission.assignedTo || ""}
                onChange={(e) => assignUser(submission.id, e.target.value || null)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
              >
                <option value="">Unassigned</option>
                {MOCK_USERS.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {workflow && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Actions</p>
              <WorkflowActions
                stages={workflow.stages}
                currentStage={submission.stage}
                onAction={handleAction}
              />
            </div>
          )}

          <div className="space-y-2 border-t pt-2">
            <p className="text-sm font-medium text-gray-700">Responses</p>
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
