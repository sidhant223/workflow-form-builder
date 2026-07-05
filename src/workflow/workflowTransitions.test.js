import { describe, it, expect } from "vitest";
import {
  getAvailableActions,
  isOutcomeStage,
  getTimelineStages,
} from "./workflowTransitions";

const STAGES = ["Draft", "Submitted", "Manager Review", "Approved", "Rejected"];

describe("isOutcomeStage", () => {
  it("recognizes Approved/Rejected case-insensitively", () => {
    expect(isOutcomeStage("Approved")).toBe(true);
    expect(isOutcomeStage("rejected")).toBe(true);
    expect(isOutcomeStage("Draft")).toBe(false);
  });
});

describe("getAvailableActions", () => {
  it("offers a single Submit action from the first stage", () => {
    expect(getAvailableActions(STAGES, "Draft")).toEqual([
      { action: "advance", label: "Submit", toStage: "Submitted" },
    ]);
  });

  it("offers a sequential advance from an intermediate non-review stage", () => {
    expect(getAvailableActions(STAGES, "Submitted")).toEqual([
      { action: "advance", label: "Move to Manager Review", toStage: "Manager Review" },
    ]);
  });

  it("offers Approve/Reject from the last review stage before the outcomes", () => {
    expect(getAvailableActions(STAGES, "Manager Review")).toEqual([
      { action: "approve", label: "Approve", toStage: "Approved" },
      { action: "reject", label: "Reject", toStage: "Rejected" },
    ]);
  });

  it("offers no actions from a terminal outcome stage", () => {
    expect(getAvailableActions(STAGES, "Approved")).toEqual([]);
    expect(getAvailableActions(STAGES, "Rejected")).toEqual([]);
  });

  it("returns no actions for an unknown stage", () => {
    expect(getAvailableActions(STAGES, "Nonexistent")).toEqual([]);
  });

  it("only offers Approve when no Rejected stage exists in the workflow", () => {
    const stages = ["Draft", "Review", "Approved"];
    expect(getAvailableActions(stages, "Review")).toEqual([
      { action: "approve", label: "Approve", toStage: "Approved" },
    ]);
  });
});

describe("getTimelineStages", () => {
  it("shows sequential stages plus a pending Approved before any decision", () => {
    const history = [{ stage: "Draft" }, { stage: "Submitted" }, { stage: "Manager Review" }];
    expect(getTimelineStages(STAGES, history)).toEqual([
      "Draft",
      "Submitted",
      "Manager Review",
      "Approved",
    ]);
  });

  it("shows the actually-reached outcome once a decision is made", () => {
    const history = [
      { stage: "Draft" },
      { stage: "Submitted" },
      { stage: "Manager Review" },
      { stage: "Rejected" },
    ];
    expect(getTimelineStages(STAGES, history)).toEqual([
      "Draft",
      "Submitted",
      "Manager Review",
      "Rejected",
    ]);
  });

  it("omits the pending stage when the workflow has no Approved stage", () => {
    expect(getTimelineStages(["Draft", "Rejected"], [])).toEqual(["Draft"]);
  });
});
