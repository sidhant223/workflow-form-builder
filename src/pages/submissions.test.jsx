import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Submissions from "./submissions";
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
  // The page fetches on mount; resolve it with whatever the test already
  // seeded into the store so the fetch behaves like a same-data refresh.
  getSubmissions.mockImplementation(() =>
    Promise.resolve(useSubmissionStore.getState().submissions)
  );
});

function seedSubmissions() {
  useSubmissionStore.getState().addSubmission({
    formId: "employee_registration",
    formName: "Employee Registration",
    responses: { field_1: "Jane Doe", field_2: "jane@test.com" },
    fields: [
      { id: "field_1", type: "text" },
      { id: "field_2", type: "email" },
    ],
  });
  useSubmissionStore.getState().addSubmission({
    formId: "customer_feedback",
    formName: "Customer Feedback",
    responses: { field_1: "Alice Smith", field_2: "5" },
    fields: [
      { id: "field_1", type: "text" },
      { id: "field_2", type: "text" },
    ],
  });
}

describe("Submissions page", () => {
  it("shows an empty state when there are no submissions", async () => {
    render(<Submissions />);
    expect(await screen.findByText("No submissions yet")).toBeInTheDocument();
  });

  it("lists every submission with its respondent name and form name", async () => {
    seedSubmissions();
    render(<Submissions />);

    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
  });

  it("filters the list by search term", async () => {
    seedSubmissions();
    const user = userEvent.setup();
    render(<Submissions />);

    await user.type(await screen.findByPlaceholderText(/Search by name/i), "jane");

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument();
  });

  it("opens a detail modal showing the full response", async () => {
    seedSubmissions();
    const user = userEvent.setup();
    render(<Submissions />);

    const janeRow = (await screen.findByText("Jane Doe")).closest(".border-b");
    await user.click(within(janeRow).getByRole("button", { name: "View Details" }));

    expect(screen.getByText("Submission Details")).toBeInTheDocument();
    expect(screen.getByText("jane@test.com")).toBeInTheDocument();
    expect(screen.getByText(/FORM-\d{6}/)).toBeInTheDocument();
  });
});

describe("Submissions page — workflow status and actions", () => {
  function seedWorkflowSubmission() {
    const workflowId = useWorkflowStore.getState().workflows[0].id; // Leave Approval
    const stages = useWorkflowStore.getState().workflows[0].stages;
    return useSubmissionStore.getState().addSubmission({
      formId: "leave_request",
      formName: "Leave Request",
      responses: { field_1: "Jane Doe" },
      fields: [{ id: "field_1", type: "text" }],
      workflowId,
      stages,
      submittedBy: "Jamie (Employee)",
    });
  }

  it("shows a status badge and lets an Employee submit a Draft, then a Manager advance and approve it", async () => {
    useAuthStore.setState({ currentUserId: "user_employee" });
    seedWorkflowSubmission();
    const user = userEvent.setup();
    render(<Submissions />);

    expect(await screen.findByText("Draft")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "View Details" }));
    expect(screen.getByText("Current Status")).toBeInTheDocument();

    // Employee: Draft -> Submitted
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Moved to Submitted.")).toBeInTheDocument();

    // Manager: Submitted -> Manager Review -> Approved (with a comment)
    useAuthStore.setState({ currentUserId: "user_manager" });
    await user.click(screen.getByRole("button", { name: "Move to Manager Review" }));
    expect(await screen.findByText("Moved to Manager Review.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Approve" }));
    const dialog = screen.getByText("Approve — Add a Comment").closest('[role="dialog"]');
    await user.type(within(dialog).getByLabelText("Comments"), "Approved, enjoy your trip.");
    await user.click(within(dialog).getByRole("button", { name: "Approve" }));

    expect(await screen.findByText(/approved the request\./)).toBeInTheDocument();

    const updated = useSubmissionStore.getState().submissions[0];
    expect(updated.stage).toBe("Approved");
    expect(updated.history.at(-1)).toMatchObject({
      stage: "Approved",
      action: "approve",
      comment: "Approved, enjoy your trip.",
    });
  });

  it("assigns the submission to a mock user", async () => {
    seedWorkflowSubmission();
    const user = userEvent.setup();
    render(<Submissions />);

    await user.click(await screen.findByRole("button", { name: "View Details" }));
    await user.selectOptions(screen.getByLabelText("Assigned To"), "Morgan (Manager)");

    expect(useSubmissionStore.getState().submissions[0].assignedTo).toBe("Morgan (Manager)");
  });
});
