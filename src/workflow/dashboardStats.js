// src/workflow/dashboardStats.js
// Pure functions turning the raw submissions/workflows arrays into the
// dashboard's KPI cards and chart data.

import { isOutcomeStage } from "./workflowTransitions";

function isSameCalendarDay(isoString, now) {
  const submittedDate = new Date(isoString);
  const referenceDate = new Date(now);
  return (
    submittedDate.getFullYear() === referenceDate.getFullYear() &&
    submittedDate.getMonth() === referenceDate.getMonth() &&
    submittedDate.getDate() === referenceDate.getDate()
  );
}

export function computeDashboardStats(submissions, { now = Date.now() } = {}) {
  let pendingReviews = 0;
  let approvedToday = 0;
  let rejected = 0;
  let draftForms = 0;

  submissions.forEach((s) => {
    if (!s.stage) return;
    const stage = s.stage.toLowerCase();

    if (stage === "draft") draftForms += 1;
    if (stage === "rejected") rejected += 1;
    if (stage === "approved") {
      const approvedEntry = [...s.history].reverse().find((h) => h.stage === s.stage);
      if (approvedEntry && isSameCalendarDay(approvedEntry.timestamp, now)) {
        approvedToday += 1;
      }
    }
    if (!isOutcomeStage(s.stage)) pendingReviews += 1;
  });

  return { pendingReviews, approvedToday, rejected, draftForms };
}

export function computeFormsByStatus(submissions) {
  const counts = {};
  submissions.forEach((s) => {
    const key = s.stage || "No Workflow";
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).map(([name, count]) => ({ name, count }));
}

export function computeWorkflowDistribution(submissions, workflows) {
  const nameById = new Map(workflows.map((w) => [w.id, w.workflowName]));
  const counts = {};
  submissions.forEach((s) => {
    const key = s.workflowId ? nameById.get(s.workflowId) || "Unknown Workflow" : "No Workflow";
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}
