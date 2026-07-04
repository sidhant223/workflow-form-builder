import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MySubmissions from "./mySubmissions";
import { useSubmissionStore } from "../store/submissionStore";
import { useAuthStore, MOCK_USERS } from "../store/authStore";
import { getSubmissions } from "../services/submissionService";

vi.mock("../services/submissionService", () => ({
  getSubmissions: vi.fn(),
  createSubmission: vi.fn().mockResolvedValue({}),
  updateSubmission: vi.fn().mockResolvedValue({}),
}));

beforeEach(() => {
  useSubmissionStore.setState({ submissions: [], isLoading: false, error: null });
  useAuthStore.setState({ currentUserId: "user_employee" }); // Jamie (Employee)
  getSubmissions.mockImplementation(() =>
    Promise.resolve(useSubmissionStore.getState().submissions)
  );
});

describe("MySubmissions page", () => {
  it("only shows submissions the current user submitted themselves", async () => {
    useSubmissionStore.getState().addSubmission({
      formId: "feedback",
      formName: "Feedback",
      responses: { field_1: "Jamie" },
      fields: [{ id: "field_1", type: "text" }],
      submittedBy: "Jamie (Employee)",
    });
    useSubmissionStore.getState().addSubmission({
      formId: "leave_request",
      formName: "Leave Request",
      responses: { field_1: "Morgan" },
      fields: [{ id: "field_1", type: "text" }],
      submittedBy: "Morgan (Manager)",
    });

    render(<MySubmissions />);

    expect(await screen.findByText("Jamie")).toBeInTheDocument();
    expect(screen.queryByText("Morgan")).not.toBeInTheDocument();
    expect(screen.getByText("My Submissions")).toBeInTheDocument();
  });
});
