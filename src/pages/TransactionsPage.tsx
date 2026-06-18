import { useEffect, useMemo, useState } from 'react';
import { Search, Eye, Ban, Download, ReceiptText, Filter } from 'lucide-react';
import { dbTransactions, fmtCurrency, fmtDate, type PaymentMethod } from '../lib/db';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { Modal, ConfirmDialog } from '../components/Modal';
import { FullLoader } from '../components/Spinner';

const METHOD_LABELS: Record<PaymentMethod, string> = { cash: 'Cash', qris: 'QRIS', debit: 'Debit', credit: 'Credit', ewallet: 'E-Wallet' };

export function TransactionsPage() {
  const { navigate } = useApp();
  const toast = useToast();
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethod>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'void'>('all');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [voidId, setVoidId] = useState<string | null>(null);
  const reload = () => setVersion((v) => v + 1);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 250); return () => clearTimeout(t); }, []);

  const all = useMemo(() => dbTransactions.all(), [version]);
  const filtered = useMemo(() => {
    let list = all;
    if (methodFilter !== 'all') list = list.filter((t) => t.method === methodFilter);
    if (statusFilter !== 'all') list = list.filter((t) => t.status === statusFilter);
    if (search) list = list.filter((t) => t.invoiceNo.toLowerCase().includes(search.toLowerCase()) || t.cashierName.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [all, search, methodFilter, statusFilter]);

  const detail = filtered.find((t) => t.id === detailId) || null;

  const exportCSV = () => {
    const rows = [['Invoice', 'Date', 'Cashier', 'Method', 'Items', 'Subtotal', 'Discount', 'Tax', 'Service', 'Total', 'Status']];
    filtered.forEach((t) => rows.push([t.invoiceNo, t.createdAt, t.cashierName, t.method, String(t.items.length), String(t.subtotal), String(t.discount), String(t.tax), String(t.serviceCharge), String(t.total), t.status]));
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `transactions-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Transactions exported');
  };

  if (loading) return <FullLoader label="Loading transactions..." />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Transaction History</h2>
          <p className="text-sm text-slate-400">{filtered.length} transactions</p>
        </div>
        <button onClick={exportCSV} className="btn-ghost border border-slate-200 dark:border-slate-700"><Download className="h-4 w-4" /> Export CSV</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice or cashier..." className="input pl-10" />
        </div>
        <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value as 'all' | PaymentMethod)} className="input sm:w-36">
          <option value="all">All methods</option>
          {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map((m) => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'completed' | 'void')} className="input sm:w-36">
          <option value="all">All status</option>
          <option value="completed">Completed</option>
          <option value="void">Void</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-4 py-3 font-semibold">Invoice</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Cashier</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Total</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-200">{t.invoiceNo}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{fmtDate(t.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{t.cashierName}</td>
                  <td className="px-4 py-3"><span className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{METHOD_LABELS[t.method]}</span></td>
                  <td className="px-4 py-3 text-slate-500">{t.items.length}</td>
                  <td className="px-4 py-3">
                    <span className={`chip ${t.status === 'completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'}`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-right text-slate-900 dark:text-white">{fmtCurrency(t.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setDetailId(t.id)} title="View" className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-accent dark:hover:bg-slate-800"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => navigate(`/receipt?id=${t.id}`)} title="Receipt" className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-accent dark:hover:bg-slate-800"><ReceiptText className="h-4 w-4" /></button>
                      {t.status === 'completed' && (
                        <button onClick={() => setVoidId(t.id)} title="Void" className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30"><Ban className="h-4 w-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                  <Filter className="mx-auto h-10 w-10 mb-2 opacity-40" />No transactions match your filters
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      <Modal open={!!detail} onClose={() => setDetailId(null)} title={detail?.invoiceNo} subtitle={detail ? fmtDate(detail.createdAt) : ''} size="md"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setDetailId(null)}>Close</button>
            {detail && <button className="btn-primary" onClick={() => navigate(`/receipt?id=${detail.id}`)}><ReceiptText className="h-4 w-4" /> View Receipt</button>}
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                <p className="text-xs text-slate-400">Cashier</p>
                <p className="font-semibold text-slate-900 dark:text-white">{detail.cashierName}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                <p className="text-xs text-slate-400">Payment</p>
                <p className="font-semibold capitalize text-slate-900 dark:text-white">{METHOD_LABELS[detail.method]}</p>
              </div>
              {detail.customerName && (
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-400">Customer</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{detail.customerName}</p>
                </div>
              )}
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                <p className="text-xs text-slate-400">Status</p>
                <p className="font-semibold capitalize text-slate-900 dark:text-white">{detail.status}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Items</p>
              <div className="space-y-2">
                {detail.items.map((i, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-accent-50 text-xs font-bold text-accent dark:bg-accent/10">{i.qty}</span>
                    <span className="flex-1 text-slate-700 dark:text-slate-200">{i.name}</span>
                    <span className="text-slate-400 text-xs">@ {fmtCurrency(i.price)}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{fmtCurrency(i.price * i.qty)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{fmtCurrency(detail.subtotal)}</span></div>
              {detail.discount > 0 && <div className="flex justify-between text-rose-500"><span>Discount</span><span>-{fmtCurrency(detail.discount)}</span></div>}
              <div className="flex justify-between text-slate-500"><span>Tax</span><span>{fmtCurrency(detail.tax)}</span></div>
              <div className="flex justify-between text-slate-500"><span>Service Charge</span><span>{fmtCurrency(detail.serviceCharge)}</span></div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-base"><span className="text-slate-900 dark:text-white">Total</span><span className="text-accent">{fmtCurrency(detail.total)}</span></div>
              <div className="flex justify-between text-slate-500"><span>Paid</span><span>{fmtCurrency(detail.paid)}</span></div>
              {detail.change > 0 && <div className="flex justify-between text-emerald-600"><span>Change</span><span>{fmtCurrency(detail.change)}</span></div>}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!voidId} onClose={() => setVoidId(null)}
        onConfirm={() => { if (voidId) { dbTransactions.void(voidId); toast.success('Transaction voided'); reload(); } }}
        title="Void transaction" message="This transaction will be marked as voided. The record remains for audit purposes." confirmLabel="Void" />
    </div>
  );
}
