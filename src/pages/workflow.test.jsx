import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Workflow from "./workflow";
import { useWorkflowStore } from "../store/workflowStore";
import { useAuthStore, MOCK_USERS } from "../store/authStore";
import { DEFAULT_WORKFLOWS } from "../schemas/workflowSchema";

beforeEach(() => {
  useWorkflowStore.setState({ workflows: DEFAULT_WORKFLOWS, nextId: 1 });
  useAuthStore.setState({ currentUserId: MOCK_USERS[0].id }); // Admin
  localStorage.clear();
});

describe("Workflow configuration page (Admin)", () => {
  it("lists the default workflow with editable stage inputs", () => {
    render(<Workflow />);
    expect(screen.getByDisplayValue("Leave Approval")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Draft")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Manager Review")).toBeInTheDocument();
  });

  it("creates a new workflow with default stages", async () => {
    const user = userEvent.setup();
    render(<Workflow />);

    await user.type(screen.getByPlaceholderText("New workflow name"), "Purchase Approval");
    await user.click(screen.getByRole("button", { name: "+ New Workflow" }));

    expect(screen.getByDisplayValue("Purchase Approval")).toBeInTheDocument();
    expect(useWorkflowStore.getState().workflows).toHaveLength(2);
  });

  it("adds, edits, and deletes a stage", async () => {
    const user = userEvent.setup();
    render(<Workflow />);
    const workflowId = useWorkflowStore.getState().workflows[0].id;

    await user.type(screen.getByPlaceholderText("New stage name"), "Final Sign-off");
    await user.click(screen.getByRole("button", { name: "+ Add Stage" }));
    expect(screen.getByDisplayValue("Final Sign-off")).toBeInTheDocument();

    await user.clear(screen.getByDisplayValue("Final Sign-off"));
    await user.type(screen.getByLabelText("Stage 6"), "Archived");
    expect(useWorkflowStore.getState().workflows.find((w) => w.id === workflowId).stages).toContain(
      "Archived"
    );

    await user.click(screen.getByRole("button", { name: "Delete Archived" }));
    expect(
      useWorkflowStore.getState().workflows.find((w) => w.id === workflowId).stages
    ).not.toContain("Archived");
  });

  it("deletes a whole workflow", async () => {
    const user = userEvent.setup();
    render(<Workflow />);

    await user.click(screen.getByRole("button", { name: "🗑️ Delete Workflow" }));

    expect(useWorkflowStore.getState().workflows).toHaveLength(0);
    expect(screen.getByText("No workflows configured yet")).toBeInTheDocument();
  });
});

describe("Workflow configuration page (non-Admin)", () => {
  it("shows a read-only view for a Manager", () => {
    useAuthStore.setState({ currentUserId: "user_manager" });
    render(<Workflow />);

    expect(screen.getByText(/Only Admins can configure workflows/)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("New workflow name")).not.toBeInTheDocument();
    expect(screen.getByText("Leave Approval")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });
});
