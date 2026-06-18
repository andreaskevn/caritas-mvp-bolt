import { Menu, Moon, Sun, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pos': 'POS Terminal',
  '/menu': 'Menu Management',
  '/categories': 'Categories',
  '/transactions': 'Transactions',
  '/reports': 'Reports',
  '/users': 'User Management',
  '/settings': 'Settings',
  '/payment': 'Payment',
  '/receipt': 'Receipt',
};

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { theme, toggleTheme, route, user } = useApp();
  const title = TITLES[route] || (route.startsWith('/receipt') ? 'Receipt' : 'BrewPOS');

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 backdrop-blur-lg px-4 sm:px-6 dark:border-slate-800 dark:bg-slate-950/80">
      <button onClick={onMenu} className="lg:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
        <Menu className="h-5 w-5" />
      </button>
      <div>
        <h1 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">{title}</h1>
        <p className="hidden sm:block text-xs text-slate-400">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
        </button>
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <div className="hidden sm:flex items-center gap-2.5 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-3 dark:border-slate-800">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-xs font-bold text-white">
            {user?.name.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{user?.name}</p>
            <p className="text-[10px] capitalize text-slate-400 leading-tight">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
