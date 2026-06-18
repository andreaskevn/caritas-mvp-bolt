import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Coffee, Award, Calendar, Download } from 'lucide-react';
import { dbTransactions, dbMenu, dbCategories, fmtCurrency, type Transaction } from '../lib/db';
import { DonutChart, LineChart } from '../components/Charts';
import { FullLoader } from '../components/Spinner';
import { useToast } from '../components/Toast';

type Range = '7d' | '30d' | '90d';

export function ReportsPage() {
  const toast = useToast();
  const [range, setRange] = useState<Range>('30d');
  const [loading, setLoading] = useState(true);
  const [txs, setTxs] = useState<Transaction[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      setTxs(dbTransactions.all());
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;

  const stats = useMemo(() => {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const completed = txs.filter((t) => t.status === 'completed' && new Date(t.createdAt) >= since);
    const revenue = completed.reduce((s, t) => s + t.total, 0);
    const orders = completed.length;
    const avgOrder = orders ? revenue / orders : 0;
    const itemsSold = completed.reduce((s, t) => s + t.items.reduce((q, i) => q + i.qty, 0), 0);
    // cost / profit estimate
    const menuArr = dbMenu.all();
    let cost = 0;
    completed.forEach((t) => t.items.forEach((i) => {
      const mi = menuArr.find((m) => m.id === i.id);
      cost += (mi?.cost || 0) * i.qty;
    }));
    const profit = revenue - cost - completed.reduce((s, t) => s + t.tax + t.serviceCharge, 0);

    // daily
    const buckets = Math.min(days, 30);
    const daily: { label: string; value: number }[] = [];
    for (let i = buckets - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toDateString();
      const rev = completed.filter((t) => new Date(t.createdAt).toDateString() === ds).reduce((s, t) => s + t.total, 0);
      daily.push({ label: d.toLocaleDateString('id-ID', { day: 'numeric', month: buckets > 14 ? undefined : 'short' }), value: rev });
    }

    // category breakdown
    const cats = dbCategories.all();
    const catMap = new Map<string, number>();
    completed.forEach((t) => t.items.forEach((i) => {
      const mi = menuArr.find((m) => m.id === i.id);
      if (mi) catMap.set(mi.categoryId, (catMap.get(mi.categoryId) || 0) + i.price * i.qty);
    }));
    const palette = ['#FF6B35', '#5B9BD5', '#22C55E', '#A855F7', '#F59E0B', '#06B6D4'];
    const categoryData = cats.map((c, i) => ({ label: c.name, value: catMap.get(c.id) || 0, color: c.color || palette[i % palette.length] })).filter((d) => d.value > 0);

    // top items
    const itemMap = new Map<string, { name: string; qty: number; revenue: number }>();
    completed.forEach((t) => t.items.forEach((i) => {
      const ex = itemMap.get(i.id) || { name: i.name, qty: 0, revenue: 0 };
      ex.qty += i.qty; ex.revenue += i.price * i.qty;
      itemMap.set(i.id, ex);
    }));
    const topItems = Array.from(itemMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 8);

    return { revenue, orders, avgOrder, itemsSold, cost, profit, daily, categoryData, topItems };
  }, [txs, days]);

  if (loading) return <FullLoader label="Generating reports..." />;

  const ranges: { id: Range; label: string }[] = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sales Reports</h2>
          <p className="text-sm text-slate-400">Business performance analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 p-1 dark:border-slate-800">
            {ranges.map((r) => (
              <button key={r.id} onClick={() => setRange(r.id)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${range === r.id ? 'bg-accent text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{r.label}</button>
            ))}
          </div>
          <button onClick={() => toast.success('Report exported')} className="btn-ghost border border-slate-200 dark:border-slate-700"><Download className="h-4 w-4" /> Export</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: 'Gross Revenue', value: fmtCurrency(stats.revenue), delta: '+14.2%', up: true },
          { icon: TrendingUp, label: 'Net Profit', value: fmtCurrency(stats.profit), delta: '+9.8%', up: true },
          { icon: ShoppingBag, label: 'Total Orders', value: String(stats.orders), delta: '+6.5%', up: true },
          { icon: Coffee, label: 'Items Sold', value: String(stats.itemsSold), delta: '+3.1%', up: true },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-5">
            <div className="flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-50 dark:bg-accent/10"><kpi.icon className="h-5 w-5 text-accent" /></div>
              <span className={`chip ${kpi.up ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'}`}>
                {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{kpi.delta}
              </span>
            </div>
            <p className="mt-3 text-xl font-extrabold text-slate-900 dark:text-white">{kpi.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Revenue Trend</h3>
              <p className="text-xs text-slate-400">Last {range}</p>
            </div>
          </div>
          <LineChart data={stats.daily} valueFormat={(n) => fmtCurrency(n)} />
        </div>
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">By Category</h3>
          <p className="text-xs text-slate-400 mb-4">Revenue share</p>
          {stats.categoryData.length ? <DonutChart data={stats.categoryData} centerValue={fmtCurrency(stats.revenue).replace('Rp ', '').slice(0, 6)} centerLabel="Revenue" /> : <p className="text-sm text-slate-400 py-10 text-center">No data</p>}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-slate-900 dark:text-white">Top Selling Items</h3>
          </div>
          <Calendar className="h-4 w-4 text-slate-400" />
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="pb-3 pr-4 font-semibold">#</th>
                <th className="pb-3 pr-4 font-semibold">Item</th>
                <th className="pb-3 pr-4 font-semibold text-right">Qty Sold</th>
                <th className="pb-3 pr-4 font-semibold text-right">Revenue</th>
                <th className="pb-3 font-semibold text-right">% of Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.topItems.map((it, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                  <td className="py-3 pr-4 font-bold text-slate-400">{i + 1}</td>
                  <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">{it.name}</td>
                  <td className="py-3 pr-4 text-right text-slate-600 dark:text-slate-300">{it.qty}</td>
                  <td className="py-3 pr-4 text-right font-bold text-slate-900 dark:text-white">{fmtCurrency(it.revenue)}</td>
                  <td className="py-3 text-right text-slate-500">{stats.revenue ? ((it.revenue / stats.revenue) * 100).toFixed(1) : '0'}%</td>
                </tr>
              ))}
              {stats.topItems.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-400">No sales in this period</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
