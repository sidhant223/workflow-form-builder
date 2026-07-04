// src/workflow/workflowTransitions.js
// -----------------------------------------------------------------------------
// Pure state-transition logic for a workflow's ordered `stages` list.
//
// Rules:
//   - Stages named (case-insensitively) "Approved" or "Rejected" are terminal
//     outcome stages — no further actions once reached.
//   - The last non-outcome stage in the array is the "review" stage: from
//     there, the available actions are Approve / Reject, jumping directly to
//     whichever outcome stages exist in this workflow.
//   - Every earlier non-outcome stage advances sequentially to the next
//     non-outcome stage in array order. The very first stage's advance action
//     is labeled "Submit"; later ones are labeled "Move to <next stage>".
// -----------------------------------------------------------------------------

const OUTCOME_NAMES = ["approved", "rejected"];

export function isOutcomeStage(stageName) {
  return OUTCOME_NAMES.includes((stageName || "").toLowerCase());
}

function outcomeStagesIn(stages) {
  return {
    approved: stages.find((s) => s.toLowerCase() === "approved") || null,
    rejected: stages.find((s) => s.toLowerCase() === "rejected") || null,
  };
}

export function getAvailableActions(stages = [], currentStage) {
  const idx = stages.indexOf(currentStage);
  if (idx === -1) return [];
  if (isOutcomeStage(currentStage)) return [];

  const sequential = stages.filter((s) => !isOutcomeStage(s));
  const sequentialIdx = sequential.indexOf(currentStage);
  const isLastReviewStage = sequentialIdx === sequential.length - 1;

  if (isLastReviewStage) {
    const { approved, rejected } = outcomeStagesIn(stages);
    const actions = [];
    if (approved) actions.push({ action: "approve", label: "Approve", toStage: approved });
    if (rejected) actions.push({ action: "reject", label: "Reject", toStage: rejected });
    return actions;
  }

  const nextStage = sequential[sequentialIdx + 1];
  return [
    {
      action: "advance",
      label: sequentialIdx === 0 ? "Submit" : `Move to ${nextStage}`,
      toStage: nextStage,
    },
  ];
}

export function isValidTransition(stages, fromStage, toStage) {
  return getAvailableActions(stages, fromStage).some((a) => a.toStage === toStage);
}

// Stages to render in a timeline: every sequential (non-outcome) stage, plus
// whichever outcome stage the history actually reached. If no outcome has
// been reached yet, the workflow's "Approved" stage (if any) is shown as the
// pending next step, since it's the default/expected path.
export function getTimelineStages(stages = [], history = []) {
  const sequential = stages.filter((s) => !isOutcomeStage(s));
  const reachedOutcome = history.map((h) => h.stage).find((s) => isOutcomeStage(s));
  if (reachedOutcome) return [...sequential, reachedOutcome];

  const approved = stages.find((s) => s.toLowerCase() === "approved");
  return approved ? [...sequential, approved] : sequential;
}
