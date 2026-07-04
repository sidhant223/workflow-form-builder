// src/components/workflow/WorkflowActions.jsx
// Renders the action buttons available for a submission's current stage,
// filtered by the simulated active user's role. Approve/Reject open a comment
// dialog first; a plain advance (e.g. "Submit") fires immediately.

import { useState } from "react";
import { getAvailableActions } from "../../workflow/workflowTransitions";
import { canPerformAction } from "../../workflow/rolePermissions";
import { useCurrentUser } from "../../store/roleStore";
import Button from "../ui/button";
import CommentDialog from "./CommentDialog";

export default function WorkflowActions({ stages, currentStage, onAction }) {
  const currentUser = useCurrentUser();
  const [pendingAction, setPendingAction] = useState(null);

  if (!currentStage) return null;

  const allActions = getAvailableActions(stages, currentStage);
  if (!allActions.length) {
    return <p className="text-sm text-gray-500">✓ This submission has reached its final stage.</p>;
  }

  const permittedActions = allActions.filter((a) => canPerformAction(currentUser.role, a.action));
  if (!permittedActions.length) {
    return (
      <p className="text-sm text-gray-500">
        Waiting on a Manager or Admin to take action on this stage.
      </p>
    );
  }

  const handleClick = (action) => {
    if (action.action === "advance") {
      onAction({ toStage: action.toStage, action: action.action, user: currentUser.name, comment: "" });
    } else {
      setPendingAction(action);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        {permittedActions.map((action) => (
          <Button
            key={action.action}
            variant={action.action === "reject" ? "danger" : "primary"}
            onClick={() => handleClick(action)}
          >
            {action.label}
          </Button>
        ))}
      </div>

      <CommentDialog
        isOpen={!!pendingAction}
        actionLabel={pendingAction?.label || ""}
        onClose={() => setPendingAction(null)}
        onConfirm={(comment) => {
          onAction({
            toStage: pendingAction.toStage,
            action: pendingAction.action,
            user: currentUser.name,
            comment,
          });
          setPendingAction(null);
        }}
      />
    </>
  );
}
