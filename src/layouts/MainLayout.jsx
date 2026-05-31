import { useState } from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/header";

function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        isOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
      />

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <div className="min-h-screen flex-1">
        <Header openSidebar={() => setIsSidebarOpen(true)} />

        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;