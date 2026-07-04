import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Forms from "./forms";
import { useFormsStore } from "../store/formsStore";
import { useFormStore } from "../store/formStore";
import { useAuthStore, MOCK_USERS } from "../store/authStore";
import { getForms, deleteForm } from "../services/formService";

vi.mock("../services/formService", () => ({
  getForms: vi.fn(),
  createForm: vi.fn().mockResolvedValue({}),
  updateForm: vi.fn().mockResolvedValue({}),
  deleteForm: vi.fn().mockResolvedValue({}),
}));

function renderForms() {
  return render(
    <MemoryRouter>
      <Forms />
    </MemoryRouter>
  );
}

const SEED_FORMS = [
  {
    id: "f1",
    formName: "Employee Registration",
    formDescription: "Onboarding",
    status: "Published",
    fields: [],
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "f2",
    formName: "Leave Request",
    formDescription: "Time off",
    status: "Draft",
    fields: [],
    createdAt: "2026-05-01T00:00:00.000Z",
  },
];

beforeEach(() => {
  useFormsStore.setState({ forms: [], isLoading: false, error: null });
  useFormStore.getState().resetForm();
  useAuthStore.setState({ currentUserId: MOCK_USERS[0].id }); // Admin
  getForms.mockImplementation(() => Promise.resolve(useFormsStore.getState().forms));
});

describe("Forms page (Admin)", () => {
  it("shows an empty state when there are no forms", async () => {
    renderForms();
    expect(await screen.findByText("No Forms Available")).toBeInTheDocument();
  });

  it("lists saved forms with status badges", async () => {
    useFormsStore.setState({ forms: SEED_FORMS });
    renderForms();

    expect(await screen.findByText("Employee Registration")).toBeInTheDocument();
    expect(screen.getByText("Leave Request")).toBeInTheDocument();
    expect(screen.getAllByText("Published").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Draft").length).toBeGreaterThan(0);
  });

  it("filters by search term", async () => {
    useFormsStore.setState({ forms: SEED_FORMS });
    const user = userEvent.setup();
    renderForms();
    await screen.findByText("Employee Registration");

    await user.type(screen.getByPlaceholderText("Search by form name…"), "leave");

    expect(screen.getByText("Leave Request")).toBeInTheDocument();
    expect(screen.queryByText("Employee Registration")).not.toBeInTheDocument();
  });

  it("filters by status", async () => {
    useFormsStore.setState({ forms: SEED_FORMS });
    const user = userEvent.setup();
    renderForms();
    await screen.findByText("Employee Registration");

    await user.selectOptions(screen.getByLabelText("Filter by status"), "Draft");

    expect(screen.getByText("Leave Request")).toBeInTheDocument();
    expect(screen.queryByText("Employee Registration")).not.toBeInTheDocument();
  });

  it("loads a form into the builder when Edit is clicked", async () => {
    useFormsStore.setState({ forms: SEED_FORMS });
    const user = userEvent.setup();
    renderForms();
    const row = (await screen.findByText("Employee Registration")).closest(".border-b");

    await user.click(within(row).getByRole("button", { name: "Edit" }));

    expect(useFormStore.getState().id).toBe("f1");
    expect(useFormStore.getState().formName).toBe("Employee Registration");
  });

  it("loads a form into the builder when Fill Form is clicked", async () => {
    useFormsStore.setState({ forms: SEED_FORMS });
    const user = userEvent.setup();
    renderForms();
    const row = (await screen.findByText("Employee Registration")).closest(".border-b");

    await user.click(within(row).getByRole("button", { name: "Fill Form" }));

    expect(useFormStore.getState().id).toBe("f1");
  });

  it("deletes a form after confirmation", async () => {
    useFormsStore.setState({ forms: SEED_FORMS });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    deleteForm.mockResolvedValueOnce("f1");
    const user = userEvent.setup();
    renderForms();
    const row = (await screen.findByText("Employee Registration")).closest(".border-b");

    await user.click(within(row).getByRole("button", { name: "Delete" }));

    expect(deleteForm).toHaveBeenCalledWith("f1");
    expect(await screen.findByText("Leave Request")).toBeInTheDocument();
    expect(screen.queryByText("Employee Registration")).not.toBeInTheDocument();
  });
});

describe("Forms page (Employee)", () => {
  beforeEach(() => {
    useAuthStore.setState({ currentUserId: "user_employee" });
  });

  it("hides New/Edit/Delete but still allows filling out a form", async () => {
    useFormsStore.setState({ forms: SEED_FORMS });
    renderForms();
    await screen.findByText("Employee Registration");

    expect(screen.queryByRole("button", { name: "+ New Form" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Fill Form" }).length).toBe(2);
  });
});
