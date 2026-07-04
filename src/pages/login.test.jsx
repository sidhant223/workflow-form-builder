import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Login from "./login";
import { useAuthStore } from "../store/authStore";

beforeEach(() => {
  useAuthStore.setState({ currentUserId: "user_admin", isAuthenticated: false, token: null });
  sessionStorage.clear();
});

function renderLogin(initialEntries = ["/login"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<p>Dashboard Page</p>} />
        <Route path="/workflow" element={<p>Workflow Page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Login page", () => {
  it("logs in a valid mock user and redirects to /dashboard", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/Email/), "manager@test.com");
    await user.type(screen.getByLabelText(/Password/), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().currentUserId).toBe("user_manager");
    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });

  it("shows an error and does not navigate on invalid credentials", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/Email/), "admin@test.com");
    await user.type(screen.getByLabelText(/Password/), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password.");
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("redirects back to the originally requested page after login", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/login", state: { from: { pathname: "/workflow" } } }]}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/workflow" element={<p>Workflow Page</p>} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Email/), "admin@test.com");
    await user.type(screen.getByLabelText(/Password/), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByText("Workflow Page")).toBeInTheDocument();
  });
});
