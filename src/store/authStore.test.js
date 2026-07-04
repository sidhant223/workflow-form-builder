import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore, MOCK_USERS } from "./authStore";

beforeEach(() => {
  useAuthStore.setState({ currentUserId: MOCK_USERS[0].id, isAuthenticated: false, token: null });
  sessionStorage.clear();
});

describe("useAuthStore", () => {
  it("defaults to the first mock user (Admin) and starts logged out", () => {
    expect(useAuthStore.getState().currentUserId).toBe("user_admin");
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("switches the active simulated user", () => {
    useAuthStore.getState().setCurrentUserId("user_manager");
    expect(useAuthStore.getState().currentUserId).toBe("user_manager");
  });

  describe("login", () => {
    it("logs in a known mock user with the correct password", () => {
      const result = useAuthStore.getState().login("manager@test.com", "password123");
      expect(result).toEqual({ success: true });
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().currentUserId).toBe("user_manager");
      expect(useAuthStore.getState().token).toBe("mock-token-user_manager");
    });

    it("matches email case-insensitively and trims whitespace", () => {
      const result = useAuthStore.getState().login("  ADMIN@TEST.COM  ", "password123");
      expect(result).toEqual({ success: true });
      expect(useAuthStore.getState().currentUserId).toBe("user_admin");
    });

    it("rejects an unknown email", () => {
      const result = useAuthStore.getState().login("nobody@test.com", "password123");
      expect(result).toEqual({ success: false, error: "Invalid email or password." });
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it("rejects the wrong password", () => {
      const result = useAuthStore.getState().login("admin@test.com", "wrong");
      expect(result).toEqual({ success: false, error: "Invalid email or password." });
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe("logout", () => {
    it("clears authentication but keeps the last-active user id", () => {
      useAuthStore.getState().login("employee@test.com", "password123");
      useAuthStore.getState().logout();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().token).toBe(null);
    });
  });
});
