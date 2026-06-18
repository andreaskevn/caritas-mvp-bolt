import { useEffect, useState } from 'react';
import {
  Banknote, QrCode, CreditCard, Wallet, ArrowLeft, Check, Loader2, ShoppingCart,
  Receipt as ReceiptIcon, Home, Smartphone, Landmark, CheckCircle2,
} from 'lucide-react';
import { useCart } from '../lib/cart';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { dbMenu, dbTransactions, fmtCurrency, uid, type Transaction, type PaymentMethod } from '../lib/db';
import { QRCode } from '../components/QRCode';

const METHODS: { id: PaymentMethod; label: string; icon: typeof Banknote; desc: string; color: string }[] = [
  { id: 'cash', label: 'Cash', icon: Banknote, desc: 'Receive physical cash', color: 'bg-emerald-500' },
  { id: 'qris', label: 'QRIS', icon: QrCode, desc: 'Scan to pay via QR', color: 'bg-sky-500' },
  { id: 'debit', label: 'Debit Card', icon: Landmark, desc: 'Bank debit card', color: 'bg-indigo-500' },
  { id: 'credit', label: 'Credit Card', icon: CreditCard, desc: 'Visa / Mastercard', color: 'bg-violet-500' },
  { id: 'ewallet', label: 'E-Wallet', icon: Wallet, desc: 'GoPay / OVO / Dana', color: 'bg-amber-500' },
];

const QUICK_CASH = [50000, 100000, 150000, 200000, 500000];

export function PaymentPage() {
  const cart = useCart();
  const { navigate, user } = useApp();
  const toast = useToast();
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<Transaction | null>(null);
  const [paidStep, setPaidStep] = useState(false); // for card/qris simulation

  useEffect(() => {
    if (cart.items.length === 0 && !success) {
      navigate('/pos');
    }
  }, [cart.items.length, success, navigate]);

  const total = cart.totals.total;
  const change = method === 'cash' ? Math.max(0, cashGiven - total) : 0;

  const completePayment = (paidAmount: number) => {
    setProcessing(true);
    setTimeout(() => {
      const invoiceNo = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(1000 + dbTransactions.all().length + 1).slice(-4)}`;
      const tx: Transaction = {
        id: uid('tx'),
        invoiceNo,
        items: cart.items,
        subtotal: cart.totals.subtotal,
        discount: cart.totals.discount,
        discountType: cart.discountType,
        discountValue: cart.discountValue,
        tax: cart.totals.tax,
        serviceCharge: cart.totals.serviceCharge,
        total,
        paid: paidAmount,
        change: Math.max(0, paidAmount - total),
        method: method!,
        customerName: cart.customerName || undefined,
        customerPhone: cart.customerPhone || undefined,
        cashierId: user!.id,
        cashierName: user!.name,
        status: 'completed',
        createdAt: new Date().toISOString(),
      };
      dbTransactions.add(tx);
      dbMenu.consumeStock(cart.items);
      setProcessing(false);
      setSuccess(tx);
      cart.clear();
      toast.success('Payment successful!');
    }, 1100);
  };

  const handlePay = () => {
    if (!method) return;
    if (method === 'cash') {
      if (cashGiven < total) {
        toast.error('Cash amount is less than total');
        return;
      }
      completePayment(cashGiven);
    } else {
      // simulate processing for card/qris/ewallet
      setPaidStep(true);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto py-10 animate-fade-in">
        <div className="card p-8 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 animate-scale-in">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold text-slate-900 dark:text-white">Payment Successful</h2>
          <p className="mt-1 text-sm text-slate-500">Order has been completed</p>

          <div className="mt-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Invoice</span><span className="font-mono font-semibold text-slate-900 dark:text-white">{success.invoiceNo}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Method</span><span className="font-semibold capitalize text-slate-900 dark:text-white">{success.method}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Total Paid</span><span className="font-bold text-accent">{fmtCurrency(success.paid)}</span></div>
            {success.change > 0 && (
              <div className="flex justify-between"><span className="text-slate-500">Change</span><span className="font-bold text-emerald-500">{fmtCurrency(success.change)}</span></div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button onClick={() => navigate(`/receipt?id=${success.id}`)} className="btn-primary">
              <ReceiptIcon className="h-4 w-4" /> View Receipt
            </button>
            <button onClick={() => navigate('/pos')} className="btn-ghost border border-slate-200 dark:border-slate-700">
              <Home className="h-4 w-4" /> New Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <button onClick={() => navigate('/pos')} className="btn-ghost mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to POS
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Order summary */}
        <div className="lg:col-span-2 card p-5 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-slate-900 dark:text-white">Order Summary</h3>
          </div>
          {cart.customerName && (
            <p className="text-sm text-slate-500 mb-3">Customer: <span className="font-semibold text-slate-900 dark:text-white">{cart.customerName}</span></p>
          )}
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin mb-4">
            {cart.items.map((i) => (
              <div key={i.id} className="flex items-center gap-2 text-sm">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-accent-50 text-xs font-bold text-accent dark:bg-accent/10">{i.qty}</span>
                <span className="flex-1 text-slate-700 dark:text-slate-200 truncate">{i.name}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{fmtCurrency(i.price * i.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{fmtCurrency(cart.totals.subtotal)}</span></div>
            {cart.totals.discount > 0 && <div className="flex justify-between text-rose-500"><span>Discount</span><span>-{fmtCurrency(cart.totals.discount)}</span></div>}
            <div className="flex justify-between text-slate-500"><span>Tax</span><span>{fmtCurrency(cart.totals.tax)}</span></div>
            <div className="flex justify-between text-slate-500"><span>Service Charge</span><span>{fmtCurrency(cart.totals.serviceCharge)}</span></div>
            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">Total</span>
              <span className="font-extrabold text-xl text-accent">{fmtCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="lg:col-span-3 card p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Select Payment Method</h3>
          {!method && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {METHODS.map((m) => (
                <button key={m.id} onClick={() => setMethod(m.id)}
                  className="group rounded-xl border border-slate-200 p-4 text-left transition hover:border-accent hover:shadow-md dark:border-slate-800 dark:hover:border-accent">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${m.color} text-white shadow-sm`}>
                    <m.icon className="h-5 w-5" />
                  </span>
                  <p className="mt-2.5 text-sm font-bold text-slate-900 dark:text-white">{m.label}</p>
                  <p className="text-xs text-slate-400">{m.desc}</p>
                </button>
              ))}
            </div>
          )}

          {method && (
            <div className="animate-fade-in">
              <button onClick={() => { setMethod(null); setCashGiven(0); setPaidStep(false); }} className="btn-ghost mb-4 -ml-2 text-sm">
                <ArrowLeft className="h-4 w-4" /> Choose another method
              </button>

              <div className="flex items-center gap-3 mb-5">
                {(() => {
                  const m = METHODS.find((x) => x.id === method)!;
                  return (
                    <>
                      <span className={`grid h-12 w-12 place-items-center rounded-xl ${m.color} text-white`}><m.icon className="h-6 w-6" /></span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{m.label}</p>
                        <p className="text-xs text-slate-400">{m.desc}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Cash */}
              {method === 'cash' && !processing && (
                <div className="space-y-4">
                  <div>
                    <label className="label">Cash received</label>
                    <input type="number" min={0} value={cashGiven || ''} onChange={(e) => setCashGiven(Number(e.target.value))} className="input text-lg font-bold" placeholder="0" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setCashGiven(total)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:border-accent dark:border-slate-700">Exact</button>
                    {QUICK_CASH.map((c) => (
                      <button key={c} onClick={() => setCashGiven(c)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:border-accent dark:border-slate-700">{fmtCurrency(c)}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                    <div>
                      <p className="text-xs text-slate-400">Total Due</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{fmtCurrency(total)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Change</p>
                      <p className={`text-lg font-extrabold ${change > 0 ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}>{fmtCurrency(change)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* QRIS */}
              {method === 'qris' && !paidStep && !processing && (
                <div className="text-center py-2">
                  <div className="mx-auto inline-block rounded-2xl border-4 border-slate-100 p-3 dark:border-slate-800">
                    <QRCode value={`qris|brewpos|${total}|${Date.now()}`} size={200} />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">Scan QRIS to Pay</p>
                  <p className="text-xs text-slate-400">Open your bank or e-wallet app to scan</p>
                  <p className="mt-2 text-xl font-extrabold text-accent">{fmtCurrency(total)}</p>
                </div>
              )}

              {/* Card / E-wallet simulation */}
              {['debit', 'credit', 'ewallet'].includes(method) && !paidStep && !processing && (
                <div className="text-center py-6">
                  {method === 'ewallet' ? (
                    <Smartphone className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-700" />
                  ) : (
                    <CreditCard className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-700" />
                  )}
                  <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
                    {method === 'ewallet' ? 'Confirm payment on your e-wallet app' : method === 'debit' ? 'Insert or tap debit card on terminal' : 'Insert or tap credit card on terminal'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Simulated terminal — press Confirm</p>
                  <p className="mt-3 text-xl font-extrabold text-accent">{fmtCurrency(total)}</p>
                </div>
              )}

              {/* Processing */}
              {processing && (
                <div className="text-center py-10">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-accent" />
                  <p className="mt-4 font-semibold text-slate-900 dark:text-white">Processing payment...</p>
                  <p className="text-xs text-slate-400">Please wait</p>
                </div>
              )}

              {/* QRIS / card confirm step */}
              {paidStep && !processing && (
                <div className="text-center py-6">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 animate-scale-in">
                    <Check className="h-9 w-9 text-emerald-500" />
                  </div>
                  <p className="mt-4 font-semibold text-slate-900 dark:text-white">Payment received from customer</p>
                  <p className="text-xs text-slate-400">Confirm to complete the order</p>
                  <p className="mt-3 text-xl font-extrabold text-accent">{fmtCurrency(total)}</p>
                </div>
              )}

              {/* Pay button */}
              {!processing && (
                <button onClick={() => (paidStep ? completePayment(total) : handlePay())} className="btn-primary w-full mt-5 py-3">
                  {paidStep ? <><Check className="h-5 w-5" /> Confirm Payment</> : `Pay ${fmtCurrency(total)}`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
