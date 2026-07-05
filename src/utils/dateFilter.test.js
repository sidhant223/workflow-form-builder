import { describe, it, expect } from "vitest";
import { isWithinDateFilter } from "./dateFilter";

const NOW = new Date("2026-07-05T00:00:00.000Z").getTime();

describe("isWithinDateFilter", () => {
  it("always matches when the filter is 'all'", () => {
    expect(isWithinDateFilter("2020-01-01T00:00:00.000Z", "all", NOW)).toBe(true);
  });

  it("matches a timestamp from earlier today under 'today'", () => {
    expect(isWithinDateFilter("2026-07-04T20:00:00.000Z", "today", NOW)).toBe(true);
  });

  it("rejects a timestamp older than 1 day under 'today'", () => {
    expect(isWithinDateFilter("2026-07-03T00:00:00.000Z", "today", NOW)).toBe(false);
  });

  it("matches a timestamp within the last 7 days", () => {
    expect(isWithinDateFilter("2026-06-30T00:00:00.000Z", "7days", NOW)).toBe(true);
  });

  it("rejects a timestamp older than 30 days", () => {
    expect(isWithinDateFilter("2026-05-01T00:00:00.000Z", "30days", NOW)).toBe(false);
  });
});
