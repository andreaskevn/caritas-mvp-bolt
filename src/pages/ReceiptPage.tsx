import { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, Printer, Download, Home, Coffee } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbTransactions, dbSettings, fmtCurrency, fmtDate } from '../lib/db';
import { useToast } from '../components/Toast';

export function ReceiptPage() {
  const { route, navigate } = useApp();
  const toast = useToast();
  const id = useMemo(() => new URLSearchParams(route.split('?')[1] || '').get('id'), [route]);
  const tx = useMemo(() => dbTransactions.all().find((t) => t.id === id) || null, [id]);
  const settings = useMemo(() => dbSettings.get(), []);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(t);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!tx) return;
    const receipt = buildReceiptText(tx, settings);
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tx.invoiceNo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded');
  };

  if (!loaded) return <div className="py-20 text-center text-slate-400">Loading receipt...</div>;
  if (!tx) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p className="text-slate-500">Receipt not found.</p>
        <button onClick={() => navigate('/pos')} className="btn-primary mt-4">Back to POS</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto animate-fade-in no-print-padding">
      <div className="flex items-center justify-between mb-4 no-print">
        <button onClick={() => navigate('/transactions')} className="btn-ghost -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-ghost border border-slate-200 dark:border-slate-700">
            <Printer className="h-4 w-4" /> Print
          </button>
          <button onClick={handleDownload} className="btn-primary">
            <Download className="h-4 w-4" /> Download
          </button>
        </div>
      </div>

      {/* Thermal receipt */}
      <div className="receipt-print-area receipt-paper rounded-lg shadow-xl p-6 w-[80mm] mx-auto" style={{ maxWidth: '80mm' }}>
        {/* Header */}
        <div className="text-center">
          <div className="inline-grid h-12 w-12 place-items-center rounded-xl bg-slate-900 mx-auto mb-2">
            <Coffee className="h-6 w-6 text-accent" />
          </div>
          <p className="text-lg font-extrabold">{settings.cafeName}</p>
          <p className="text-[11px] mt-0.5 opacity-70">{settings.address}</p>
          <p className="text-[11px] opacity-70">{settings.phone}</p>
        </div>

        <div className="my-3 border-t border-dashed border-slate-400" />

        <div className="text-[11px] space-y-0.5">
          <div className="flex justify-between"><span>Invoice</span><span className="font-bold">{tx.invoiceNo}</span></div>
          <div className="flex justify-between"><span>Date</span><span>{fmtDate(tx.createdAt)}</span></div>
          <div className="flex justify-between"><span>Cashier</span><span>{tx.cashierName}</span></div>
          {tx.customerName && <div className="flex justify-between"><span>Customer</span><span>{tx.customerName}</span></div>}
          <div className="flex justify-between"><span>Payment</span><span className="uppercase">{tx.method}</span></div>
        </div>

        <div className="my-3 border-t border-dashed border-slate-400" />

        {/* items */}
        <div className="text-[11px] space-y-1.5">
          {tx.items.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between">
                <span className="font-semibold">{item.name}</span>
                <span>{fmtCurrency(item.price * item.qty)}</span>
              </div>
              <div className="flex justify-between opacity-70">
                <span>{item.qty} x {fmtCurrency(item.price)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="my-3 border-t border-dashed border-slate-400" />

        <div className="text-[11px] space-y-0.5">
          <div className="flex justify-between"><span>Subtotal</span><span>{fmtCurrency(tx.subtotal)}</span></div>
          {tx.discount > 0 && (
            <div className="flex justify-between"><span>Discount{tx.discountType === 'percent' ? ` (${tx.discountValue}%)` : ''}</span><span>-{fmtCurrency(tx.discount)}</span></div>
          )}
          <div className="flex justify-between"><span>Tax</span><span>{fmtCurrency(tx.tax)}</span></div>
          <div className="flex justify-between"><span>Service Charge</span><span>{fmtCurrency(tx.serviceCharge)}</span></div>
        </div>

        <div className="my-2 border-t border-dashed border-slate-400" />

        <div className="flex justify-between text-sm font-extrabold">
          <span>TOTAL</span>
          <span>{fmtCurrency(tx.total)}</span>
        </div>

        <div className="my-2 border-t border-dashed border-slate-400" />

        <div className="text-[11px] space-y-0.5">
          <div className="flex justify-between"><span>Paid ({tx.method.toUpperCase()})</span><span>{fmtCurrency(tx.paid)}</span></div>
          {tx.change > 0 && <div className="flex justify-between font-bold"><span>Change</span><span>{fmtCurrency(tx.change)}</span></div>}
        </div>

        <div className="my-3 border-t border-dashed border-slate-400" />

        <div className="text-center text-[11px] opacity-70">
          <p className="font-semibold">{settings.receiptFooter}</p>
          <p className="mt-1">This is a computer-generated receipt.</p>
          <p>www.brewco.id</p>
        </div>

        <div className="mt-4 text-center text-[9px] opacity-50">
          ★ ★ ★ ★ ★<br />Powered by BrewPOS
        </div>
      </div>

      <div className="mt-6 text-center no-print">
        <button onClick={() => navigate('/pos')} className="btn-ghost">
          <Home className="h-4 w-4" /> New Order
        </button>
      </div>
    </div>
  );
}

function buildReceiptText(tx: ReturnType<typeof dbTransactions.all>[number], s: ReturnType<typeof dbSettings.get>) {
  const line = '='.repeat(40);
  const dash = '-'.repeat(40);
  const w = (label: string, val: string) => {
    const ls = label.slice(0, 20);
    const vs = val.slice(0, 18);
    return ls + ' '.repeat(Math.max(1, 40 - ls.length - vs.length)) + vs;
  };
  return [
    s.cafeName,
    s.address,
    s.phone,
    line,
    `Invoice: ${tx.invoiceNo}`,
    `Date  : ${fmtDate(tx.createdAt)}`,
    `Cashier: ${tx.cashierName}`,
    tx.customerName ? `Customer: ${tx.customerName}` : '',
    dash,
    ...tx.items.flatMap((i) => [i.name, `  ${i.qty} x ${fmtCurrency(i.price)}`.padEnd(28) + fmtCurrency(i.price * i.qty)]),
    dash,
    w('Subtotal', fmtCurrency(tx.subtotal)),
    tx.discount ? w('Discount', '-' + fmtCurrency(tx.discount)) : '',
    w('Tax', fmtCurrency(tx.tax)),
    w('Service Charge', fmtCurrency(tx.serviceCharge)),
    dash,
    w('TOTAL', fmtCurrency(tx.total)),
    dash,
    w(`Paid (${tx.method})`, fmtCurrency(tx.paid)),
    tx.change ? w('Change', fmtCurrency(tx.change)) : '',
    line,
    s.receiptFooter,
    'Powered by BrewPOS',
  ].filter(Boolean).join('\n');
}
