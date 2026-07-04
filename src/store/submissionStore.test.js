import { describe, it, expect, beforeEach } from "vitest";
import { useSubmissionStore } from "./submissionStore";

const FIELDS = [
  { id: "field_1", type: "text", label: "Name" },
  { id: "field_2", type: "email", label: "Email" },
];

beforeEach(() => {
  useSubmissionStore.setState({ submissions: [], nextRefNumber: 1 });
  localStorage.clear();
});

describe("useSubmissionStore", () => {
  it("records a submission with an incrementing reference number and computed display name", () => {
    const first = useSubmissionStore.getState().addSubmission({
      formId: "employee_form",
      formName: "Employee Form",
      responses: { field_1: "Jane Doe", field_2: "jane@test.com" },
      fields: FIELDS,
    });

    expect(first.referenceNumber).toBe("FORM-000001");
    expect(first.displayName).toBe("Jane Doe");
    expect(first.formId).toBe("employee_form");

    const second = useSubmissionStore.getState().addSubmission({
      formId: "employee_form",
      formName: "Employee Form",
      responses: { field_1: "", field_2: "" },
      fields: FIELDS,
    });

    expect(second.referenceNumber).toBe("FORM-000002");
    expect(second.displayName).toBe("Anonymous");
  });

  it("prepends new submissions so the most recent is first", () => {
    const first = useSubmissionStore
      .getState()
      .addSubmission({ formId: "f", formName: "F", responses: {}, fields: [] });
    const second = useSubmissionStore
      .getState()
      .addSubmission({ formId: "f", formName: "F", responses: {}, fields: [] });

    const { submissions } = useSubmissionStore.getState();
    expect(submissions).toHaveLength(2);
    expect(submissions[0].id).toBe(second.id);
    expect(submissions[1].id).toBe(first.id);
  });
});
