import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./dashboard";
import { useSubmissionStore } from "../store/submissionStore";
import { useWorkflowStore } from "../store/workflowStore";
import { DEFAULT_WORKFLOWS } from "../schemas/workflowSchema";

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

beforeEach(() => {
  useSubmissionStore.setState({ submissions: [], nextRefNumber: 1 });
  useWorkflowStore.setState({ workflows: DEFAULT_WORKFLOWS, nextId: 1 });
  localStorage.clear();
});

describe("Dashboard", () => {
  it("shows all-zero KPI cards and an empty state with no submissions", () => {
    renderDashboard();
    expect(screen.getByText("Pending Reviews")).toBeInTheDocument();
    expect(screen.getAllByText("No submissions yet.").length).toBeGreaterThan(0);
  });

  it("computes real KPI values from submissions and lists recent ones", () => {
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
      responses: {},
      fields: [],
    });

    renderDashboard();

    expect(screen.getByText("Leave Request")).toBeInTheDocument();
    expect(screen.getByText("Feedback")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument(); // stage badge for the workflow submission

    // Draft Forms KPI card should read 1
    const draftCard = screen.getByText("Draft Forms").closest("div").parentElement;
    expect(draftCard.textContent).toContain("1");
  });
});
