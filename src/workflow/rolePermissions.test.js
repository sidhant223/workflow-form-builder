import { describe, it, expect } from "vitest";
import { canPerformAction, canConfigureWorkflows, canManageForms } from "./rolePermissions";

describe("canPerformAction", () => {
  it("lets Employees only advance (submit)", () => {
    expect(canPerformAction("Employee", "advance")).toBe(true);
    expect(canPerformAction("Employee", "approve")).toBe(false);
    expect(canPerformAction("Employee", "reject")).toBe(false);
  });

  it("lets Managers advance, approve, and reject", () => {
    expect(canPerformAction("Manager", "advance")).toBe(true);
    expect(canPerformAction("Manager", "approve")).toBe(true);
    expect(canPerformAction("Manager", "reject")).toBe(true);
  });

  it("lets Admins do everything a Manager can", () => {
    expect(canPerformAction("Admin", "advance")).toBe(true);
    expect(canPerformAction("Admin", "approve")).toBe(true);
    expect(canPerformAction("Admin", "reject")).toBe(true);
  });

  it("returns false for an unknown role", () => {
    expect(canPerformAction("Guest", "advance")).toBe(false);
  });
});

describe("canConfigureWorkflows", () => {
  it("only Admins can configure workflows", () => {
    expect(canConfigureWorkflows("Admin")).toBe(true);
    expect(canConfigureWorkflows("Manager")).toBe(false);
    expect(canConfigureWorkflows("Employee")).toBe(false);
  });
});

describe("canManageForms", () => {
  it("only Admins can create, edit, or delete forms", () => {
    expect(canManageForms("Admin")).toBe(true);
    expect(canManageForms("Manager")).toBe(false);
    expect(canManageForms("Employee")).toBe(false);
  });
});
