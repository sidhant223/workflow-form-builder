// src/schemas/workflowSchema.js
// -----------------------------------------------------------------------------
// Reusable JSON schema model for workflows.
//
// A workflow is just a name plus an ordered list of stage names:
//
//   { id: "workflow_1", workflowName: "Leave Approval",
//     stages: ["Draft", "Submitted", "Manager Review", "Approved", "Rejected"] }
//
// Stages are walked in array order. A stage literally named "Approved" or
// "Rejected" (case-insensitive) is treated as a terminal outcome stage — see
// src/workflow/workflowTransitions.js for the transition rules built on top of
// this shape.
// -----------------------------------------------------------------------------

export function createWorkflow(id, workflowName = "New Workflow") {
  return {
    id,
    workflowName,
    stages: ["Draft", "Submitted", "Approved", "Rejected"],
  };
}

export const DEFAULT_WORKFLOWS = [
  {
    id: "workflow_default_leave_approval",
    workflowName: "Leave Approval",
    stages: ["Draft", "Submitted", "Manager Review", "Approved", "Rejected"],
  },
];
