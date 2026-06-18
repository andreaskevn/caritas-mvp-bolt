import {
  LayoutDashboard, MonitorUp, Package, Tags, Users, ReceiptText, BarChart3, Settings as SettingsIcon,
  Coffee, ChevronLeft, ChevronRight, LogOut, X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Role } from '../lib/db';

interface NavItem {
  route: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Role[];
}

const NAV: NavItem[] = [
  { route: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager'] },
  { route: '/pos', label: 'POS Terminal', icon: MonitorUp },
  { route: '/menu', label: 'Menu', icon: Package, roles: ['admin', 'manager'] },
  { route: '/categories', label: 'Categories', icon: Tags, roles: ['admin', 'manager'] },
  { route: '/transactions', label: 'Transactions', icon: ReceiptText, roles: ['admin', 'manager', 'cashier'] },
  { route: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'manager'] },
  { route: '/users', label: 'Users', icon: Users, roles: ['admin'] },
  { route: '/settings', label: 'Settings', icon: SettingsIcon, roles: ['admin', 'manager'] },
];

export function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const { user, route, navigate, logout } = useApp();
  const items = NAV.filter((n) => !n.roles || (user && n.roles.includes(user.role)));

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={`fixed lg:sticky top-0 z-50 h-screen flex flex-col bg-slate-900 text-white transition-all duration-300 ${
          collapsed ? 'w-[76px]' : 'w-[256px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* brand */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 flex-shrink-0">
          <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-accent shadow-lg shadow-orange-500/30">
            <Coffee className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="font-extrabold tracking-tight">BrewPOS</p>
              <p className="text-[10px] text-white/50">Cafe Management</p>
            </div>
          )}
          <button className="hidden lg:block ml-auto text-white/50 hover:text-white" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button className="lg:hidden text-white/70" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
          {!collapsed && <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">Menu</p>}
          <ul className="space-y-1">
            {items.map((item) => {
              const active = route === item.route || route.startsWith(item.route + '/');
              const Icon = item.icon;
              return (
                <li key={item.route}>
                  <button
                    onClick={() => { navigate(item.route); setMobileOpen(false); }}
                    title={collapsed ? item.label : undefined}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? 'bg-accent text-white shadow-md shadow-orange-500/20'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-white' : 'text-white/50 group-hover:text-white'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* user */}
        <div className="border-t border-white/10 p-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-white/10 text-sm font-bold uppercase">
              {user?.name.charAt(0)}
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-[11px] capitalize text-white/50">{user?.role}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={logout} title="Logout" className="rounded-lg p-2 text-white/50 hover:bg-rose-500/20 hover:text-rose-300 transition">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
