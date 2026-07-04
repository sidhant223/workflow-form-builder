// src/store/formsStore.js
// The saved-forms list (Forms page CRUD), backed by the mock REST API (see
// src/services/formService.js). Unlike workflowStore/submissionStore's
// fire-and-forget background sync, saveForm/deleteFormById are explicit,
// user-triggered actions — they await the API call and only update local
// state on success, so the Forms page can report a real success/failure
// result back to the caller.
//
// This is separate from src/store/formStore.js, which holds the Form
// Builder's single in-progress draft; formsStore is the persisted list of
// forms that draft gets saved into.

import { create } from "zustand";
import { getForms, createForm, updateForm, deleteForm } from "../services/formService";

export const useFormsStore = create((set) => ({
  forms: [],
  isLoading: false,
  error: null,

  fetchForms: async () => {
    set({ isLoading: true, error: null });
    try {
      const forms = await getForms();
      set({ forms, isLoading: false });
    } catch (err) {
      set({ error: err.message || "Unable to load forms. Please try again.", isLoading: false });
    }
  },

  saveForm: async (formData) => {
    try {
      if (formData.id) {
        const saved = await updateForm(formData.id, formData);
        set((state) => ({
          forms: state.forms.map((f) => (f.id === saved.id ? saved : f)),
        }));
        return { success: true, form: saved };
      }

      const id = `form_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const payload = { ...formData, id, createdAt: new Date().toISOString() };
      const saved = await createForm(payload);
      set((state) => ({ forms: [saved, ...state.forms] }));
      return { success: true, form: saved };
    } catch (err) {
      const message = err.message || "Unable to save the form. Please try again.";
      set({ error: message });
      return { success: false, error: message };
    }
  },

  deleteFormById: async (id) => {
    try {
      await deleteForm(id);
      set((state) => ({ forms: state.forms.filter((f) => f.id !== id) }));
      return { success: true };
    } catch (err) {
      const message = err.message || "Unable to delete the form. Please try again.";
      set({ error: message });
      return { success: false, error: message };
    }
  },
}));
