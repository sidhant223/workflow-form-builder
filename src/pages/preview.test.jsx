import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Preview from "./preview";
import { useFormStore } from "../store/formStore";
import { useSubmissionStore } from "../store/submissionStore";

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
    });
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
