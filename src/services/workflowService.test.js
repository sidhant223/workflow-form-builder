import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "./api";
import { getWorkflows, createWorkflow, updateWorkflow, deleteWorkflow } from "./workflowService";

describe("workflowService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getWorkflows sends a GET to /workflows and unwraps the data", async () => {
    api.get.mockResolvedValue({ data: [{ id: "w1", workflowName: "Leave Approval" }] });
    const workflows = await getWorkflows();
    expect(api.get).toHaveBeenCalledWith("/workflows");
    expect(workflows).toEqual([{ id: "w1", workflowName: "Leave Approval" }]);
  });

  it("createWorkflow sends a POST to /workflows with the payload", async () => {
    const payload = { workflowName: "Expense Approval", stages: ["Draft"] };
    api.post.mockResolvedValue({ data: { id: "w2", ...payload } });
    const workflow = await createWorkflow(payload);
    expect(api.post).toHaveBeenCalledWith("/workflows", payload);
    expect(workflow).toEqual({ id: "w2", ...payload });
  });

  it("updateWorkflow sends a PUT to /workflows/:id with the payload", async () => {
    const payload = { workflowName: "Renamed", stages: ["Draft", "Approved"] };
    api.put.mockResolvedValue({ data: { id: "w2", ...payload } });
    const workflow = await updateWorkflow("w2", payload);
    expect(api.put).toHaveBeenCalledWith("/workflows/w2", payload);
    expect(workflow).toEqual({ id: "w2", ...payload });
  });

  it("deleteWorkflow sends a DELETE to /workflows/:id and resolves with the id", async () => {
    api.delete.mockResolvedValue({});
    const id = await deleteWorkflow("w2");
    expect(api.delete).toHaveBeenCalledWith("/workflows/w2");
    expect(id).toBe("w2");
  });
});
