import { describe, it, expect } from "vitest";
import { isFieldVisible } from "./conditionalVisibility";

describe("isFieldVisible", () => {
  it("is always visible when there is no showIf", () => {
    expect(isFieldVisible({ showIf: null }, {})).toBe(true);
    expect(isFieldVisible({}, {})).toBe(true);
  });

  it("is visible when the target field's value matches", () => {
    const field = { showIf: { field: "employment", value: "Yes" } };
    expect(isFieldVisible(field, { employment: "Yes" })).toBe(true);
  });

  it("is hidden when the target field's value doesn't match", () => {
    const field = { showIf: { field: "employment", value: "Yes" } };
    expect(isFieldVisible(field, { employment: "No" })).toBe(false);
    expect(isFieldVisible(field, {})).toBe(false);
  });

  it("compares boolean checkbox values against string configuration", () => {
    const field = { showIf: { field: "subscribe", value: "true" } };
    expect(isFieldVisible(field, { subscribe: true })).toBe(true);
    expect(isFieldVisible(field, { subscribe: false })).toBe(false);
  });
});
