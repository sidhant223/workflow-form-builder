// src/store/authStore.js
// Simulated authentication. A fixed set of mock users is matched by email +
// a shared mock password at /login (see src/pages/login.jsx); no real
// backend validates credentials. Session state persists to sessionStorage
// (cleared when the tab closes) rather than localStorage. Once logged in,
// src/services/api.js attaches `token` as a mock bearer header on every
// request, demonstrating the shape of real API authentication.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const MOCK_USERS = [
  { id: "user_admin", name: "Alex (Admin)", email: "admin@test.com", role: "Admin" },
  { id: "user_manager", name: "Morgan (Manager)", email: "manager@test.com", role: "Manager" },
  { id: "user_employee", name: "Jamie (Employee)", email: "employee@test.com", role: "Employee" },
];

export const MOCK_PASSWORD = "password123";

function findByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return MOCK_USERS.find((u) => u.email.toLowerCase() === normalized) || null;
}

export const useAuthStore = create(
  persist(
    (set) => ({
      currentUserId: MOCK_USERS[0].id,
      isAuthenticated: false,
      token: null,

      login: (email, password) => {
        const match = findByEmail(email);
        if (!match || password !== MOCK_PASSWORD) {
          return { success: false, error: "Invalid email or password." };
        }
        set({
          currentUserId: match.id,
          isAuthenticated: true,
          token: `mock-token-${match.id}`,
        });
        return { success: true };
      },

      logout: () => set({ isAuthenticated: false, token: null }),

      setCurrentUserId: (id) => set({ currentUserId: id }),
    }),
    {
      name: "auth-session",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export const useCurrentUser = () =>
  useAuthStore((s) => MOCK_USERS.find((u) => u.id === s.currentUserId) || MOCK_USERS[0]);
