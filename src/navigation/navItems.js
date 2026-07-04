// src/navigation/navItems.js
// Role-based sidebar navigation (Task 8). Each simulated role sees a
// different, fixed set of links.

const NAV_ITEMS_BY_ROLE = {
  Employee: [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Forms", path: "/forms", icon: "🧾" },
    { name: "My Submissions", path: "/my-submissions", icon: "📥" },
  ],
  Manager: [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Pending Approvals", path: "/pending-approvals", icon: "⏳" },
    { name: "Workflows", path: "/workflow", icon: "🔗" },
  ],
  Admin: [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Forms", path: "/forms", icon: "🧾" },
    { name: "Workflows", path: "/workflow", icon: "🔗" },
    { name: "User Management", path: "/user-management", icon: "👥" },
  ],
};

export function getNavItemsForRole(role) {
  return NAV_ITEMS_BY_ROLE[role] || NAV_ITEMS_BY_ROLE.Employee;
}
