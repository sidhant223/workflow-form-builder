import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormRenderer from "./FormRenderer";

const SIMPLE_SCHEMA = [
  {
    id: "field_1",
    type: "text",
    label: "Full Name",
    placeholder: "Enter name",
    required: true,
    minLength: 3,
  },
  {
    id: "field_2",
    type: "email",
    label: "Email",
    placeholder: "name@example.com",
    required: true,
  },
];

describe("FormRenderer — single page validation", () => {
  it("shows validation errors and blocks submit when fields are invalid", async () => {
    const onSubmit = vi.fn();
    render(<FormRenderer schema={SIMPLE_SCHEMA} showSubmit onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Full Name is required")).toBeInTheDocument();
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the captured values once every field is valid", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<FormRenderer schema={SIMPLE_SCHEMA} showSubmit onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText("Enter name"), "Jane Doe");
    await user.type(screen.getByPlaceholderText("name@example.com"), "jane@test.com");
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ field_1: "Jane Doe", field_2: "jane@test.com" })
    );
  });

  it("rejects an invalid email format", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<FormRenderer schema={SIMPLE_SCHEMA} showSubmit onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText("Enter name"), "Jane Doe");
    await user.type(screen.getByPlaceholderText("name@example.com"), "not-an-email");
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Invalid email address")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

const CONDITIONAL_SCHEMA = [
  {
    id: "field_employed",
    type: "radio",
    label: "Are you employed?",
    options: ["Yes", "No"],
    required: true,
  },
  {
    id: "field_company",
    type: "text",
    label: "Company Name",
    placeholder: "Enter company",
    required: true,
    showIf: { field: "field_employed", value: "Yes" },
  },
];

describe("FormRenderer — conditional fields", () => {
  it("only shows the dependent field once the condition is met", async () => {
    const user = userEvent.setup();
    render(<FormRenderer schema={CONDITIONAL_SCHEMA} showSubmit onSubmit={() => {}} />);

    expect(screen.queryByPlaceholderText("Enter company")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("Yes"));

    expect(await screen.findByPlaceholderText("Enter company")).toBeInTheDocument();
  });

  it("drops validation for a field once it becomes hidden again", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<FormRenderer schema={CONDITIONAL_SCHEMA} showSubmit onSubmit={onSubmit} />);

    await user.click(screen.getByLabelText("Yes"));
    expect(await screen.findByPlaceholderText("Enter company")).toBeInTheDocument();

    await user.click(screen.getByLabelText("No"));
    await waitFor(() =>
      expect(screen.queryByPlaceholderText("Enter company")).not.toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ field_employed: "No", field_company: "" })
    );
  });
});

const STEP_SCHEMA = [
  {
    id: "field_name",
    type: "text",
    label: "Full Name",
    placeholder: "Enter name",
    required: true,
    sectionId: "section_1",
  },
  {
    id: "field_dept",
    type: "text",
    label: "Department",
    placeholder: "Enter department",
    required: true,
    sectionId: "section_2",
  },
];

const SECTIONS = [
  { id: "section_1", name: "Personal Information" },
  { id: "section_2", name: "Employment Information" },
];

describe("FormRenderer — multi-step", () => {
  it("blocks Next until the step's required field is filled, then walks to the review step and submits", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <FormRenderer schema={STEP_SCHEMA} sections={SECTIONS} showSubmit onSubmit={onSubmit} />
    );

    expect(screen.getByText("Step 1 of 3 — Personal Information")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Full Name is required")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3 — Personal Information")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Enter name"), "Jane Doe");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("Step 2 of 3 — Employment Information")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Enter department"), "Engineering");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("Step 3 of 3 — Review & Submit")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ field_name: "Jane Doe", field_dept: "Engineering" })
    );
  });
});
