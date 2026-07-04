import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatReferenceNumber, extractDisplayName } from "./submissionHelpers";

export const useSubmissionStore = create(
  persist(
    (set, get) => ({
      submissions: [],
      nextRefNumber: 1,

      addSubmission: ({ formId, formName, responses, fields }) => {
        const { nextRefNumber } = get();
        const record = {
          id: `submission_${nextRefNumber}`,
          formId,
          formName,
          displayName: extractDisplayName(responses, fields),
          submittedAt: new Date().toISOString(),
          responses,
          referenceNumber: formatReferenceNumber(nextRefNumber),
        };

        set((state) => ({
          submissions: [record, ...state.submissions],
          nextRefNumber: state.nextRefNumber + 1,
        }));

        return record;
      },
    }),
    { name: "form-submissions" }
  )
);
