import { describe, it, expect } from "vitest";
import { stageBadgeType } from "./stageBadge";

describe("stageBadgeType", () => {
  it("maps known stages to badge types", () => {
    expect(stageBadgeType("Draft")).toBe("neutral");
    expect(stageBadgeType("Approved")).toBe("success");
    expect(stageBadgeType("Rejected")).toBe("error");
    expect(stageBadgeType("Manager Review")).toBe("warning");
  });

  it("defaults to neutral when there is no stage", () => {
    expect(stageBadgeType(null)).toBe("neutral");
    expect(stageBadgeType(undefined)).toBe("neutral");
  });
});
