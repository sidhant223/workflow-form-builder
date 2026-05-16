import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: "🏠" },
  { name: "Form Builder", path: "/form-builder", icon: "🧾" },
  { name: "Workflow", path: "/workflow", icon: "🔗" },
  { name: "Preview", path: "/preview", icon: "👁️" },
  { name: "Submissions", path: "/submissions", icon: "📥" },
];

function Sidebar({ isOpen, closeSidebar }) {
  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen w-64 bg-slate-950 text-white transition-transform duration-300 md:static md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="border-b border-slate-800 p-5">
        <h1 className="text-xl font-bold">FormFlow</h1>
        <p className="text-sm text-slate-400">Workflow Builder</p>
      </div>

      <nav className="space-y-2 p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-violet-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700">
            👤
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-slate-400">admin@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;