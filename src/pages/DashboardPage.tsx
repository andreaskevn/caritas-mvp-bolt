import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Coffee, Users, ArrowUpRight, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbTransactions, fmtCurrency, fmtDate, type Transaction } from '../lib/db';
import { BarChart, DonutChart, LineChart } from '../components/Charts';
import { FullLoader } from '../components/Spinner';
import { useEffect, useState } from 'react';

function KPI({ icon: Icon, label, value, delta, deltaUp }: {
  icon: typeof DollarSign; label: string; value: string; delta?: string; deltaUp?: boolean;
}) {
  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent-50 dark:bg-accent/10">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        {delta && (
          <span className={`chip ${deltaUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'}`}>
            {deltaUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {delta}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export function DashboardPage() {
  const { navigate } = useApp();
  const [loading, setLoading] = useState(true);
  const [txs, setTxs] = useState<Transaction[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      setTxs(dbTransactions.all());
      setLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    const completed = txs.filter((t) => t.status === 'completed');
    const todayTx = completed.filter((t) => new Date(t.createdAt).toDateString() === today);
    const revenue = completed.reduce((s, t) => s + t.total, 0);
    const todayRevenue = todayTx.reduce((s, t) => s + t.total, 0);
    const totalOrders = completed.length;
    const avgOrder = totalOrders ? revenue / totalOrders : 0;

    // last 7 days bar
    const days: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toDateString();
      const rev = completed.filter((t) => new Date(t.createdAt).toDateString() === ds).reduce((s, t) => s + t.total, 0);
      days.push({ label: d.toLocaleDateString('id-ID', { weekday: 'short' }), value: rev });
    }

    // hourly line for today
    const hours: { label: string; value: number }[] = [];
    for (let h = 8; h <= 20; h++) {
      const rev = todayTx.filter((t) => new Date(t.createdAt).getHours() === h).reduce((s, t) => s + t.total, 0);
      hours.push({ label: String(h), value: rev });
    }

    // payment method donut
    const methodColors: Record<string, string> = { cash: '#FF6B35', qris: '#5B9BD5', debit: '#22C55E', credit: '#A855F7', ewallet: '#F59E0B' };
    const methodLabels: Record<string, string> = { cash: 'Cash', qris: 'QRIS', debit: 'Debit', credit: 'Credit', ewallet: 'E-Wallet' };
    const methodMap = new Map<string, number>();
    completed.forEach((t) => methodMap.set(t.method, (methodMap.get(t.method) || 0) + t.total));
    const donut = Array.from(methodMap.entries()).map(([k, v]) => ({ label: methodLabels[k] || k, value: v, color: methodColors[k] || '#999' }));

    // top items
    const itemMap = new Map<string, { name: string; qty: number; revenue: number }>();
    completed.forEach((t) => t.items.forEach((i) => {
      const ex = itemMap.get(i.id) || { name: i.name, qty: 0, revenue: 0 };
      ex.qty += i.qty;
      ex.revenue += i.price * i.qty;
      itemMap.set(i.id, ex);
    }));
    const topItems = Array.from(itemMap.values()).sort((a, b) => b.qty - a.qty).slice(0, 5);

    return { revenue, todayRevenue, totalOrders, avgOrder, days, hours, donut, topItems, todayTxCount: todayTx.length };
  }, [txs]);

  if (loading) return <FullLoader label="Loading dashboard..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPI icon={DollarSign} label="Today's Revenue" value={fmtCurrency(stats.todayRevenue)} delta="+12.4%" deltaUp />
        <KPI icon={ShoppingCart} label="Today's Orders" value={String(stats.todayTxCount)} delta="+8.1%" deltaUp />
        <KPI icon={Coffee} label="Total Revenue" value={fmtCurrency(stats.revenue)} delta="+5.2%" deltaUp />
        <KPI icon={Users} label="Avg Order Value" value={fmtCurrency(stats.avgOrder)} delta="-1.3%" deltaUp={false} />
      </div>

      {/* charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Revenue Overview</h3>
              <p className="text-xs text-slate-400">Last 7 days performance</p>
            </div>
            <span className="chip bg-accent-50 text-accent dark:bg-accent/10">Weekly</span>
          </div>
          <BarChart data={stats.days} valueFormat={(n) => fmtCurrency(n)} />
        </div>
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">Payment Methods</h3>
          <p className="text-xs text-slate-400 mb-4">Revenue by method</p>
          <DonutChart data={stats.donut} centerValue={String(stats.totalOrders)} centerLabel="Orders" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Hourly Sales (Today)</h3>
              <p className="text-xs text-slate-400">Revenue by hour</p>
            </div>
          </div>
          <LineChart data={stats.hours} valueFormat={(n) => fmtCurrency(n)} />
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Top Items</h3>
          </div>
          <div className="space-y-3">
            {stats.topItems.map((it, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-300">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{it.name}</p>
                  <p className="text-xs text-slate-400">{it.qty} sold</p>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{fmtCurrency(it.revenue)}</p>
              </div>
            ))}
            {stats.topItems.length === 0 && <p className="text-sm text-slate-400 text-center py-6">No sales yet</p>}
          </div>
        </div>
      </div>

      {/* recent transactions */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
          <button onClick={() => navigate('/transactions')} className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:gap-2 transition-all">
            View all <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="pb-3 pr-4 font-semibold">Invoice</th>
                <th className="pb-3 pr-4 font-semibold">Cashier</th>
                <th className="pb-3 pr-4 font-semibold">Method</th>
                <th className="pb-3 pr-4 font-semibold">Items</th>
                <th className="pb-3 pr-4 font-semibold">Time</th>
                <th className="pb-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {txs.slice(0, 6).map((t) => (
                <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                  <td className="py-3 pr-4 font-mono text-xs text-slate-600 dark:text-slate-300">{t.invoiceNo}</td>
                  <td className="py-3 pr-4 text-slate-700 dark:text-slate-200">{t.cashierName}</td>
                  <td className="py-3 pr-4"><span className="chip bg-slate-100 text-slate-600 capitalize dark:bg-slate-800 dark:text-slate-300">{t.method}</span></td>
                  <td className="py-3 pr-4 text-slate-500">{t.items.length}</td>
                  <td className="py-3 pr-4 text-slate-400 text-xs"><span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{fmtDate(t.createdAt)}</span></td>
                  <td className="py-3 font-bold text-right text-slate-900 dark:text-white">{fmtCurrency(t.total)}</td>
                </tr>
              ))}
              {txs.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">No transactions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
