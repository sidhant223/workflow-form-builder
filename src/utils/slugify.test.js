import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and underscores spaces", () => {
    expect(slugify("Employee Registration")).toBe("employee_registration");
  });

  it("strips punctuation into underscores", () => {
    expect(slugify("Sam's Form! v2.0")).toBe("sam_s_form_v2_0");
  });

  it("falls back to untitled_form when empty or blank", () => {
    expect(slugify("")).toBe("untitled_form");
    expect(slugify("   ")).toBe("untitled_form");
    expect(slugify(undefined)).toBe("untitled_form");
  });

  it("accepts a custom fallback", () => {
    expect(slugify("", "custom_default")).toBe("custom_default");
  });
});
