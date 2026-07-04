// src/store/workflowStore.js
// Zustand store for workflow definitions (name + ordered stages), separate
// from formStore/submissionStore so workflow configuration survives resetting
// or editing an individual form.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createWorkflow, DEFAULT_WORKFLOWS } from "../schemas/workflowSchema";

export const useWorkflowStore = create(
  persist(
    (set) => ({
      workflows: DEFAULT_WORKFLOWS,
      nextId: 1,

      addWorkflow: (name) =>
        set((state) => {
          const id = `workflow_${state.nextId}`;
          return {
            workflows: [...state.workflows, createWorkflow(id, name)],
            nextId: state.nextId + 1,
          };
        }),

      updateWorkflowName: (id, workflowName) =>
        set((state) => ({
          workflows: state.workflows.map((w) => (w.id === id ? { ...w, workflowName } : w)),
        })),

      removeWorkflow: (id) =>
        set((state) => ({
          workflows: state.workflows.filter((w) => w.id !== id),
        })),

      addStage: (workflowId, stageName) =>
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId ? { ...w, stages: [...w.stages, stageName] } : w
          ),
        })),

      updateStage: (workflowId, index, stageName) =>
        set((state) => ({
          workflows: state.workflows.map((w) => {
            if (w.id !== workflowId) return w;
            const stages = [...w.stages];
            stages[index] = stageName;
            return { ...w, stages };
          }),
        })),

      removeStage: (workflowId, index) =>
        set((state) => ({
          workflows: state.workflows.map((w) => {
            if (w.id !== workflowId) return w;
            return { ...w, stages: w.stages.filter((_, i) => i !== index) };
          }),
        })),

      reorderStage: (workflowId, fromIndex, toIndex) =>
        set((state) => ({
          workflows: state.workflows.map((w) => {
            if (w.id !== workflowId) return w;
            const stages = [...w.stages];
            const [moved] = stages.splice(fromIndex, 1);
            stages.splice(toIndex, 0, moved);
            return { ...w, stages };
          }),
        })),
    }),
    { name: "workflow-definitions" }
  )
);
