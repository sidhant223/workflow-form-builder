// src/store/submissionStore.js
// Submission records, backed by the mock REST API (see src/services/
// submissionService.js) instead of localStorage. fetchSubmissions() is the
// real "load from the server" path; mutating actions (addSubmission,
// advanceStage, assignUser) update local state immediately so the UI never
// blocks on the network, then persist the change to the server in the
// background — a client-generated id is included on create so the local and
// server records always agree without waiting on a round trip.

import { create } from "zustand";
import {
  formatReferenceNumber,
  extractDisplayName,
  initialStage,
  buildHistoryEntry,
} from "./submissionHelpers";
import { getSubmissions, createSubmission, updateSubmission } from "../services/submissionService";

export const useSubmissionStore = create((set, get) => ({
  submissions: [],
  isLoading: false,
  error: null,

  fetchSubmissions: async () => {
    set({ isLoading: true, error: null });
    try {
      const submissions = await getSubmissions();
      set({ submissions, isLoading: false });
    } catch (err) {
      set({ error: err.message || "Unable to load submissions. Please try again.", isLoading: false });
    }
  },

  addSubmission: ({ formId, formName, responses, fields, workflowId = null, stages = [], submittedBy }) => {
    const { submissions } = get();
    const stage = initialStage(stages);
    const record = {
      id: `submission_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      formId,
      formName,
      displayName: extractDisplayName(responses, fields),
      submittedBy: submittedBy || "Unknown",
      submittedAt: new Date().toISOString(),
      responses,
      referenceNumber: formatReferenceNumber(submissions.length + 1),
      workflowId,
      stage,
      assignedTo: null,
      history: stage ? [buildHistoryEntry({ stage, action: "Created", user: submittedBy })] : [],
    };

    set({ submissions: [record, ...submissions] });
    createSubmission(record).catch((err) => set({ error: err.message }));

    return record;
  },

  advanceStage: (submissionId, { toStage, action, user, comment }) => {
    let updatedRecord = null;
    set((state) => ({
      submissions: state.submissions.map((s) => {
        if (s.id !== submissionId) return s;
        updatedRecord = {
          ...s,
          stage: toStage,
          history: [...s.history, buildHistoryEntry({ stage: toStage, action, user, comment })],
        };
        return updatedRecord;
      }),
    }));
    if (updatedRecord) {
      updateSubmission(submissionId, updatedRecord).catch((err) => set({ error: err.message }));
    }
  },

  assignUser: (submissionId, userName) => {
    let updatedRecord = null;
    set((state) => ({
      submissions: state.submissions.map((s) => {
        if (s.id !== submissionId) return s;
        updatedRecord = { ...s, assignedTo: userName };
        return updatedRecord;
      }),
    }));
    if (updatedRecord) {
      updateSubmission(submissionId, updatedRecord).catch((err) => set({ error: err.message }));
    }
  },
}));
