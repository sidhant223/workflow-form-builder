import { describe, it, expect, vi, beforeEach } from "vitest";
import { useWorkflowStore } from "./workflowStore";
import { DEFAULT_WORKFLOWS } from "../schemas/workflowSchema";

vi.mock("../services/workflowService", () => ({
  getWorkflows: vi.fn().mockResolvedValue([]),
  createWorkflow: vi.fn().mockResolvedValue({}),
  updateWorkflow: vi.fn().mockResolvedValue({}),
  deleteWorkflow: vi.fn().mockResolvedValue({}),
}));

beforeEach(() => {
  useWorkflowStore.setState({
    workflows: DEFAULT_WORKFLOWS,
    nextId: 1,
    isLoading: false,
    error: null,
  });
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

  describe("fetchWorkflows", () => {
    it("loads workflows from the API", async () => {
      const { getWorkflows } = await import("../services/workflowService");
      getWorkflows.mockResolvedValueOnce([{ id: "w1", workflowName: "Expense Approval" }]);

      await useWorkflowStore.getState().fetchWorkflows();

      expect(useWorkflowStore.getState().workflows).toEqual([
        { id: "w1", workflowName: "Expense Approval" },
      ]);
      expect(useWorkflowStore.getState().isLoading).toBe(false);
    });

    it("sets an error message when the request fails", async () => {
      const { getWorkflows } = await import("../services/workflowService");
      getWorkflows.mockRejectedValueOnce({ message: "Network Error" });

      await useWorkflowStore.getState().fetchWorkflows();

      expect(useWorkflowStore.getState().error).toBe("Network Error");
      expect(useWorkflowStore.getState().isLoading).toBe(false);
    });
  });

  it("persists a new workflow to the API", async () => {
    const { createWorkflow: createWorkflowRequest } = await import("../services/workflowService");
    useWorkflowStore.getState().addWorkflow("Purchase Approval");

    expect(createWorkflowRequest).toHaveBeenCalledWith(
      expect.objectContaining({ workflowName: "Purchase Approval" })
    );
  });

  it("persists a stage edit to the API", async () => {
    const { updateWorkflow: updateWorkflowRequest } = await import("../services/workflowService");
    const id = useWorkflowStore.getState().workflows[0].id;

    useWorkflowStore.getState().addStage(id, "Final Sign-off");

    expect(updateWorkflowRequest).toHaveBeenCalledWith(
      id,
      expect.objectContaining({ stages: expect.arrayContaining(["Final Sign-off"]) })
    );
  });
});
