import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UserManagement from "./userManagement";

describe("UserManagement page", () => {
  it("lists the demo accounts read-only", () => {
    render(<UserManagement />);
    expect(screen.getByText("Alex (Admin)")).toBeInTheDocument();
    expect(screen.getByText("admin@test.com")).toBeInTheDocument();
    expect(screen.getByText("Morgan (Manager)")).toBeInTheDocument();
    expect(screen.getByText("Jamie (Employee)")).toBeInTheDocument();
  });
});
