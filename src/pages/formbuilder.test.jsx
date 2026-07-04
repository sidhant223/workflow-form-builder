import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import FormBuilder from "./formbuilder";
import { useFormStore } from "../store/formStore";
import { useFormsStore } from "../store/formsStore";
import { createForm, updateForm } from "../services/formService";

vi.mock("../services/formService", () => ({
  getForms: vi.fn().mockResolvedValue([]),
  createForm: vi.fn(),
  updateForm: vi.fn(),
  deleteForm: vi.fn().mockResolvedValue({}),
}));

// Field selection happens by clicking a DraggableField card, whose root element
// also carries @dnd-kit's pointer-sensor listeners. In jsdom, userEvent's full
// pointerdown/pointerup/click sequence gets swallowed by those listeners before
// the card's own onClick ever fires, so field selection uses fireEvent.click
// (a bare click event) instead of userEvent.click.

function renderBuilder() {
  return render(
    <MemoryRouter>
      <FormBuilder />
    </MemoryRouter>
  );
}

beforeEach(() => {
  useFormStore.getState().resetForm();
  useFormsStore.setState({ forms: [], isLoading: false, error: null });
});

describe("FormBuilder page", () => {
  it("Load Sample actually loads fields (regression: it used to load an empty form)", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(screen.getByRole("button", { name: "Load Sample" }));

    expect(useFormStore.getState().fields.length).toBeGreaterThan(0);
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("opens the template picker and loads the selected template onto the canvas", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(screen.getByRole("button", { name: "Use Template" }));
    expect(screen.getByText("Employee Registration")).toBeInTheDocument();

    const leaveRequestCard = screen.getByText("Leave Request").closest("div");
    await user.click(
      within(leaveRequestCard).getByRole("button", { name: "Create From Template" })
    );

    expect(useFormStore.getState().formName).toBe("Leave Request");
    expect(useFormStore.getState().sections).toHaveLength(2);
    expect(screen.getByText("Leave Type")).toBeInTheDocument();
    expect(screen.getByText(/Steps \(2\)/)).toBeInTheDocument();
  });

  it("lets a form creator configure length validation on the selected field", async () => {
    const user = userEvent.setup();
    useFormStore.getState().loadSchema({
      formName: "Test Form",
      fields: [{ id: "field_1", type: "text", label: "Full Name", required: false }],
    });
    renderBuilder();

    fireEvent.click(screen.getByText("Full Name"));
    await user.type(screen.getByLabelText("Min Length"), "3");

    expect(useFormStore.getState().fields[0].minLength).toBe(3);
  });

  it("lets a form creator configure conditional visibility between two fields", async () => {
    const user = userEvent.setup();
    useFormStore.getState().loadSchema({
      formName: "Test Form",
      fields: [
        {
          id: "field_1",
          type: "radio",
          label: "Are you employed?",
          options: ["Yes", "No"],
        },
        { id: "field_2", type: "text", label: "Company Name" },
      ],
    });
    renderBuilder();

    fireEvent.click(screen.getByText("Company Name"));
    await user.selectOptions(
      screen.getByLabelText(/Show this field only when/i),
      "field_1"
    );
    await user.selectOptions(screen.getByLabelText("Expected value"), "Yes");

    expect(useFormStore.getState().fields[1].showIf).toEqual({
      field: "field_1",
      value: "Yes",
    });
  });

  it("lets a form creator add steps and assign a field to one", async () => {
    const user = userEvent.setup();
    useFormStore.getState().loadSchema({
      formName: "Test Form",
      fields: [{ id: "field_1", type: "text", label: "Full Name" }],
    });
    renderBuilder();

    await user.type(screen.getByPlaceholderText("New step name"), "Personal Info");
    await user.click(screen.getByRole("button", { name: "+ Add Step" }));

    expect(useFormStore.getState().sections).toHaveLength(1);

    fireEvent.click(screen.getByText("Full Name"));
    const stepSelect = screen.getByLabelText("Step");
    const sectionId = useFormStore.getState().sections[0].id;
    await user.selectOptions(stepSelect, sectionId);

    expect(useFormStore.getState().fields[0].sectionId).toBe(sectionId);
  });

  it("saves a new form via the API and records its assigned id", async () => {
    createForm.mockImplementation((payload) => Promise.resolve(payload));
    const user = userEvent.setup();
    useFormStore.getState().loadSchema({
      formName: "Feedback",
      fields: [{ id: "field_1", type: "text", label: "Comment" }],
    });
    renderBuilder();

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Form saved.")).toBeInTheDocument();
    expect(createForm).toHaveBeenCalledWith(
      expect.objectContaining({ formName: "Feedback", status: "Draft" })
    );
    expect(useFormStore.getState().id).toEqual(expect.any(String));
  });

  it("publishes a form, setting its status to Published", async () => {
    createForm.mockImplementation((payload) => Promise.resolve(payload));
    updateForm.mockImplementation((id, payload) => Promise.resolve(payload));
    const user = userEvent.setup();
    useFormStore.getState().loadSchema({
      formName: "Feedback",
      fields: [{ id: "field_1", type: "text", label: "Comment" }],
    });
    renderBuilder();

    await user.click(screen.getByRole("button", { name: "Publish" }));

    expect(await screen.findByText("Form published.")).toBeInTheDocument();
    expect(useFormStore.getState().status).toBe("Published");
  });
});
