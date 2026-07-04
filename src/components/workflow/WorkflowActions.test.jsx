import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WorkflowActions from "./WorkflowActions";
import { useAuthStore, MOCK_USERS } from "../../store/authStore";

const STAGES = ["Draft", "Submitted", "Manager Review", "Approved", "Rejected"];

beforeEach(() => {
  useAuthStore.setState({ currentUserId: MOCK_USERS[0].id });
  localStorage.clear();
});

describe("WorkflowActions", () => {
  it("shows nothing when the submission has no linked workflow", () => {
    const { container } = render(
      <WorkflowActions stages={[]} currentStage={null} onAction={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a completion message at a terminal stage", () => {
    render(<WorkflowActions stages={STAGES} currentStage="Approved" onAction={() => {}} />);
    expect(screen.getByText(/reached its final stage/)).toBeInTheDocument();
  });

  it("lets an Employee submit a Draft directly, with no comment dialog", () => {
    useAuthStore.setState({ currentUserId: "user_employee" });
    const onAction = vi.fn();
    render(<WorkflowActions stages={STAGES} currentStage="Draft" onAction={onAction} />);

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(onAction).toHaveBeenCalledWith({
      toStage: "Submitted",
      action: "advance",
      user: "Jamie (Employee)",
      comment: "",
    });
  });

  it("tells an Employee they're waiting on a Manager at the review stage", () => {
    useAuthStore.setState({ currentUserId: "user_employee" });
    render(<WorkflowActions stages={STAGES} currentStage="Manager Review" onAction={() => {}} />);
    expect(screen.getByText(/Waiting on a Manager or Admin/)).toBeInTheDocument();
  });

  it("lets a Manager approve with a comment via the dialog", async () => {
    useAuthStore.setState({ currentUserId: "user_manager" });
    const onAction = vi.fn();
    const user = userEvent.setup();
    render(<WorkflowActions stages={STAGES} currentStage="Manager Review" onAction={onAction} />);

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Approve — Add a Comment")).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText("Comments"), "Looks good.");
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve" }));

    expect(onAction).toHaveBeenCalledWith({
      toStage: "Approved",
      action: "approve",
      user: "Morgan (Manager)",
      comment: "Looks good.",
    });
  });

  it("lets a Manager reject with a comment via the dialog", async () => {
    useAuthStore.setState({ currentUserId: "user_manager" });
    const onAction = vi.fn();
    const user = userEvent.setup();
    render(<WorkflowActions stages={STAGES} currentStage="Manager Review" onAction={onAction} />);

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText("Comments"), "Needs more detail.");
    fireEvent.click(within(dialog).getByRole("button", { name: "Reject" }));

    expect(onAction).toHaveBeenCalledWith({
      toStage: "Rejected",
      action: "reject",
      user: "Morgan (Manager)",
      comment: "Needs more detail.",
    });
  });
});
