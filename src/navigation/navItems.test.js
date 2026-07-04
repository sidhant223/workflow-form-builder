import { describe, it, expect } from "vitest";
import { getNavItemsForRole } from "./navItems";

describe("getNavItemsForRole", () => {
  it("gives Employees Dashboard, Forms, and My Submissions", () => {
    const names = getNavItemsForRole("Employee").map((i) => i.name);
    expect(names).toEqual(["Dashboard", "Forms", "My Submissions"]);
  });

  it("gives Managers Dashboard, Pending Approvals, and Workflows", () => {
    const names = getNavItemsForRole("Manager").map((i) => i.name);
    expect(names).toEqual(["Dashboard", "Pending Approvals", "Workflows"]);
  });

  it("gives Admins Dashboard, Forms, Workflows, and User Management", () => {
    const names = getNavItemsForRole("Admin").map((i) => i.name);
    expect(names).toEqual(["Dashboard", "Forms", "Workflows", "User Management"]);
  });

  it("falls back to the Employee nav for an unknown role", () => {
    expect(getNavItemsForRole("Nobody")).toEqual(getNavItemsForRole("Employee"));
  });
});
