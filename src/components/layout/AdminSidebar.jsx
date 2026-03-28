import { useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Video,
  NotebookPen,
  BarChart3,
  MessageSquare,
  History,
  Settings,
  LayoutGrid,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { name: "Organizations", icon: Building2, path: "/admin/organizations" },
  { name: "Meetings", icon: Video, path: "/admin/meetings" },
  { name: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { name: "Feedback", icon: MessageSquare, path: "/admin/feedback" },
  { name: "Recent Activity", icon: History, path: "/admin/recent-activity" },
];

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-border flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-charcoal flex items-center justify-center rounded">
            <Settings className="text-white" size={16} />
          </div>
          <span className="text-charcoal text-sm font-semibold">Meeting Mind</span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-2 text-slate-500 hover:bg-sidebar rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-charcoal/20 backdrop-blur-sm z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-sidebar border-r border-border flex flex-col fixed h-screen z-50 transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-border hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-charcoal flex items-center justify-center rounded">
              <Settings className="text-white" size={16} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-charcoal text-sm font-semibold leading-tight">
                Meeting Mind
              </h1>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Close Button */}
        <div className="lg:hidden p-6 border-b border-border flex items-center justify-between">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Menu</span>
          <button onClick={closeSidebar} className="text-slate-400 hover:text-charcoal">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeSidebar}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? "active-nav text-charcoal bg-white shadow-sm"
                    : "text-slate-500 hover:bg-white/50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={isActive ? "text-primary" : "text-slate-400"} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-border space-y-1">
          <NavLink
            to="/admin/settings"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${
                isActive
                  ? "active-nav text-charcoal bg-white shadow-sm"
                  : "text-slate-500 hover:bg-white/50"
              }`
            }
          >
            <Settings size={20} className="text-slate-400" />
            <span>System Settings</span>
          </NavLink>

          <button
            onClick={() => {
              logout();
              closeSidebar();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>

          <div className="mt-4 px-3 py-3 bg-white border border-border rounded flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-primary text-[10px] font-bold shrink-0 shadow-inner">
              {user?.profilePicture?.url ? (
                <img src={user.profilePicture.url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.split(' ').map(n => n[0]).join('') || "U"
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate text-charcoal">
                {user?.name || "Admin User"}
              </span>
              <span className="text-[10px] text-slate-400 truncate capitalize">
                {user?.role || "Global Controller"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 flex-1 min-h-screen bg-white flex flex-col pt-16 lg:pt-0 min-w-0 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminSidebar;
