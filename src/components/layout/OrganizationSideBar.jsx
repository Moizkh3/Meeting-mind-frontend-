import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import {
    LayoutDashboard,
    Calendar,
    FileText,
    Settings,
    LogOut,
    CalendarDays,
    Menu,
    X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "dashboard" },
    { icon: CalendarDays, label: "Calendar", path: "calendar" },
    { icon: Calendar, label: "Meetings", path: "meetings" },
    { icon: FileText, label: "Reports", path: "reports" },
    { icon: Settings, label: "Setting", path: "setting" },
];

function SideContent({ onClose }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full bg-[#eef0f5] border-r border-[#dde1ea]">
            {/* Logo / Brand */}
            <div className="flex items-center justify-between gap-3 px-4 py-5 border-b border-[#dde1ea]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#2c3a4f] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        M
                    </div>
                    <div className="leading-tight">
                        <p className="text-[13px] font-semibold text-[#2c3a4f] tracking-wide">
                            Meeting Mind
                        </p>
                        <p className="text-[10px] text-[#7a8699] uppercase tracking-widest">
                            Executive Portal
                        </p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="lg:hidden p-2 text-[#8a99b0] hover:text-[#2c3a4f]">
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
                {navItems.map(({ icon: Icon, label, path }) => (
                    <NavLink
                        key={label}
                        to={path}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-all duration-150 no-underline ${isActive
                                ? "bg-white text-[#2c3a4f] shadow-sm font-medium"
                                : "text-[#6b7a8f] hover:bg-white/60 hover:text-[#2c3a4f]"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon
                                    size={18}
                                    className={isActive ? "text-[#4a6fa5]" : "text-[#8a99b0]"}
                                />
                                <span className="text-[13.5px]">{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Footer */}
            <div className="px-4 py-4 border-t border-[#dde1ea] flex items-center gap-3">
                 <div className="cursor-pointer flex items-center gap-3 flex-1 min-w-0" onClick={() => { navigate("/organization/setting"); onClose?.(); }}>
                    {(() => {
                        const photoUrl = 
                          user?.profilePicture?.url || 
                          (typeof user?.profilePicture === 'string' ? user?.profilePicture : null) || 
                          user?.logo?.url || 
                          (typeof user?.logo === 'string' ? user?.logo : null);
                        
                        return photoUrl ? (
                            <img src={photoUrl} alt="User Avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-[#2c3a4f] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                            </div>
                        );
                    })()}

                    {/* Name & Role */}
                    <div className="leading-tight flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#2c3a4f] truncate">{user?.name || "User"}</p>
                        <p className="text-[11px] text-[#8a99b0] capitalize">{user?.role || "Member"}</p>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={() => {
                        logout();
                        navigate("/login");
                    }}
                    title="Logout"
                    className="flex items-center justify-center w-7 h-7 rounded-md border border-[#d0d7e2] text-[#8a99b0] hover:bg-[#e2e6ed] hover:text-red-500 transition-all duration-150 shrink-0"
                >
                    <LogOut size={15} />
                </button>
            </div>
        </div>
    );
}

export default function OrganizationSideBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-56 shrink-0 h-screen sticky top-0">
                <SideContent />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <div className={`fixed inset-y-0 left-0 z-[70] w-64 transform lg:hidden transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <SideContent onClose={() => setIsMenuOpen(false)} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Top Header */}
                <header className="lg:hidden flex items-center justify-between px-4 py-4 bg-[#eef0f5] border-b border-[#dde1ea] shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-[#2c3a4f] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            M
                        </div>
                        <span className="text-[13px] font-bold text-[#2c3a4f]">Meeting Mind</span>
                    </div>
                    <button 
                        onClick={() => setIsMenuOpen(true)}
                        className="p-2 rounded-md bg-white/60 text-[#8a99b0] hover:text-[#2c3a4f] transition-colors"
                    >
                        <Menu size={20} />
                    </button>
                </header>

                <main className="flex-1 p-5 bg-white">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}