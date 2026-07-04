// src/store/roleStore.js
// Simulated active user + role. No authentication — the user just picks who
// they're "logged in as" from a dropdown, and role gates which workflow
// actions are available (see src/workflow/rolePermissions.js).

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MOCK_USERS = [
  { id: "user_admin", name: "Alex (Admin)", role: "Admin" },
  { id: "user_manager", name: "Morgan (Manager)", role: "Manager" },
  { id: "user_employee", name: "Jamie (Employee)", role: "Employee" },
];

export const useRoleStore = create(
  persist(
    (set) => ({
      currentUserId: MOCK_USERS[0].id,
      setCurrentUserId: (id) => set({ currentUserId: id }),
    }),
    { name: "active-user" }
  )
);

export const useCurrentUser = () =>
  useRoleStore((s) => MOCK_USERS.find((u) => u.id === s.currentUserId) || MOCK_USERS[0]);
