# Week 6 Implementation Summary — Workflow Management System

## 1. What Is a Workflow?

A workflow is a defined sequence of stages that a piece of work moves through,
along with rules for who can move it and what happens at each step. Where a
**form** is just a structured way to *collect* data, a **workflow** is what
happens to that data *after* it's collected — who reviews it, what states it
can be in, and how it gets from "just submitted" to "decided." A form without
a workflow is a one-shot data entry; a form with a workflow becomes a process.

## 2. Real-World Examples

- **Leave Approval** — Draft → Submitted → Manager Review → Approved/Rejected.
- **Purchase Approval** — request raised, budget-holder review, finance
  sign-off, purchase order issued.
- **Expense Approval** — submitted, manager review, finance audit, reimbursed.
- **Jira** — To Do → In Progress → In Review → Done, with transitions gated by
  assignee/reporter permissions.
- **GitHub Pull Requests** — Open → Review Requested → Changes Requested/
  Approved → Merged, with required-reviewer rules mirroring role-based
  approval.

## 3. Benefits of Workflow Automation

Manual approval processes (email chains, spreadsheets) lose the *history* of
who did what and when, make it easy to skip a required reviewer, and give
nobody a single place to see what's pending. A modeled workflow gives every
submission a visible current status, an auditable history, and consistent
rules about which transitions are even possible — the same value Jira/GitHub
provide for engineering work, applied here to form submissions.

## 4. Workflow Schema

`src/schemas/workflowSchema.js` — a workflow is a name plus an ordered stage
list:

```json
{ "id": "workflow_1", "workflowName": "Leave Approval",
  "stages": ["Draft", "Submitted", "Manager Review", "Approved", "Rejected"] }
```

Stages named (case-insensitively) "Approved"/"Rejected" are treated as
terminal **outcome** stages by the transition logic — every other stage is
walked sequentially in array order.

## 5. Architecture Notes

- **State transitions** (`src/workflow/workflowTransitions.js`): pure
  function `getAvailableActions(stages, currentStage)` derives valid next
  moves from the stage list — sequential advance through non-outcome stages,
  Approve/Reject as a branch from the last stage before the outcomes, no
  actions from a terminal stage. `isValidTransition` prevents skipping stages
  or moving out of a terminal one. This is the same array the Workflow
  Configuration page edits, so a change there is immediately reflected in
  what actions are offered.
- **Workflow store** (`src/store/workflowStore.js`): CRUD for workflow
  definitions and their stages (add/rename/remove workflow; add/edit/remove/
  reorder stage), persisted separately from forms and submissions.
- **Linking a workflow to a form**: `formStore.js` gained a `workflowId`
  field, set via a "Workflow" dropdown in the Form Builder's Form Settings
  panel (`FormMetadata.jsx`) — the same place the form's name/description/
  version already live.
- **Submission workflow state** (`src/store/submissionStore.js`): each
  submission now carries `workflowId`, `stage` (the linked workflow's first
  stage at submission time, or `null` if no workflow is linked — fully
  backward compatible with forms that don't use one), `history` (an
  append-only array of `{ stage, action, user, comment, timestamp }`), and
  `assignedTo`. `advanceStage()` appends a history entry and updates `stage`;
  `assignUser()` sets the assignee.
- **Timeline** (`src/components/workflow/WorkflowTimeline.jsx` +
  `getTimelineStages()`): renders every sequential stage as reached (filled)
  or pending (hollow), plus whichever outcome stage was actually reached (or
  "Approved" as the expected pending next step before a decision is made).
- **Comments** (`src/components/workflow/CommentDialog.jsx`): Approve/Reject
  actions open a comment popup before completing; the comment is stored on
  the resulting history entry and shown in the timeline.
- **Role simulation** (`src/store/roleStore.js` +
  `src/workflow/rolePermissions.js`): no authentication — a dropdown in the
  header picks the "active user" from three mock accounts (Admin/Manager/
  Employee). Permissions gate which workflow actions are offered
  (`WorkflowActions.jsx`): Employees can only advance/submit, Managers can
  additionally approve/reject, and only Admins can configure workflows.
- **Dashboard** (`src/workflow/dashboardStats.js`): KPI cards (Pending
  Reviews, Approved Today, Rejected, Draft Forms) and two Recharts views
  (Forms by Status — bar; Workflow Distribution — pie) are computed live from
  the actual submissions/workflows stores, replacing the old hardcoded
  dashboard data.
- **Notifications**: `Toast` (existing Week 2 component) fires on form
  submission and on every workflow action (advance/approve/reject), with
  copy matching the spec's examples ("Form submitted successfully.",
  "<user> approved the request.", "Request rejected.").

## 6. Testing Strategy

Every pure module (`workflowTransitions`, `rolePermissions`, `workflowStore`,
`roleStore`, `submissionHelpers`/`submissionStore`, `dashboardStats`) has
Vitest unit tests. Page/component-level integration tests (Testing-Library)
exercise the full flows: configuring a workflow's stages, an Employee
submitting a Draft and a Manager advancing/approving it with a comment
through the Submissions page, the role switcher changing which actions are
visible, and the dashboard computing real KPI values from seeded
submissions. No browser session was available in this environment, so these
automated tests are the verification evidence in place of a manual
click-through — please still click through the flows in a real browser
before treating this as final.

## 7. Screenshots Checklist

- **Workflow Configuration** — stage creation; stage editing.
- **Workflow Timeline** — status progression on a submission's detail view.
- **Dashboard** — KPI cards; the bar and pie charts.
- **Submission Details** — timeline, workflow history, and a comment left on
  an approve/reject action.

## 8. Demo Session Prep

1. **Workflow schema design** — `workflowSchema.js`'s `{ workflowName,
   stages }` shape and why it's just an ordered list.
2. **State transition logic** — `getAvailableActions`/`isValidTransition` in
   `workflowTransitions.js`, and how "Approved"/"Rejected" are recognized as
   terminal outcomes.
3. **Timeline implementation** — `getTimelineStages` and how reached/pending/
   outcome stages are distinguished.
4. **Role-based UI behavior** — `rolePermissions.js` gating
   `WorkflowActions.jsx`, and the header's role switcher.
5. **Workflow history storage** — the `history` array on each submission in
   `submissionStore.js`, appended by `advanceStage()`.
6. **Dashboard statistics generation** — `dashboardStats.js` turning raw
   submissions into KPI counts and chart-ready arrays.
