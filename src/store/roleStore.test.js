import { describe, it, expect, beforeEach } from "vitest";
import { useRoleStore, MOCK_USERS } from "./roleStore";

beforeEach(() => {
  useRoleStore.setState({ currentUserId: MOCK_USERS[0].id });
  localStorage.clear();
});

describe("useRoleStore", () => {
  it("defaults to the first mock user (Admin)", () => {
    expect(useRoleStore.getState().currentUserId).toBe("user_admin");
  });

  it("switches the active simulated user", () => {
    useRoleStore.getState().setCurrentUserId("user_manager");
    expect(useRoleStore.getState().currentUserId).toBe("user_manager");
  });
});
