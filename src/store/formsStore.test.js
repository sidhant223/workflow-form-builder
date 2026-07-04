import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFormsStore } from "./formsStore";

vi.mock("../services/formService", () => ({
  getForms: vi.fn(),
  createForm: vi.fn(),
  updateForm: vi.fn(),
  deleteForm: vi.fn(),
}));

import { getForms, createForm, updateForm, deleteForm } from "../services/formService";

beforeEach(() => {
  useFormsStore.setState({ forms: [], isLoading: false, error: null });
  vi.clearAllMocks();
});

describe("useFormsStore", () => {
  describe("fetchForms", () => {
    it("loads forms from the API", async () => {
      getForms.mockResolvedValueOnce([{ id: "f1", formName: "Leave Request" }]);

      await useFormsStore.getState().fetchForms();

      expect(useFormsStore.getState().forms).toEqual([{ id: "f1", formName: "Leave Request" }]);
      expect(useFormsStore.getState().isLoading).toBe(false);
      expect(useFormsStore.getState().error).toBeNull();
    });

    it("sets an error message when the request fails", async () => {
      getForms.mockRejectedValueOnce({ message: "Network Error" });

      await useFormsStore.getState().fetchForms();

      expect(useFormsStore.getState().error).toBe("Network Error");
      expect(useFormsStore.getState().isLoading).toBe(false);
    });
  });

  describe("saveForm", () => {
    it("creates a new form with a client-generated id when it has none", async () => {
      createForm.mockImplementation((payload) => Promise.resolve(payload));

      const result = await useFormsStore.getState().saveForm({
        formName: "Feedback",
        fields: [],
        status: "Draft",
      });

      expect(result.success).toBe(true);
      expect(result.form.id).toEqual(expect.any(String));
      expect(createForm).toHaveBeenCalledWith(
        expect.objectContaining({ formName: "Feedback", id: expect.any(String) })
      );
      expect(useFormsStore.getState().forms).toEqual([result.form]);
    });

    it("updates an existing form when it already has an id", async () => {
      useFormsStore.setState({ forms: [{ id: "f1", formName: "Old Name" }] });
      updateForm.mockImplementation((id, payload) => Promise.resolve(payload));

      const result = await useFormsStore.getState().saveForm({ id: "f1", formName: "New Name" });

      expect(result.success).toBe(true);
      expect(updateForm).toHaveBeenCalledWith("f1", expect.objectContaining({ formName: "New Name" }));
      expect(useFormsStore.getState().forms).toEqual([{ id: "f1", formName: "New Name" }]);
    });

    it("reports failure and sets an error without touching local state", async () => {
      createForm.mockRejectedValueOnce({ message: "Server unavailable" });

      const result = await useFormsStore.getState().saveForm({ formName: "Feedback" });

      expect(result).toEqual({ success: false, error: "Server unavailable" });
      expect(useFormsStore.getState().forms).toEqual([]);
      expect(useFormsStore.getState().error).toBe("Server unavailable");
    });
  });

  describe("deleteFormById", () => {
    it("removes the form locally after a successful API delete", async () => {
      useFormsStore.setState({ forms: [{ id: "f1" }, { id: "f2" }] });
      deleteForm.mockResolvedValueOnce("f1");

      const result = await useFormsStore.getState().deleteFormById("f1");

      expect(result).toEqual({ success: true });
      expect(useFormsStore.getState().forms).toEqual([{ id: "f2" }]);
    });

    it("leaves the list untouched and sets an error when the delete fails", async () => {
      useFormsStore.setState({ forms: [{ id: "f1" }] });
      deleteForm.mockRejectedValueOnce({ message: "Server unavailable" });

      const result = await useFormsStore.getState().deleteFormById("f1");

      expect(result).toEqual({ success: false, error: "Server unavailable" });
      expect(useFormsStore.getState().forms).toEqual([{ id: "f1" }]);
    });
  });
});
