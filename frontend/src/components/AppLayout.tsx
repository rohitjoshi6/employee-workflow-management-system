import { BarChart3, ClipboardList, FilePlus2, LayoutDashboard, LogOut, ShieldAlert, Users } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["employee", "manager", "admin"] },
  { to: "/requests", label: "My Requests", icon: ClipboardList, roles: ["employee", "manager", "admin"] },
  { to: "/requests/new", label: "Create Request", icon: FilePlus2, roles: ["employee", "manager", "admin"] },
  { to: "/manager", label: "Manager Queue", icon: Users, roles: ["manager", "admin"] },
  { to: "/admin", label: "Admin Dashboard", icon: BarChart3, roles: ["admin"] }
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <ShieldAlert size={28} />
          <div>
            <strong>WorkflowOps</strong>
            <span>Employee Workflow Management</span>
          </div>
        </div>
        <nav className="nav-stack">
          {navItems
            .filter((item) => user && item.roles.includes(user.role))
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
        </nav>
      </aside>
      <div className="main-panel">
        <header className="topbar">
          <div>
            <span className="eyebrow">Internal Operations</span>
            <h1>Employee Workflow Management System</h1>
          </div>
          <div className="user-chip">
            <div>
              <strong>{user?.name}</strong>
              <span>{user?.role}</span>
            </div>
            <button className="icon-btn" onClick={handleLogout} title="Sign out" aria-label="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
