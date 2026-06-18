import { useState } from 'react';
import { Coffee, Mail, Lock, Eye, EyeOff, LogIn, ShoppingBag, Zap, ShieldCheck, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { dbUsers } from '../lib/db';
import { Spinner } from '../components/Spinner';

const demos = [
  { role: 'Admin', email: 'admin@brewco.id', password: 'admin123', color: 'bg-rose-500' },
  { role: 'Manager', email: 'manager@brewco.id', password: 'manager123', color: 'bg-sky-500' },
  { role: 'Cashier', email: 'cashier@brewco.id', password: 'cashier123', color: 'bg-emerald-500' },
];

export function LoginPage() {
  const { login } = useApp();
  const toast = useToast();
  const [email, setEmail] = useState('admin@brewco.id');
  const [password, setPassword] = useState('admin123');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const user = dbUsers.all().find((u) => u.email === email && u.password === password && u.active);
      if (!user) {
        toast.error('Invalid email or password');
        setLoading(false);
        return;
      }
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      login(user);
    }, 700);
  };

  const quickFill = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(135deg, rgba(255,107,53,0.18) 0%, rgba(0,0,0,0.85) 60%), url(https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1200)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent shadow-lg shadow-orange-500/30">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xl font-extrabold tracking-tight">BrewPOS</p>
              <p className="text-xs text-white/60">Cafe Point of Sale</p>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-extrabold leading-tight">
              Brew success, <br /> one cup at a time.
            </h1>
            <p className="mt-4 text-white/70 leading-relaxed">
              The all-in-one POS system for modern cafes. Manage menus, process payments, and grow your business with real-time insights.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                { icon: Zap, title: 'Fast Checkout', desc: 'Lightning POS flow' },
                { icon: ShoppingBag, title: 'Menu Mgmt', desc: 'Full CRUD + stock' },
                { icon: TrendingUp, title: 'Analytics', desc: 'Sales & reports' },
                { icon: ShieldCheck, title: 'Secure', desc: 'Role-based access' },
              ].map((f) => (
                <div key={f.title} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <f.icon className="h-5 w-5 text-accent" />
                  <p className="mt-2 font-semibold text-sm">{f.title}</p>
                  <p className="text-xs text-white/50">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/40">© 2026 BrewPOS. Crafted for baristas.</p>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent shadow-lg shadow-orange-500/30">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">BrewPOS</p>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Welcome back</h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Sign in to your cafe workspace</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@brewco.id"
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={show ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <Spinner className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <p className="text-xs font-medium text-slate-400">DEMO ACCOUNTS</p>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {demos.map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => quickFill(d.email, d.password)}
                  className="rounded-xl border border-slate-200 p-3 text-left transition hover:border-accent hover:bg-accent-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <span className={`inline-block h-2 w-2 rounded-full ${d.color}`} />
                  <p className="mt-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">{d.role}</p>
                  <p className="text-[10px] text-slate-400 truncate">{d.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
