import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Header from "./header";
import { useAuthStore, MOCK_USERS } from "../store/authStore";

beforeEach(() => {
  useAuthStore.setState({
    currentUserId: MOCK_USERS[0].id,
    isAuthenticated: true,
    token: "mock-token-user_admin",
  });
  sessionStorage.clear();
});

function renderHeader() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="/dashboard" element={<Header openSidebar={() => {}} />} />
        <Route path="/login" element={<p>Login Page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Header", () => {
  it("shows the current mock user's role and name", async () => {
    const user = userEvent.setup();
    renderHeader();

    expect(screen.getByText("Admin")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Account menu" }));
    expect(screen.getByText("Alex (Admin)")).toBeInTheDocument();
  });

  it("logs out and redirects to /login", async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(screen.getByRole("button", { name: "Account menu" }));
    await user.click(screen.getByRole("button", { name: "Logout" }));

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
