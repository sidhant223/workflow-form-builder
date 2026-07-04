// src/pages/userManagement.jsx
// Route: /user-management (Admin nav item — "User Management (Placeholder)")
// Real user management (invites, role changes) is out of scope for this
// mock-auth prototype; this simply lists the demo accounts read-only.

import { MOCK_USERS } from "../store/authStore";
import Badge from "../components/ui/badge";

function UserManagement() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      <p className="mt-1 text-gray-600">
        Full user management (invites, role changes, deactivation) isn't part of this
        prototype yet — this is a placeholder showing the demo accounts.
      </p>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS.map((u) => (
              <tr key={u.id} className="border-t border-gray-100">
                <td className="px-4 py-3 text-gray-800">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge text={u.role} type="neutral" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
