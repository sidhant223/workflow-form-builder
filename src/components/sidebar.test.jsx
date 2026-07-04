import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "./sidebar";
import { useAuthStore } from "../store/authStore";

beforeEach(() => {
  useAuthStore.setState({ currentUserId: "user_admin", isAuthenticated: true, token: "t" });
  sessionStorage.clear();
});

function renderSidebar() {
  return render(
    <MemoryRouter>
      <Sidebar isOpen closeSidebar={() => {}} />
    </MemoryRouter>
  );
}

describe("Sidebar", () => {
  it("shows the Admin nav items and the current user's name", () => {
    renderSidebar();
    expect(screen.getByText("Forms")).toBeInTheDocument();
    expect(screen.getByText("Workflows")).toBeInTheDocument();
    expect(screen.getByText("User Management")).toBeInTheDocument();
    expect(screen.queryByText("Pending Approvals")).not.toBeInTheDocument();
    expect(screen.getByText("Alex (Admin)")).toBeInTheDocument();
    expect(screen.getByText("admin@test.com")).toBeInTheDocument();
  });

  it("shows the Manager nav items", () => {
    useAuthStore.setState({ currentUserId: "user_manager" });
    renderSidebar();
    expect(screen.getByText("Pending Approvals")).toBeInTheDocument();
    expect(screen.queryByText("Forms")).not.toBeInTheDocument();
  });

  it("shows the Employee nav items", () => {
    useAuthStore.setState({ currentUserId: "user_employee" });
    renderSidebar();
    expect(screen.getByText("My Submissions")).toBeInTheDocument();
    expect(screen.queryByText("Workflows")).not.toBeInTheDocument();
  });
});
