import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Preview from "./preview";
import { useFormStore } from "../store/formStore";
import { useSubmissionStore } from "../store/submissionStore";
import { useWorkflowStore } from "../store/workflowStore";
import { useAuthStore, MOCK_USERS } from "../store/authStore";

function renderPreview() {
  return render(
    <MemoryRouter>
      <Preview />
    </MemoryRouter>
  );
}

beforeEach(() => {
  useFormStore.getState().resetForm();
  useSubmissionStore.setState({ submissions: [], nextRefNumber: 1 });
  useAuthStore.setState({ currentUserId: MOCK_USERS[0].id });
  localStorage.clear();
});

describe("Preview page", () => {
  it("shows a friendly empty state when the builder has no fields", () => {
    renderPreview();
    expect(screen.getByText("No form to preview yet")).toBeInTheDocument();
  });

  it("validates, submits, records the submission, and shows a Thank You screen", async () => {
    const user = userEvent.setup();
    useFormStore.getState().loadSchema({
      formName: "Employee Registration",
      fields: [
        { id: "field_1", type: "text", label: "Full Name", placeholder: "Enter name", required: true },
        { id: "field_2", type: "email", label: "Email", placeholder: "name@example.com", required: true },
      ],
    });
    renderPreview();

    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Full Name is required")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Enter name"), "Jane Doe");
    await user.type(screen.getByPlaceholderText("name@example.com"), "jane@test.com");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Thank You")).toBeInTheDocument();
    expect(screen.getByText(/FORM-\d{6}/)).toBeInTheDocument();

    const submissions = useSubmissionStore.getState().submissions;
    expect(submissions).toHaveLength(1);
    expect(submissions[0]).toMatchObject({
      formId: "employee_registration",
      formName: "Employee Registration",
      displayName: "Jane Doe",
      responses: { field_1: "Jane Doe", field_2: "jane@test.com" },
      workflowId: null,
      stage: null,
    });
    expect(screen.getByText("Form submitted successfully.")).toBeInTheDocument();
  });

  it("starts a submission at the linked workflow's first stage", async () => {
    const user = userEvent.setup();
    const workflowId = useWorkflowStore.getState().workflows[0].id; // seeded "Leave Approval"
    useFormStore.getState().loadSchema({
      formName: "Leave Request",
      workflowId,
      fields: [{ id: "field_1", type: "text", label: "Reason", placeholder: "Why?" }],
    });
    renderPreview();

    await user.type(screen.getByPlaceholderText("Why?"), "Vacation");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Thank You")).toBeInTheDocument();

    const submissions = useSubmissionStore.getState().submissions;
    expect(submissions[0].workflowId).toBe(workflowId);
    expect(submissions[0].stage).toBe("Draft");
    expect(submissions[0].history).toHaveLength(1);
    expect(submissions[0].history[0]).toMatchObject({ stage: "Draft", action: "Created" });
  });

  it("lets the user submit another response after a successful submission", async () => {
    const user = userEvent.setup();
    useFormStore.getState().loadSchema({
      formName: "Feedback",
      fields: [{ id: "field_1", type: "text", label: "Comment", placeholder: "Say something" }],
    });
    renderPreview();

    await user.type(screen.getByPlaceholderText("Say something"), "Great app");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Thank You")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Submit Another Response" }));

    await waitFor(() =>
      expect(screen.getByPlaceholderText("Say something")).toBeInTheDocument()
    );
    expect(screen.getByPlaceholderText("Say something").value).toBe("");
  });
});
