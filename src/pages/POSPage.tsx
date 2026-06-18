import { useMemo, useState } from 'react';
import { Search, Plus, Minus, Trash2, Pause, X, ShoppingCart, User, Tag, StickyNote, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { useCart } from '../lib/cart';
import { dbMenu, fmtCurrency, fmtDate } from '../lib/db';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';

export function POSPage() {
  const cart = useCart();
  const { navigate } = useApp();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [cartOpenMobile, setCartOpenMobile] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [heldOpen, setHeldOpen] = useState(false);

  const menu = useMemo(() => {
    let list = dbMenu.all();
    if (activeCat !== 'all') list = list.filter((m) => m.categoryId === activeCat);
    if (search) list = list.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [activeCat, search, cart.items.length]);

  const categories = cart.categories;
  const checkout = () => {
    if (cart.items.length === 0) {
      toast.warning('Cart is empty');
      return;
    }
    navigate('/payment');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-7rem)] animate-fade-in">
      {/* Catalog */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu items..."
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setHeldOpen(true)}
            className="btn-ghost relative border border-slate-200 dark:border-slate-700"
          >
            <Pause className="h-4 w-4" /> Held Orders
            {cart.held.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-white">
                {cart.held.length}
              </span>
            )}
          </button>
        </div>

        {/* category filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-3 -mx-1 px-1">
          <button
            onClick={() => setActiveCat('all')}
            className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeCat === 'all' ? 'bg-accent text-white shadow-md shadow-orange-500/20' : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeCat === c.id ? 'bg-accent text-white shadow-md shadow-orange-500/20' : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* items grid */}
        <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 -mr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {menu.map((m) => {
              const disabled = !m.available || m.stock <= 0;
              return (
                <button
                  key={m.id}
                  onClick={() => cart.addItem(m)}
                  disabled={disabled}
                  className={`group card overflow-hidden text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${
                    disabled ? 'opacity-50 pointer-events-none' : 'hover:border-accent'
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={m.image} alt={m.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                    {m.stock <= 10 && m.stock > 0 && (
                      <span className="absolute top-2 left-2 chip bg-amber-500 text-white">Low: {m.stock}</span>
                    )}
                    {disabled && (
                      <span className="absolute inset-0 grid place-items-center bg-slate-900/60">
                        <span className="text-xs font-bold text-white uppercase">Out of stock</span>
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white leading-tight line-clamp-1">{m.name}</p>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-1">{m.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-extrabold text-accent">{fmtCurrency(m.price)}</span>
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent-50 text-accent transition group-hover:bg-accent group-hover:text-white dark:bg-accent/10">
                        <Plus className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
            {menu.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-400">
                <AlertCircle className="mx-auto h-10 w-10 mb-2 opacity-50" />
                No items found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart */}
      <div className={`lg:w-[380px] card flex flex-col ${cartOpenMobile ? 'fixed inset-0 z-50 lg:static rounded-none lg:rounded-2xl' : 'hidden lg:flex'}`}>
        {/* cart header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-slate-900 dark:text-white">Current Order</h3>
            {cart.items.length > 0 && (
              <span className="chip bg-accent text-white">{cart.items.reduce((s, i) => s + i.qty, 0)}</span>
            )}
          </div>
          <button className="lg:hidden" onClick={() => setCartOpenMobile(false)}>
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* customer + discount row */}
        <div className="flex gap-2 p-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <button onClick={() => setCustomerOpen(true)} className="flex-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:border-accent transition dark:border-slate-700 dark:text-slate-300">
            <User className="h-4 w-4 text-slate-400" />
            <span className="truncate">{cart.customerName || 'Walk-in customer'}</span>
          </button>
          <button onClick={() => setDiscountOpen(true)} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:border-accent transition dark:border-slate-700 dark:text-slate-300">
            <Tag className="h-4 w-4 text-slate-400" />
            {cart.discountValue > 0 ? `${cart.discountValue}${cart.discountType === 'percent' ? '%' : ''}` : 'Disc'}
          </button>
        </div>

        {/* items */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 min-h-0">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
              <ShoppingCart className="h-12 w-12 mb-3 opacity-30" />
              <p className="font-medium">Cart is empty</p>
              <p className="text-xs mt-1">Tap items to add</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-2 dark:border-slate-800">
                  <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs text-slate-400">{fmtCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => cart.changeQty(item.id, -1)} className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-600 transition dark:bg-slate-800 dark:text-slate-300">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-slate-900 dark:text-white">{item.qty}</span>
                    <button onClick={() => cart.changeQty(item.id, 1)} className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-slate-600 hover:bg-accent hover:text-white transition dark:bg-slate-800 dark:text-slate-300">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="w-20 text-right text-sm font-bold text-slate-900 dark:text-white">{fmtCurrency(item.price * item.qty)}</p>
                  <button onClick={() => cart.removeItem(item.id)} className="text-slate-300 hover:text-rose-500 transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* note + totals + actions */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 flex-shrink-0 space-y-3">
          <button onClick={() => setNoteOpen(true)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <StickyNote className="h-4 w-4" />
            <span className="truncate">{cart.note ? cart.note : 'Add order note...'}</span>
          </button>

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Subtotal</span><span>{fmtCurrency(cart.totals.subtotal)}</span>
            </div>
            {cart.totals.discount > 0 && (
              <div className="flex justify-between text-rose-500">
                <span>Discount</span><span>-{fmtCurrency(cart.totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Tax ({cart.settings.taxRate}%)</span><span>{fmtCurrency(cart.totals.tax)}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Service ({cart.settings.serviceChargeRate}%)</span><span>{fmtCurrency(cart.totals.serviceCharge)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">Total</span>
              <span className="font-extrabold text-lg text-accent">{fmtCurrency(cart.totals.total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => { cart.hold(); toast.info('Order held'); setHeldOpen(false); }} disabled={cart.items.length === 0} className="btn-ghost border border-slate-200 dark:border-slate-700 disabled:opacity-40">
              <Pause className="h-4 w-4" /> <span className="hidden sm:inline">Hold</span>
            </button>
            <button onClick={() => { cart.clear(); toast.info('Order cancelled'); }} disabled={cart.items.length === 0} className="btn-ghost border border-slate-200 text-rose-500 hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-950/30 disabled:opacity-40">
              <X className="h-4 w-4" /> <span className="hidden sm:inline">Clear</span>
            </button>
            <button onClick={checkout} disabled={cart.items.length === 0} className="btn-primary col-span-1">
              Checkout <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile floating cart button */}
      {cart.items.length > 0 && !cartOpenMobile && (
        <button
          onClick={() => setCartOpenMobile(true)}
          className="lg:hidden fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-accent px-5 py-3.5 text-white shadow-xl shadow-orange-500/40 animate-scale-in"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="font-bold">{cart.items.reduce((s, i) => s + i.qty, 0)}</span>
          <span className="text-sm opacity-90">·</span>
          <span className="font-bold">{fmtCurrency(cart.totals.total)}</span>
        </button>
      )}

      {/* Customer modal */}
      <Modal open={customerOpen} onClose={() => setCustomerOpen(false)} title="Customer Information" size="sm"
        footer={<button className="btn-primary w-full" onClick={() => setCustomerOpen(false)}>Save</button>}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Customer name</label>
            <input value={cart.customerName} onChange={(e) => cart.setCustomerName(e.target.value)} placeholder="Walk-in customer" className="input" />
          </div>
          <div>
            <label className="label">Phone number</label>
            <input value={cart.customerPhone} onChange={(e) => cart.setCustomerPhone(e.target.value)} placeholder="08xxxxxxxxxx" className="input" />
          </div>
        </div>
      </Modal>

      {/* Discount modal */}
      <Modal open={discountOpen} onClose={() => setDiscountOpen(false)} title="Apply Discount" size="sm">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(['percent', 'amount'] as const).map((t) => (
              <button key={t} onClick={() => cart.setDiscount(t, cart.discountValue)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold capitalize transition ${cart.discountType === t ? 'border-accent bg-accent-50 text-accent dark:bg-accent/10' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}>
                {t === 'percent' ? 'Percentage (%)' : 'Fixed Amount'}
              </button>
            ))}
          </div>
          <div>
            <label className="label">Discount value</label>
            <input type="number" min={0} value={cart.discountValue || ''} onChange={(e) => cart.setDiscount(cart.discountType, Number(e.target.value))} className="input" placeholder="0" />
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/50">
            <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="font-bold text-rose-500">-{fmtCurrency(cart.totals.discount)}</span></div>
          </div>
        </div>
      </Modal>

      {/* Note modal */}
      <Modal open={noteOpen} onClose={() => setNoteOpen(false)} title="Order Note" size="sm"
        footer={<button className="btn-primary w-full" onClick={() => setNoteOpen(false)}>Save Note</button>}
      >
        <textarea value={cart.note} onChange={(e) => cart.setNote(e.target.value)} placeholder="e.g. less ice, extra shot, no whipped cream..." className="input min-h-[120px] resize-none" />
      </Modal>

      {/* Held orders modal */}
      <Modal open={heldOpen} onClose={() => setHeldOpen(false)} title="Held Orders" size="md">
        {cart.held.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <Clock className="mx-auto h-10 w-10 mb-2 opacity-40" />
            <p>No held orders</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cart.held.map((h) => (
              <div key={h.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white">{h.label}</p>
                  <p className="text-xs text-slate-400">{h.items.reduce((s, i) => s + i.qty, 0)} items · {fmtDate(h.createdAt)}</p>
                </div>
                <button onClick={() => { cart.resume(h); setHeldOpen(false); toast.success('Order resumed'); }} className="btn-primary px-3 py-2 text-xs">Resume</button>
                <button onClick={() => cart.discardHeld(h.id)} className="btn-ghost text-rose-500 px-2 py-2"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
