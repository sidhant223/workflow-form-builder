import { describe, it, expect } from "vitest";
import { getAvailableActions, isValidTransition, isOutcomeStage } from "./workflowTransitions";

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

describe("isValidTransition", () => {
  it("allows a transition that matches an available action", () => {
    expect(isValidTransition(STAGES, "Draft", "Submitted")).toBe(true);
    expect(isValidTransition(STAGES, "Manager Review", "Rejected")).toBe(true);
  });

  it("rejects skipping stages", () => {
    expect(isValidTransition(STAGES, "Draft", "Manager Review")).toBe(false);
    expect(isValidTransition(STAGES, "Draft", "Approved")).toBe(false);
  });

  it("rejects moving out of a terminal stage", () => {
    expect(isValidTransition(STAGES, "Approved", "Rejected")).toBe(false);
  });
});
