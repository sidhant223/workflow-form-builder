import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuthStore } from "../store/authStore";

beforeEach(() => {
  useAuthStore.setState({ currentUserId: "user_admin", isAuthenticated: false, token: null });
  sessionStorage.clear();
});

function renderApp() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="/login" element={<p>Login Page</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<p>Dashboard Page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("redirects to /login when not authenticated", () => {
    renderApp();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard Page")).not.toBeInTheDocument();
  });

  it("renders the nested route when authenticated", () => {
    useAuthStore.setState({ isAuthenticated: true });
    renderApp();
    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });
});
