import { describe, it, expect } from "vitest";
import {
  computeDashboardStats,
  computeFormsByStatus,
  computeWorkflowDistribution,
} from "./dashboardStats";

const NOW = new Date("2026-07-04T12:00:00.000Z").getTime();
const YESTERDAY = new Date("2026-07-03T12:00:00.000Z").toISOString();
const TODAY = new Date("2026-07-04T09:00:00.000Z").toISOString();

const submissions = [
  { stage: "Draft", workflowId: "wf_1", history: [] },
  { stage: "Submitted", workflowId: "wf_1", history: [] },
  { stage: "Manager Review", workflowId: "wf_1", history: [] },
  {
    stage: "Approved",
    workflowId: "wf_1",
    history: [
      { stage: "Manager Review", timestamp: YESTERDAY },
      { stage: "Approved", timestamp: TODAY },
    ],
  },
  {
    stage: "Approved",
    workflowId: "wf_1",
    history: [{ stage: "Approved", timestamp: YESTERDAY }],
  },
  { stage: "Rejected", workflowId: "wf_2", history: [] },
  { stage: null, workflowId: null, history: [] },
];

describe("computeDashboardStats", () => {
  it("counts pending reviews, today's approvals, rejections, and drafts", () => {
    expect(computeDashboardStats(submissions, { now: NOW })).toEqual({
      pendingReviews: 3, // Draft, Submitted, Manager Review
      approvedToday: 1, // only the one approved today, not the one approved yesterday
      rejected: 1,
      draftForms: 1,
    });
  });

  it("returns all zeros for an empty submission list", () => {
    expect(computeDashboardStats([], { now: NOW })).toEqual({
      pendingReviews: 0,
      approvedToday: 0,
      rejected: 0,
      draftForms: 0,
    });
  });
});

describe("computeFormsByStatus", () => {
  it("buckets submissions by current stage, with a No Workflow bucket for unlinked ones", () => {
    const result = computeFormsByStatus(submissions);
    const byName = Object.fromEntries(result.map((r) => [r.name, r.count]));
    expect(byName).toEqual({
      Draft: 1,
      Submitted: 1,
      "Manager Review": 1,
      Approved: 2,
      Rejected: 1,
      "No Workflow": 1,
    });
  });
});

describe("computeWorkflowDistribution", () => {
  it("buckets submissions by their linked workflow's name", () => {
    const workflows = [
      { id: "wf_1", workflowName: "Leave Approval" },
      { id: "wf_2", workflowName: "Purchase Approval" },
    ];
    const result = computeWorkflowDistribution(submissions, workflows);
    const byName = Object.fromEntries(result.map((r) => [r.name, r.value]));
    expect(byName).toEqual({
      "Leave Approval": 5,
      "Purchase Approval": 1,
      "No Workflow": 1,
    });
  });
});
