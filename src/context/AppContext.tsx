import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { dbSession, dbTheme } from '../lib/db';
import type { User } from '../lib/db';

interface AppCtx {
  user: User | null;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;
  login: (u: User) => void;
  logout: () => void;
  route: string;
  navigate: (r: string) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => dbSession.get());
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => dbTheme.get());
  const [route, setRoute] = useState<string>(() => window.location.hash.replace('#', '') || '/dashboard');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    dbTheme.set(theme);
  }, [theme]);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace('#', '') || '/dashboard');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (r: string) => {
    window.location.hash = r;
    setRoute(r);
  };

  const login = (u: User) => {
    dbSession.set(u);
    setUser(u);
    navigate('/dashboard');
  };

  const logout = () => {
    dbSession.clear();
    setUser(null);
    navigate('/login');
  };

  const setTheme = (t: 'light' | 'dark') => setThemeState(t);
  const toggleTheme = () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <Ctx.Provider value={{ user, theme, setTheme, toggleTheme, login, logout, route, navigate }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
