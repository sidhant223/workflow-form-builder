import { describe, it, expect } from "vitest";
import {
  formatReferenceNumber,
  extractDisplayName,
  filterSubmissions,
  initialStage,
  buildHistoryEntry,
} from "./submissionHelpers";

describe("formatReferenceNumber", () => {
  it("zero-pads to 6 digits with a FORM- prefix", () => {
    expect(formatReferenceNumber(1)).toBe("FORM-000001");
    expect(formatReferenceNumber(123)).toBe("FORM-000123");
  });
});

describe("extractDisplayName", () => {
  const fields = [
    { id: "f_name", type: "text" },
    { id: "f_email", type: "email" },
  ];

  it("picks the first text/email field with a value", () => {
    expect(extractDisplayName({ f_name: "Jane Doe", f_email: "jane@test.com" }, fields)).toBe(
      "Jane Doe"
    );
  });

  it("falls back to Anonymous when no text/email field has a value", () => {
    expect(extractDisplayName({ f_name: "", f_email: "" }, fields)).toBe("Anonymous");
  });
});

describe("filterSubmissions", () => {
  const now = 1_700_000_000_000; // fixed reference instant
  const submissions = [
    {
      id: "1",
      displayName: "Jane Doe",
      formName: "Employee Form",
      submittedAt: new Date(now).toISOString(),
    },
    {
      id: "2",
      displayName: "Alice Smith",
      formName: "Leave Form",
      submittedAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  it("matches search against displayName and formName, case-insensitively", () => {
    expect(filterSubmissions(submissions, { search: "jane", now })).toEqual([submissions[0]]);
    expect(filterSubmissions(submissions, { search: "leave", now })).toEqual([submissions[1]]);
  });

  it("filters by date window using the injected `now`", () => {
    expect(filterSubmissions(submissions, { dateFilter: "7days", now })).toEqual([
      submissions[0],
    ]);
    expect(filterSubmissions(submissions, { dateFilter: "30days", now })).toEqual(submissions);
  });

  it("returns everything for dateFilter 'all' and empty search", () => {
    expect(filterSubmissions(submissions, { now })).toEqual(submissions);
  });
});

describe("initialStage", () => {
  it("returns the first stage when a workflow is linked", () => {
    expect(initialStage(["Draft", "Submitted", "Approved"])).toBe("Draft");
  });

  it("returns null when there is no workflow", () => {
    expect(initialStage([])).toBeNull();
    expect(initialStage(undefined)).toBeNull();
  });
});

describe("buildHistoryEntry", () => {
  it("fills in defaults for an unattributed, comment-free entry", () => {
    const entry = buildHistoryEntry({ stage: "Draft", action: "Created" });
    expect(entry.stage).toBe("Draft");
    expect(entry.action).toBe("Created");
    expect(entry.user).toBe("Unknown");
    expect(entry.comment).toBe("");
    expect(entry.timestamp).toEqual(expect.any(String));
  });

  it("preserves an explicit user, comment, and timestamp", () => {
    const entry = buildHistoryEntry({
      stage: "Approved",
      action: "approve",
      user: "Morgan (Manager)",
      comment: "Looks good.",
      timestamp: "2026-07-04T00:00:00.000Z",
    });
    expect(entry).toEqual({
      stage: "Approved",
      action: "approve",
      user: "Morgan (Manager)",
      comment: "Looks good.",
      timestamp: "2026-07-04T00:00:00.000Z",
    });
  });
});
