import { useEffect, useState } from 'react';
import { Save, Store, Percent, Receipt, Building2 } from 'lucide-react';
import { dbSettings, type Settings } from '../lib/db';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { FullLoader } from '../components/Spinner';

export function SettingsPage() {
  const { theme, setTheme, logout } = useApp();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Settings>(() => dbSettings.get());

  useEffect(() => { const t = setTimeout(() => setLoading(false), 200); return () => clearTimeout(t); }, []);

  const save = () => {
    dbSettings.save(form);
    toast.success('Settings saved');
  };

  if (loading) return <FullLoader label="Loading settings..." />;

  return (
    <div className="max-w-3xl space-y-5 animate-fade-in">
      {/* Cafe info */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent-50 dark:bg-accent/10"><Store className="h-5 w-5 text-accent" /></div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Cafe Information</h3>
            <p className="text-xs text-slate-400">Business details shown on receipts</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Cafe name</label>
            <input value={form.cafeName} onChange={(e) => setForm((f) => ({ ...f, cafeName: e.target.value }))} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input" />
          </div>
        </div>
      </div>

      {/* Tax & charges */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent-50 dark:bg-accent/10"><Percent className="h-5 w-5 text-accent" /></div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Tax & Charges</h3>
            <p className="text-xs text-slate-400">Applied to every transaction</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Tax rate (%)</label>
            <input type="number" value={form.taxRate} onChange={(e) => setForm((f) => ({ ...f, taxRate: Number(e.target.value) }))} className="input" />
          </div>
          <div>
            <label className="label">Service charge (%)</label>
            <input type="number" value={form.serviceChargeRate} onChange={(e) => setForm((f) => ({ ...f, serviceChargeRate: Number(e.target.value) }))} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Currency</label>
            <select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} className="input">
              <option value="IDR">IDR - Indonesian Rupiah</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Receipt */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent-50 dark:bg-accent/10"><Receipt className="h-5 w-5 text-accent" /></div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Receipt</h3>
            <p className="text-xs text-slate-400">Customize receipt printing</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Logo text</label>
            <input value={form.logoText} onChange={(e) => setForm((f) => ({ ...f, logoText: e.target.value }))} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Receipt footer message</label>
            <input value={form.receiptFooter} onChange={(e) => setForm((f) => ({ ...f, receiptFooter: e.target.value }))} className="input" />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent-50 dark:bg-accent/10"><Building2 className="h-5 w-5 text-accent" /></div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Appearance</h3>
            <p className="text-xs text-slate-400">Theme preference</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(['light', 'dark'] as const).map((t) => (
            <button key={t} onClick={() => setTheme(t)} className={`rounded-xl border p-4 text-left transition ${theme === t ? 'border-accent ring-2 ring-accent/20' : 'border-slate-200 dark:border-slate-800'}`}>
              <div className={`h-16 rounded-lg mb-2 ${t === 'dark' ? 'bg-slate-900' : 'bg-slate-100 border border-slate-200'}`}>
                <div className="h-3 m-2 rounded bg-accent w-1/3" />
                <div className="h-2 m-2 rounded bg-slate-400 w-2/3" />
              </div>
              <p className="text-sm font-semibold capitalize text-slate-900 dark:text-white">{t} mode</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button onClick={() => setForm(dbSettings.get())} className="btn-ghost border border-slate-200 dark:border-slate-700">Reset</button>
        <button onClick={save} className="btn-primary"><Save className="h-4 w-4" /> Save Changes</button>
      </div>

      <div className="card p-6 border-rose-200 dark:border-rose-900/50">
        <h3 className="font-bold text-rose-600 dark:text-rose-400">Danger Zone</h3>
        <p className="text-sm text-slate-500 mt-1">Sign out of your account on this device.</p>
        <button onClick={logout} className="btn-danger mt-4">Sign Out</button>
      </div>
    </div>
  );
}
