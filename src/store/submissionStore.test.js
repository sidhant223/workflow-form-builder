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

  it("starts a submission at the linked workflow's first stage with a Created history entry", () => {
    const record = useSubmissionStore.getState().addSubmission({
      formId: "leave_request",
      formName: "Leave Request",
      responses: {},
      fields: [],
      workflowId: "workflow_1",
      stages: ["Draft", "Submitted", "Approved", "Rejected"],
      submittedBy: "Jamie (Employee)",
    });

    expect(record.workflowId).toBe("workflow_1");
    expect(record.stage).toBe("Draft");
    expect(record.assignedTo).toBeNull();
    expect(record.history).toEqual([
      { stage: "Draft", action: "Created", user: "Jamie (Employee)", comment: "", timestamp: expect.any(String) },
    ]);
  });

  it("leaves stage null and history empty when no workflow is linked", () => {
    const record = useSubmissionStore.getState().addSubmission({
      formId: "feedback",
      formName: "Feedback",
      responses: {},
      fields: [],
    });

    expect(record.workflowId).toBeNull();
    expect(record.stage).toBeNull();
    expect(record.history).toEqual([]);
  });

  it("advanceStage moves the stage and appends a history entry", () => {
    const record = useSubmissionStore.getState().addSubmission({
      formId: "leave_request",
      formName: "Leave Request",
      responses: {},
      fields: [],
      workflowId: "workflow_1",
      stages: ["Draft", "Submitted", "Approved", "Rejected"],
      submittedBy: "Jamie (Employee)",
    });

    useSubmissionStore.getState().advanceStage(record.id, {
      toStage: "Submitted",
      action: "advance",
      user: "Jamie (Employee)",
    });

    const updated = useSubmissionStore.getState().submissions.find((s) => s.id === record.id);
    expect(updated.stage).toBe("Submitted");
    expect(updated.history).toHaveLength(2);
    expect(updated.history[1]).toMatchObject({
      stage: "Submitted",
      action: "advance",
      user: "Jamie (Employee)",
    });
  });

  it("advanceStage records an approval comment", () => {
    const record = useSubmissionStore.getState().addSubmission({
      formId: "leave_request",
      formName: "Leave Request",
      responses: {},
      fields: [],
      workflowId: "workflow_1",
      stages: ["Draft", "Approved", "Rejected"],
      submittedBy: "Jamie (Employee)",
    });

    useSubmissionStore.getState().advanceStage(record.id, {
      toStage: "Approved",
      action: "approve",
      user: "Morgan (Manager)",
      comment: "Looks good.",
    });

    const updated = useSubmissionStore.getState().submissions.find((s) => s.id === record.id);
    expect(updated.stage).toBe("Approved");
    expect(updated.history[1].comment).toBe("Looks good.");
  });

  it("assignUser sets the assigned reviewer", () => {
    const record = useSubmissionStore
      .getState()
      .addSubmission({ formId: "f", formName: "F", responses: {}, fields: [] });

    useSubmissionStore.getState().assignUser(record.id, "Morgan (Manager)");

    const updated = useSubmissionStore.getState().submissions.find((s) => s.id === record.id);
    expect(updated.assignedTo).toBe("Morgan (Manager)");
  });
});
