import { describe, it, expect, beforeEach } from "vitest";
import { useWorkflowStore } from "./workflowStore";
import { DEFAULT_WORKFLOWS } from "../schemas/workflowSchema";

beforeEach(() => {
  useWorkflowStore.setState({ workflows: DEFAULT_WORKFLOWS, nextId: 1 });
  localStorage.clear();
});

describe("useWorkflowStore", () => {
  it("seeds a default Leave Approval workflow", () => {
    const { workflows } = useWorkflowStore.getState();
    expect(workflows).toHaveLength(1);
    expect(workflows[0].workflowName).toBe("Leave Approval");
  });

  it("adds a new workflow with default stages", () => {
    useWorkflowStore.getState().addWorkflow("Purchase Approval");
    const { workflows } = useWorkflowStore.getState();
    expect(workflows).toHaveLength(2);
    expect(workflows[1].workflowName).toBe("Purchase Approval");
    expect(workflows[1].stages).toEqual(["Draft", "Submitted", "Approved", "Rejected"]);
  });

  it("renames a workflow", () => {
    const id = useWorkflowStore.getState().workflows[0].id;
    useWorkflowStore.getState().updateWorkflowName(id, "Renamed Workflow");
    expect(useWorkflowStore.getState().workflows[0].workflowName).toBe("Renamed Workflow");
  });

  it("removes a workflow", () => {
    const id = useWorkflowStore.getState().workflows[0].id;
    useWorkflowStore.getState().removeWorkflow(id);
    expect(useWorkflowStore.getState().workflows).toHaveLength(0);
  });

  it("adds, edits, removes, and reorders stages", () => {
    const id = useWorkflowStore.getState().workflows[0].id;

    useWorkflowStore.getState().addStage(id, "Final Sign-off");
    expect(useWorkflowStore.getState().workflows[0].stages).toEqual([
      "Draft",
      "Submitted",
      "Manager Review",
      "Approved",
      "Rejected",
      "Final Sign-off",
    ]);

    useWorkflowStore.getState().updateStage(id, 0, "Drafting");
    expect(useWorkflowStore.getState().workflows[0].stages[0]).toBe("Drafting");

    useWorkflowStore.getState().removeStage(id, 5);
    expect(useWorkflowStore.getState().workflows[0].stages).toEqual([
      "Drafting",
      "Submitted",
      "Manager Review",
      "Approved",
      "Rejected",
    ]);

    useWorkflowStore.getState().reorderStage(id, 1, 2);
    expect(useWorkflowStore.getState().workflows[0].stages).toEqual([
      "Drafting",
      "Manager Review",
      "Submitted",
      "Approved",
      "Rejected",
    ]);
  });
});
