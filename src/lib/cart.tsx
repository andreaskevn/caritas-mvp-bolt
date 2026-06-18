import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  dbMenu, dbCategories, dbSettings, dbHeld,
  type CartItem, type MenuItem, type Category, type Settings, type HeldOrder,
} from './db';
import { uid } from './db';

interface CartCtx {
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  discountType: 'percent' | 'amount';
  discountValue: number;
  note: string;
  categories: Category[];
  settings: Settings;
  reload: () => void;
  setCustomerName: (v: string) => void;
  setCustomerPhone: (v: string) => void;
  setDiscount: (type: 'percent' | 'amount', value: number) => void;
  setNote: (v: string) => void;
  addItem: (m: MenuItem) => void;
  changeQty: (id: string, delta: number) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  hold: () => void;
  held: HeldOrder[];
  resume: (h: HeldOrder) => void;
  discardHeld: (id: string) => void;
  totals: { subtotal: number; discount: number; tax: number; serviceCharge: number; total: number };
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const [items, setItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [discountValue, setDiscountValue] = useState(0);
  const [note, setNote] = useState('');
  const [version, setVersion] = useState(0);
  const reload = () => setVersion((v) => v + 1);

  const categories = useMemo(() => dbCategories.all(), [version]);
  const settings = useMemo(() => dbSettings.get(), [version]);
  const held = useMemo(() => dbHeld.all(), [version]);

  const addItem = (m: MenuItem) => {
    if (!m.available || m.stock <= 0) return;
    setItems((prev) => {
      const ex = prev.find((i) => i.id === m.id);
      if (ex) return prev.map((i) => (i.id === m.id ? { ...i, qty: Math.min(m.stock, i.qty + 1) } : i));
      return [...prev, { id: m.id, name: m.name, price: m.price, qty: 1, image: m.image }];
    });
    refresh();
  };

  const changeQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
    refresh();
  };

  const setQty = (id: string, qty: number) => {
    const m = dbMenu.all().find((x) => x.id === id);
    const cap = m ? m.stock : qty;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(cap, qty)) } : i)));
    refresh();
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    refresh();
  };

  const clear = () => {
    setItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscountType('percent');
    setDiscountValue(0);
    setNote('');
    refresh();
  };

  const setDiscount = (type: 'percent' | 'amount', value: number) => {
    setDiscountType(type);
    setDiscountValue(Math.max(0, value));
    refresh();
  };

  const hold = () => {
    if (items.length === 0) return;
    dbHeld.add({
      label: customerName || `Order ${dbHeld.all().length + 1}`,
      items,
      customerName,
    });
    clear();
    reload();
  };

  const resume = (h: HeldOrder) => {
    setItems(h.items);
    setCustomerName(h.customerName || '');
    dbHeld.remove(h.id);
    reload();
  };

  const discardHeld = (id: string) => {
    dbHeld.remove(id);
    reload();
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const discount = discountType === 'percent'
      ? (subtotal * discountValue) / 100
      : Math.min(discountValue, subtotal);
    const after = subtotal - discount;
    const tax = (after * settings.taxRate) / 100;
    const serviceCharge = (after * settings.serviceChargeRate) / 100;
    return { subtotal, discount, tax, serviceCharge, total: Math.round(after + tax + serviceCharge) };
  }, [items, discountType, discountValue, settings]);

  const value: CartCtx = {
    items, customerName, customerPhone, discountType, discountValue, note,
    categories, settings, reload,
    setCustomerName, setCustomerPhone, setDiscount, setNote,
    addItem, changeQty, setQty, removeItem, clear, hold, held, resume, discardHeld, totals,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export { uid };
