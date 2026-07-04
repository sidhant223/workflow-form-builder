import { describe, it, expect } from "vitest";
import { getValidationRules } from "./buildValidationRules";

describe("getValidationRules", () => {
  it("adds a required message using the field label", () => {
    const rules = getValidationRules({ type: "text", label: "Full Name", required: true });
    expect(rules.required).toBe("Full Name is required");
  });

  it("omits required when the field isn't required", () => {
    const rules = getValidationRules({ type: "text", label: "Full Name", required: false });
    expect(rules.required).toBeUndefined();
  });

  it("adds minLength/maxLength messages for text-like fields", () => {
    const rules = getValidationRules({
      type: "text",
      label: "Full Name",
      minLength: 3,
      maxLength: 50,
    });
    expect(rules.minLength).toEqual({ value: 3, message: "Minimum 3 characters" });
    expect(rules.maxLength).toEqual({ value: 50, message: "Maximum 50 characters" });
  });

  it("adds min/max messages for number fields", () => {
    const rules = getValidationRules({ type: "number", label: "Age", min: 1, max: 100 });
    expect(rules.min).toEqual({ value: 1, message: "Minimum: 1" });
    expect(rules.max).toEqual({ value: 100, message: "Maximum: 100" });
  });

  it("validates email format for type=email", () => {
    const rules = getValidationRules({ type: "email", label: "Email" });
    expect(rules.validate.email("jane@test.com")).toBe(true);
    expect(rules.validate.email("not-an-email")).toBe("Invalid email address");
    expect(rules.validate.email("")).toBe(true);
  });

  it("validates a custom regex pattern with a custom message", () => {
    const rules = getValidationRules({
      type: "text",
      label: "Mobile Number",
      pattern: "^[0-9]{10}$",
      patternMessage: "10 digits only",
    });
    expect(rules.validate.pattern("1234567890")).toBe(true);
    expect(rules.validate.pattern("abc")).toBe("10 digits only");
  });

  it("falls back to a generic message when no patternMessage is set", () => {
    const rules = getValidationRules({ type: "text", label: "Code", pattern: "^[A-Z]+$" });
    expect(rules.validate.pattern("abc")).toBe("Invalid format");
  });
});
