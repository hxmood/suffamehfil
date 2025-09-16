// app/admin/layout.js
import { FiHome, FiUsers, FiCalendar, FiAward, FiSettings } from 'react-icons/fi';

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="h-16 flex items-center px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-[#FF6B6B]">FestAdmin</h1>
          </div>
          <div className="flex flex-col flex-grow p-4 overflow-y-auto">
            <nav className="flex-1 space-y-2">
              <SidebarLink href="/admin" icon={<FiHome />} text="Dashboard" />
              <SidebarLink href="/admin/programs" icon={<FiCalendar />} text="Programs" />
              <SidebarLink href="/admin/participants" icon={<FiUsers />} text="Participants" />
              <SidebarLink href="/admin/results" icon={<FiAward />} text="Results" />
              <SidebarLink href="/admin/settings" icon={<FiSettings />} text="Settings" />
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile sidebar toggle would go here */}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button className="md:hidden text-gray-500">
                {/* Mobile menu button */}
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {/* User dropdown */}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 bg-[#F9F9F9]">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ href, icon, text }) {
  return (
    <a
      href={href}
      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-[#FF6B6B] transition-colors"
    >
      <span className="mr-3">{icon}</span>
      {text}
    </a>
  );
}