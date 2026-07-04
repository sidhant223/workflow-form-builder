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

  it("matches search against response values (e.g. an email field)", () => {
    const withResponses = [
      { ...submissions[0], responses: { email: "jane@test.com" } },
      { ...submissions[1], responses: { email: "alice@test.com" } },
    ];
    expect(filterSubmissions(withResponses, { search: "jane@test.com", now })).toEqual([
      withResponses[0],
    ]);
  });

  describe("statusFilter", () => {
    const withStages = [
      { ...submissions[0], stage: "Approved" },
      { ...submissions[1], stage: "Rejected" },
      { id: "3", displayName: "Bob", formName: "Feedback", submittedAt: submissions[0].submittedAt, stage: "Manager Review" },
    ];

    it("keeps only Approved submissions", () => {
      expect(filterSubmissions(withStages, { statusFilter: "approved", now })).toEqual([
        withStages[0],
      ]);
    });

    it("keeps only Rejected submissions", () => {
      expect(filterSubmissions(withStages, { statusFilter: "rejected", now })).toEqual([
        withStages[1],
      ]);
    });

    it("keeps Pending submissions (any non-terminal stage)", () => {
      expect(filterSubmissions(withStages, { statusFilter: "pending", now })).toEqual([
        withStages[2],
      ]);
    });
  });

  describe("mode", () => {
    const bySubmitter = [
      { ...submissions[0], submittedBy: "Jamie (Employee)", stage: "Draft" },
      { ...submissions[1], submittedBy: "Alex (Admin)", stage: "Approved" },
    ];

    it("mode 'mine' keeps only the current user's own submissions", () => {
      expect(
        filterSubmissions(bySubmitter, { mode: "mine", currentUserName: "Jamie (Employee)", now })
      ).toEqual([bySubmitter[0]]);
    });

    it("mode 'pending' keeps only non-terminal-stage submissions", () => {
      expect(filterSubmissions(bySubmitter, { mode: "pending", now })).toEqual([bySubmitter[0]]);
    });
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
