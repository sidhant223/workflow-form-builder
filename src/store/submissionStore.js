import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  formatReferenceNumber,
  extractDisplayName,
  initialStage,
  buildHistoryEntry,
} from "./submissionHelpers";

export const useSubmissionStore = create(
  persist(
    (set, get) => ({
      submissions: [],
      nextRefNumber: 1,

      addSubmission: ({ formId, formName, responses, fields, workflowId = null, stages = [], submittedBy }) => {
        const { nextRefNumber } = get();
        const stage = initialStage(stages);
        const record = {
          id: `submission_${nextRefNumber}`,
          formId,
          formName,
          displayName: extractDisplayName(responses, fields),
          submittedAt: new Date().toISOString(),
          responses,
          referenceNumber: formatReferenceNumber(nextRefNumber),
          workflowId,
          stage,
          assignedTo: null,
          history: stage
            ? [buildHistoryEntry({ stage, action: "Created", user: submittedBy })]
            : [],
        };

        set((state) => ({
          submissions: [record, ...state.submissions],
          nextRefNumber: state.nextRefNumber + 1,
        }));

        return record;
      },

      advanceStage: (submissionId, { toStage, action, user, comment }) =>
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === submissionId
              ? {
                  ...s,
                  stage: toStage,
                  history: [...s.history, buildHistoryEntry({ stage: toStage, action, user, comment })],
                }
              : s
          ),
        })),

      assignUser: (submissionId, userName) =>
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === submissionId ? { ...s, assignedTo: userName } : s
          ),
        })),
    }),
    { name: "form-submissions" }
  )
);
