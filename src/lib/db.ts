// LocalStorage-backed mock database for BrewPOS
// Provides typed CRUD over collections with seed data.

export type Role = 'admin' | 'manager' | 'cashier';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  avatar?: string;
  active: boolean;
  phone?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  active: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  stock: number;
  available: boolean;
  cost?: number;
  sku?: string;
}

export interface CartItem {
  id: string; // menu item id
  name: string;
  price: number;
  qty: number;
  note?: string;
  image?: string;
}

export interface PaymentBreakdown {
  method: PaymentMethod;
  amount: number;
}

export type PaymentMethod = 'cash' | 'qris' | 'debit' | 'credit' | 'ewallet';

export interface Transaction {
  id: string;
  invoiceNo: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountType: 'percent' | 'amount';
  discountValue: number;
  tax: number;
  serviceCharge: number;
  total: number;
  paid: number;
  change: number;
  method: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  cashierId: string;
  cashierName: string;
  status: 'completed' | 'void' | 'held';
  createdAt: string;
}

export interface HeldOrder {
  id: string;
  label: string;
  items: CartItem[];
  customerName?: string;
  createdAt: string;
}

export interface Settings {
  cafeName: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number;
  serviceChargeRate: number;
  currency: string;
  logoText: string;
  receiptFooter: string;
}

const PREFIX = 'brewpos:';
const KEY = {
  users: PREFIX + 'users',
  categories: PREFIX + 'categories',
  menu: PREFIX + 'menu',
  transactions: PREFIX + 'transactions',
  held: PREFIX + 'held',
  settings: PREFIX + 'settings',
  session: PREFIX + 'session',
  theme: PREFIX + 'theme',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('brewpos:change', { detail: { key } }));
}

export const uid = (p = 'id') =>
  `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

// ---------- USERS ----------
export const dbUsers = {
  all: () => read<User[]>(KEY.users, []),
  save: (u: User[]) => write(KEY.users, u),
  add: (u: Omit<User, 'id' | 'createdAt'>) => {
    const user: User = { ...u, id: uid('usr'), createdAt: new Date().toISOString() };
    const list = dbUsers.all();
    list.push(user);
    dbUsers.save(list);
    return user;
  },
  update: (id: string, patch: Partial<User>) => {
    const list = dbUsers.all().map((u) => (u.id === id ? { ...u, ...patch } : u));
    dbUsers.save(list);
  },
  remove: (id: string) => dbUsers.save(dbUsers.all().filter((u) => u.id !== id)),
};

// ---------- CATEGORIES ----------
export const dbCategories = {
  all: () => read<Category[]>(KEY.categories, []),
  save: (c: Category[]) => write(KEY.categories, c),
  add: (c: Omit<Category, 'id'>) => {
    const cat: Category = { ...c, id: uid('cat') };
    const list = dbCategories.all();
    list.push(cat);
    dbCategories.save(list);
    return cat;
  },
  update: (id: string, patch: Partial<Category>) =>
    dbCategories.save(dbCategories.all().map((c) => (c.id === id ? { ...c, ...patch } : c))),
  remove: (id: string) => {
    dbCategories.save(dbCategories.all().filter((c) => c.id !== id));
    dbMenu.save(dbMenu.all().filter((m) => m.categoryId !== id));
  },
};

// ---------- MENU ----------
export const dbMenu = {
  all: () => read<MenuItem[]>(KEY.menu, []),
  save: (m: MenuItem[]) => write(KEY.menu, m),
  add: (m: Omit<MenuItem, 'id'>) => {
    const item: MenuItem = { ...m, id: uid('itm') };
    const list = dbMenu.all();
    list.push(item);
    dbMenu.save(list);
    return item;
  },
  update: (id: string, patch: Partial<MenuItem>) =>
    dbMenu.save(dbMenu.all().map((m) => (m.id === id ? { ...m, ...patch } : m))),
  remove: (id: string) => dbMenu.save(dbMenu.all().filter((m) => m.id !== id)),
  consumeStock: (items: CartItem[]) => {
    const list = dbMenu.all().map((m) => {
      const ci = items.find((i) => i.id === m.id);
      return ci ? { ...m, stock: Math.max(0, m.stock - ci.qty) } : m;
    });
    dbMenu.save(list);
  },
};

// ---------- TRANSACTIONS ----------
export const dbTransactions = {
  all: () => read<Transaction[]>(KEY.transactions, []),
  save: (t: Transaction[]) => write(KEY.transactions, t),
  add: (t: Transaction) => {
    const list = dbTransactions.all();
    list.unshift(t);
    dbTransactions.save(list);
  },
  void: (id: string) =>
    dbTransactions.save(dbTransactions.all().map((t) => (t.id === id ? { ...t, status: 'void' } : t))),
};

// ---------- HELD ORDERS ----------
export const dbHeld = {
  all: () => read<HeldOrder[]>(KEY.held, []),
  save: (h: HeldOrder[]) => write(KEY.held, h),
  add: (h: Omit<HeldOrder, 'id' | 'createdAt'>) => {
    const order: HeldOrder = { ...h, id: uid('held'), createdAt: new Date().toISOString() };
    const list = dbHeld.all();
    list.unshift(order);
    dbHeld.save(list);
    return order;
  },
  remove: (id: string) => dbHeld.save(dbHeld.all().filter((h) => h.id !== id)),
};

// ---------- SETTINGS ----------
export const dbSettings = {
  get: (): Settings =>
    read<Settings>(KEY.settings, {
      cafeName: 'Brew & Co.',
      address: 'Jl. Kopi Senja No. 17, Jakarta',
      phone: '+62 21 5550 1234',
      email: 'hello@brewco.id',
      taxRate: 11,
      serviceChargeRate: 5,
      currency: 'IDR',
      logoText: 'BrewPOS',
      receiptFooter: 'Terima kasih atas kunjungan Anda!',
    }),
  save: (s: Settings) => write(KEY.settings, s),
};

// ---------- SESSION ----------
export const dbSession = {
  get: (): User | null => read<User | null>(KEY.session, null),
  set: (u: User | null) => write(KEY.session, u),
  clear: () => localStorage.removeItem(KEY.session),
};

// ---------- THEME ----------
export const dbTheme = {
  get: (): 'light' | 'dark' => read<'light' | 'dark'>(KEY.theme, 'dark'),
  set: (t: 'light' | 'dark') => write(KEY.theme, t),
};

export const fmtCurrency = (n: number, currency = 'IDR') => {
  if (currency === 'IDR') {
    return 'Rp ' + Math.round(n).toLocaleString('id-ID');
  }
  return currency + ' ' + n.toFixed(2);
};

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const fmtShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
