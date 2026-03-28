import { Link } from 'react-router-dom'

import {
  LayoutDashboard,
  Calendar,
  ClipboardCheck,
  Archive,
  User as UserIcon,
  Settings,
  LogOut
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard',   to: '/attendee/dashboard',  icon: LayoutDashboard },
  { label: 'Meetings',    to: '/attendee/meetings',   icon: Calendar },
  { label: 'Tasks',       to: '/attendee/tasks',      icon: ClipboardCheck },
  { label: 'Archives',    to: '/attendee/archive',    icon: Archive },
]

const AttendeeSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isScribeRole = searchParams.get('role') === 'scribe' || user?.role === 'scribe';

  const getInitials = (nameStr) => {
    if (!nameStr) return '?';
    return nameStr.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <aside
      className="w-64 flex flex-col fixed h-full z-10 bg-[#eef0f5] border-r border-[#dde1ea]"
    >
      {/* Header / User */}
      <div
        className="flex items-center gap-3 px-4 py-5 border-b border-[#dde1ea] mb-4"
      >
        <div
          className="w-10 h-10 rounded-lg bg-[#2c3a4f] flex items-center justify-center text-white text-[12px] font-bold shrink-0 overflow-hidden shadow-inner"
        >
          {user?.profilePicture?.url ? (
            <img src={user.profilePicture.url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            getInitials(user?.name)
          )}
        </div>
        <div className="leading-tight flex-1 min-w-0">
          <h1
            className="text-[13px] font-bold text-[#2c3a4f] tracking-wide uppercase truncate"
          >
            {user?.name || (isScribeRole ? 'Scriber' : 'Attendee')}
          </h1>
          <p className="text-[10px] text-[#7a8699] uppercase tracking-widest mt-0.5 truncate">
            {isScribeRole ? 'MEETING SCRIBER' : (user?.role?.toUpperCase() || 'ATTENDEE')}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const params = new URLSearchParams(searchParams);
          if (item.tab) params.set('tab', item.tab);
          const targetTo = params.toString() ? `${item.to}?${params.toString()}` : item.to;

          const isCurrentRoute = location.pathname.includes(item.to) || (item.to === '/attendee/dashboard' && (location.pathname === '/attendee' || location.pathname === '/attendee/'));

          return (
            <Link
              key={item.label}
              to={targetTo}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-all duration-150 no-underline ${
                isCurrentRoute
                  ? "bg-white text-[#2c3a4f] shadow-sm font-medium"
                  : "text-[#6b7a8f] hover:bg-white/60 hover:text-[#2c3a4f]"
              }`}
            >
              <item.icon
                size={18}
                className={isCurrentRoute ? "text-[#4a6fa5]" : "text-[#8a99b0]"}
              />
              <span className="text-[13.5px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer: Settings & Logout */}
      <div className="px-4 py-4 border-t border-[#dde1ea] space-y-2">
        <Link
          to="/attendee/settings"
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors no-underline ${
            location.pathname.includes('/attendee/settings')
              ? 'bg-white text-[#2c3a4f] shadow-sm font-medium'
              : 'text-[#8a99b0] hover:bg-white/60 hover:text-[#2c3a4f]'
          } font-bold text-xs uppercase tracking-widest`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-red-600 font-bold text-xs uppercase tracking-widest hover:bg-red-50 rounded-lg transition-colors border border-red-100"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default AttendeeSidebar
