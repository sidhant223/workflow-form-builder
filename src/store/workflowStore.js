// src/store/workflowStore.js
// Workflow definitions, backed by the mock REST API (see src/services/
// workflowService.js) instead of localStorage. fetchWorkflows() is the real
// "load from the server" path; mutating actions update local state
// immediately (so the editor never blocks on the network) and persist the
// full updated workflow to the server in the background — a client-generated
// id is included on create so the local and server records always agree
// without waiting on a round trip.

import { create } from "zustand";
import { createWorkflow, DEFAULT_WORKFLOWS } from "../schemas/workflowSchema";
import {
  getWorkflows,
  createWorkflow as createWorkflowRequest,
  updateWorkflow as updateWorkflowRequest,
  deleteWorkflow as deleteWorkflowRequest,
} from "../services/workflowService";

export const useWorkflowStore = create((set, get) => ({
  workflows: DEFAULT_WORKFLOWS,
  nextId: 1,
  isLoading: false,
  error: null,

  fetchWorkflows: async () => {
    set({ isLoading: true, error: null });
    try {
      const workflows = await getWorkflows();
      set({ workflows, isLoading: false });
    } catch (err) {
      set({ error: err.message || "Unable to load workflows. Please try again.", isLoading: false });
    }
  },

  addWorkflow: (name) => {
    const { nextId } = get();
    const id = `workflow_${nextId}`;
    const workflow = createWorkflow(id, name);
    set((state) => ({ workflows: [...state.workflows, workflow], nextId: state.nextId + 1 }));
    createWorkflowRequest(workflow).catch((err) => set({ error: err.message }));
  },

  updateWorkflowName: (id, workflowName) => {
    let updated = null;
    set((state) => ({
      workflows: state.workflows.map((w) => {
        if (w.id !== id) return w;
        updated = { ...w, workflowName };
        return updated;
      }),
    }));
    if (updated) updateWorkflowRequest(updated.id, updated).catch((err) => set({ error: err.message }));
  },

  removeWorkflow: (id) => {
    set((state) => ({ workflows: state.workflows.filter((w) => w.id !== id) }));
    deleteWorkflowRequest(id).catch((err) => set({ error: err.message }));
  },

  addStage: (workflowId, stageName) => {
    let updated = null;
    set((state) => ({
      workflows: state.workflows.map((w) => {
        if (w.id !== workflowId) return w;
        updated = { ...w, stages: [...w.stages, stageName] };
        return updated;
      }),
    }));
    if (updated) updateWorkflowRequest(updated.id, updated).catch((err) => set({ error: err.message }));
  },

  updateStage: (workflowId, index, stageName) => {
    let updated = null;
    set((state) => ({
      workflows: state.workflows.map((w) => {
        if (w.id !== workflowId) return w;
        const stages = [...w.stages];
        stages[index] = stageName;
        updated = { ...w, stages };
        return updated;
      }),
    }));
    if (updated) updateWorkflowRequest(updated.id, updated).catch((err) => set({ error: err.message }));
  },

  removeStage: (workflowId, index) => {
    let updated = null;
    set((state) => ({
      workflows: state.workflows.map((w) => {
        if (w.id !== workflowId) return w;
        updated = { ...w, stages: w.stages.filter((_, i) => i !== index) };
        return updated;
      }),
    }));
    if (updated) updateWorkflowRequest(updated.id, updated).catch((err) => set({ error: err.message }));
  },

  reorderStage: (workflowId, fromIndex, toIndex) => {
    let updated = null;
    set((state) => ({
      workflows: state.workflows.map((w) => {
        if (w.id !== workflowId) return w;
        const stages = [...w.stages];
        const [moved] = stages.splice(fromIndex, 1);
        stages.splice(toIndex, 0, moved);
        updated = { ...w, stages };
        return updated;
      }),
    }));
    if (updated) updateWorkflowRequest(updated.id, updated).catch((err) => set({ error: err.message }));
  },
}));
