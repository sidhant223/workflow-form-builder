import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PendingApprovals from "./pendingApprovals";
import { useSubmissionStore } from "../store/submissionStore";
import { useWorkflowStore } from "../store/workflowStore";
import { useAuthStore, MOCK_USERS } from "../store/authStore";
import { DEFAULT_WORKFLOWS } from "../schemas/workflowSchema";
import { getSubmissions } from "../services/submissionService";

vi.mock("../services/submissionService", () => ({
  getSubmissions: vi.fn(),
  createSubmission: vi.fn().mockResolvedValue({}),
  updateSubmission: vi.fn().mockResolvedValue({}),
}));

beforeEach(() => {
  useSubmissionStore.setState({ submissions: [], isLoading: false, error: null });
  useWorkflowStore.setState({ workflows: DEFAULT_WORKFLOWS, nextId: 1 });
  useAuthStore.setState({ currentUserId: MOCK_USERS[0].id });
  getSubmissions.mockImplementation(() =>
    Promise.resolve(useSubmissionStore.getState().submissions)
  );
});

describe("PendingApprovals page", () => {
  it("only shows submissions that are still pending review", async () => {
    const workflowId = useWorkflowStore.getState().workflows[0].id;
    const stages = useWorkflowStore.getState().workflows[0].stages;

    useSubmissionStore.getState().addSubmission({
      formId: "leave_request",
      formName: "Leave Request",
      responses: { field_1: "Jane Doe" },
      fields: [{ id: "field_1", type: "text" }],
      workflowId,
      stages,
      submittedBy: "Jamie (Employee)",
    });
    useSubmissionStore.getState().addSubmission({
      formId: "feedback",
      formName: "Feedback",
      responses: { field_1: "Alice Smith" },
      fields: [{ id: "field_1", type: "text" }],
    });

    render(<PendingApprovals />);

    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
    expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument();
    expect(screen.getByText("Pending Approvals")).toBeInTheDocument();
  });
});
