import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore, useCurrentUser } from "../store/authStore";

// Maps the current route to a readable page title shown in the header.
const pageTitles = {
  "/dashboard": "Dashboard",
  "/form-builder": "Form Builder",
  "/workflow": "Workflow",
  "/preview": "Preview",
  "/submissions": "Submissions",
  "/components": "Components",
  "/forms": "Forms",
  "/pending-approvals": "Pending Approvals",
  "/my-submissions": "My Submissions",
  "/user-management": "User Management",
};

function Header({ openSidebar }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[pathname] || "FormFlow";

  const [profileOpen, setProfileOpen] = useState(false);
  const currentUser = useCurrentUser();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-5">
      <div className="flex items-center gap-3">
        <button
          onClick={openSidebar}
          aria-label="Open menu"
          className="text-2xl text-gray-700 md:hidden"
        >
          ☰
        </button>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          aria-label="Notifications"
          className="relative text-xl text-gray-600 transition-colors hover:text-gray-800"
        >
          🔔
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2"
            aria-label="Account menu"
            aria-haspopup="true"
            aria-expanded={profileOpen}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-700">
              👤
            </div>
            <span className="hidden text-sm font-medium text-gray-700 sm:block">
              {currentUser.role}
            </span>
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <div className="border-b border-gray-100 px-4 py-2">
                  <p className="text-sm font-medium text-gray-800">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.role}</p>
                </div>
                <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                  Profile
                </button>
                <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
