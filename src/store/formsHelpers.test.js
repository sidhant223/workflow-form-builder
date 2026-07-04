import { describe, it, expect } from "vitest";
import { filterAndSortForms } from "./formsHelpers";

const now = 1_700_000_000_000;

const forms = [
  { id: "1", formName: "Employee Registration", status: "Published", createdAt: new Date(now).toISOString() },
  {
    id: "2",
    formName: "Leave Request",
    status: "Draft",
    createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    formName: "Customer Feedback",
    status: "Published",
    createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

describe("filterAndSortForms", () => {
  it("matches search against the form name, case-insensitively", () => {
    expect(filterAndSortForms(forms, { search: "leave", now }).map((f) => f.id)).toEqual(["2"]);
  });

  it("filters by status", () => {
    expect(filterAndSortForms(forms, { statusFilter: "Draft", now }).map((f) => f.id)).toEqual(["2"]);
    expect(
      filterAndSortForms(forms, { statusFilter: "Published", now }).map((f) => f.id).sort()
    ).toEqual(["1", "3"]);
  });

  it("filters by created-date window", () => {
    expect(filterAndSortForms(forms, { dateFilter: "7days", now }).map((f) => f.id).sort()).toEqual([
      "1",
      "3",
    ]);
  });

  it("sorts by name ascending", () => {
    expect(filterAndSortForms(forms, { sortBy: "name", now }).map((f) => f.formName)).toEqual([
      "Customer Feedback",
      "Employee Registration",
      "Leave Request",
    ]);
  });

  it("sorts by date, newest first, by default", () => {
    expect(filterAndSortForms(forms, { now }).map((f) => f.id)).toEqual(["1", "3", "2"]);
  });

  it("treats a missing status as Draft", () => {
    const noStatus = [{ id: "4", formName: "Untitled", createdAt: new Date(now).toISOString() }];
    expect(filterAndSortForms(noStatus, { statusFilter: "Draft", now })).toEqual(noStatus);
  });
});
