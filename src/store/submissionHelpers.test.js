import { describe, it, expect } from "vitest";
import {
  formatReferenceNumber,
  extractDisplayName,
  filterSubmissions,
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
