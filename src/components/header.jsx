function Header({ openSidebar }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-5">
      <button
        onClick={openSidebar}
        className="text-2xl text-gray-700 md:hidden"
      >
        ☰
      </button>

      <h2 className="font-semibold text-gray-800">FormFlow</h2>

      <div className="flex items-center gap-4">
        <span className="text-xl">🔔</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
          👤
        </div>
      </div>
    </header>
  );
}

export default Header;