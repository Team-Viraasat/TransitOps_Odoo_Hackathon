import React, { useState } from "react";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings as SettingsIcon,
  Search,
  LogOut,
  Menu,
  ShieldCheck,
  Sun,
  Moon,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { canView, type ModuleKey } from "../../lib/rbac";
import { MacOSSidebar, type NavItem } from "../ui/macos-sidebar";

export type ScreenKey =
  | "dashboard"
  | "vehicles"
  | "drivers"
  | "trips"
  | "maintenance"
  | "expenses"
  | "analytics"
  | "settings";

const NAV: { key: ScreenKey; label: string; icon: React.ReactNode; module: ModuleKey }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, module: "Dashboard" },
  { key: "vehicles", label: "Vehicle Registry", icon: <Truck size={18} />, module: "Vehicles" },
  { key: "drivers", label: "Drivers & Safety", icon: <Users size={18} />, module: "Drivers" },
  { key: "trips", label: "Trip Dispatcher", icon: <Route size={18} />, module: "Trips" },
  { key: "maintenance", label: "Maintenance", icon: <Wrench size={18} />, module: "Maintenance" },
  { key: "expenses", label: "Fuel & Expenses", icon: <Fuel size={18} />, module: "Fuel Logs" },
  { key: "analytics", label: "Reports & Analytics", icon: <BarChart3 size={18} />, module: "Analytics" },
  { key: "settings", label: "Settings & RBAC", icon: <SettingsIcon size={18} />, module: "Settings/RBAC" },
];

export function Shell({
  active,
  onNavigate,
  search,
  onSearch,
  children,
}: {
  active: ScreenKey;
  onNavigate: (s: ScreenKey) => void;
  search: string;
  onSearch: (v: string) => void;
  children: React.ReactNode;
}) {
  const { currentUser, logout, theme, toggleTheme } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = currentUser!.role;
  const visibleNav = NAV.filter((n) => canView(role, n.module));

  const initials = currentUser!.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  const SidebarInner = (
    <>
      <div className="flex items-center gap-2.5 px-5 py-4">
        <img src="/logo.png" alt="TransitOps Logo" className="size-8 object-contain" />
        <div>
          <div className="text-to-text font-bold">TransitOps</div>
          <div className="text-[11px] text-to-muted">Smart Transport Ops</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {visibleNav.map((n) => {
          const isActive = active === n.key;
          return (
            <button
              key={n.key}
              onClick={() => {
                onNavigate(n.key);
                setMobileOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "border border-to-blue/40 bg-to-blue/10 text-to-text"
                  : "border border-transparent text-to-muted hover:bg-to-panel2 hover:text-to-text"
              }`}
            >
              <span className={isActive ? "text-to-blue" : ""}>{n.icon}</span>
              {n.label}
            </button>
          );
        })}
      </nav>
    </>
  );

  const sidebarItems: NavItem[] = visibleNav.map((n) => ({
    label: n.label,
    icon: n.icon,
  }));
  const selectedIndex = visibleNav.findIndex((n) => n.key === active);

  const HeaderLogo = (
    <div className="flex items-center gap-2.5">
      <img src="/logo.png" alt="TransitOps Logo" className="size-6 object-contain" />
      <div>
        <div className="text-to-text font-bold text-sm leading-tight">TransitOps</div>
        <div className="text-[9px] text-to-muted leading-tight">Smart Transport Ops</div>
      </div>
    </div>
  );

  const MainContent = (
    <div className="flex min-w-0 flex-1 flex-col h-full bg-to-bg">
      {/* Topbar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-to-border bg-to-panel px-4 z-10">
        <button className="text-to-muted lg:hidden" onClick={() => setMobileOpen(true)}>
          <Menu size={20} />
        </button>
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-to-muted" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search vehicles, drivers, trips…"
            className="w-full rounded-lg border border-to-border bg-to-bg py-2 pl-9 pr-3 text-sm text-to-text placeholder:text-to-muted/60 outline-none focus:border-to-blue"
          />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm leading-tight">{currentUser!.name}</div>
            <div className="text-[11px] leading-tight text-to-orange">{role}</div>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full bg-to-blue/20 text-sm text-to-blue">{initials}</div>
          <button
            onClick={toggleTheme}
            className="text-to-muted hover:text-to-orange p-1.5 rounded-lg hover:bg-to-panel2 transition-colors cursor-pointer"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={logout} className="text-to-muted hover:text-to-red p-1.5 rounded-lg hover:bg-to-panel2 transition-colors cursor-pointer" title="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-to-bg text-to-text">
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-to-border bg-to-panel">{SidebarInner}</aside>
        </div>
      )}

      {/* Desktop MacOS Sidebar Wrapper */}
      <div className="hidden lg:flex w-full h-full">
        <MacOSSidebar
          items={sidebarItems}
          selectedIndex={selectedIndex !== -1 ? selectedIndex : 0}
          onSelect={(index) => onNavigate(visibleNav[index].key)}
          defaultOpen={true}
          header={HeaderLogo}
        >
          {MainContent}
        </MacOSSidebar>
      </div>

      {/* Mobile view without MacOSSidebar (uses drawer) */}
      <div className="flex lg:hidden w-full h-full">
         {MainContent}
      </div>
    </div>
  );
}
