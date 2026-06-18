import type { User, Category, MenuItem, Transaction } from './db';
import { dbUsers, dbCategories, dbMenu, dbTransactions, dbSettings } from './db';

const STOCK_IMG = {
  coffee:
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
  latte:
    'https://images.pexels.com/photos/3020919/pexels-photo-3020919.jpeg?auto=compress&cs=tinysrgb&w=400',
  cappuccino:
    'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
  americano:
    'https://images.pexels.com/photos/1566308/pexels-photo-1566308.jpeg?auto=compress&cs=tinysrgb&w=400',
  mocha:
    'https://images.pexels.com/photos/885029/pexels-photo-885029.jpeg?auto=compress&cs=tinysrgb&w=400',
  espresso:
    'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=400',
  matcha:
    'https://images.pexels.com/photos/4109742/pexels-photo-4109742.jpeg?auto=compress&cs=tinysrgb&w=400',
  tea: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=400',
  chocolate:
    'https://images.pexels.com/photos/45202/brownie-dessert-cake-sweet-45202.jpeg?auto=compress&cs=tinysrgb&w=400',
  lemonade:
    'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400',
  sandwich:
    'https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=400',
  croissant:
    'https://images.pexels.com/photos/2135/food-france-morning-breakfast.jpg?auto=compress&cs=tinysrgb&w=400',
  cake:
    'https://images.pexels.com/photos/2144112/pexels-photo-2144112.jpeg?auto=compress&cs=tinysrgb&w=400',
  cheesecake:
    'https://images.pexels.com/photos/4040692/pexels-photo-4040692.jpeg?auto=compress&cs=tinysrgb&w=400',
  donut:
    'https://images.pexels.com/photos/2955821/pexels-photo-2955821.jpeg?auto=compress&cs=tinysrgb&w=400',
  croffle:
    'https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?auto=compress&cs=tinysrgb&w=400',
};

export function seedIfEmpty() {
  if (dbUsers.all().length > 0) return;

  const users: Omit<User, 'id' | 'createdAt'>[] = [
    { name: 'Admin Brew', email: 'admin@brewco.id', password: 'admin123', role: 'admin', active: true, phone: '081234567890' },
    { name: 'Maya Senja', email: 'manager@brewco.id', password: 'manager123', role: 'manager', active: true, phone: '081234567891' },
    { name: 'Dimas Pagii', email: 'cashier@brewco.id', password: 'cashier123', role: 'cashier', active: true, phone: '081234567892' },
  ];
  const created = users.map((u) => dbUsers.add(u));

  const categories: Omit<Category, 'id'>[] = [
    { name: 'Coffee', icon: 'Coffee', color: '#C97B4A', active: true },
    { name: 'Non-Coffee', icon: 'CupSoda', color: '#5B9BD5', active: true },
    { name: 'Food', icon: 'Sandwich', color: '#E8A05C', active: true },
    { name: 'Dessert', icon: 'Cake', color: '#D96A6A', active: true },
  ];
  const cats = categories.map((c) => dbCategories.add(c));
  const [coffeeId, nonCoffeeId, foodId, dessertId] = cats.map((c) => c.id);

  const menu: Omit<MenuItem, 'id'>[] = [
    { name: 'Espresso', description: 'Double shot rich espresso', price: 18000, categoryId: coffeeId, image: STOCK_IMG.espresso, stock: 100, available: true, cost: 8000, sku: 'CFE-ESP' },
    { name: 'Cappuccino', description: 'Espresso with steamed milk foam', price: 28000, categoryId: coffeeId, image: STOCK_IMG.cappuccino, stock: 80, available: true, cost: 12000, sku: 'CFE-CAP' },
    { name: 'Caffe Latte', description: 'Smooth espresso with milk', price: 30000, categoryId: coffeeId, image: STOCK_IMG.latte, stock: 75, available: true, cost: 13000, sku: 'CFE-LAT' },
    { name: 'Americano', description: 'Espresso diluted with hot water', price: 22000, categoryId: coffeeId, image: STOCK_IMG.americano, stock: 90, available: true, cost: 9000, sku: 'CFE-AME' },
    { name: 'Mocha Latte', description: 'Chocolate espresso latte', price: 35000, categoryId: coffeeId, image: STOCK_IMG.mocha, stock: 60, available: true, cost: 15000, sku: 'CFE-MOC' },
    { name: 'Caramel Latte', description: 'Espresso with caramel syrup', price: 33000, categoryId: coffeeId, image: STOCK_IMG.coffee, stock: 65, available: true, cost: 14000, sku: 'CFE-CAR' },
    { name: 'Iced Coffee', description: 'Chilled brewed coffee', price: 25000, categoryId: coffeeId, image: STOCK_IMG.coffee, stock: 70, available: true, cost: 10000, sku: 'CFE-ICD' },
    { name: 'Matcha Latte', description: 'Premium matcha with milk', price: 35000, categoryId: nonCoffeeId, image: STOCK_IMG.matcha, stock: 50, available: true, cost: 16000, sku: 'NON-MAT' },
    { name: 'Hot Chocolate', description: 'Rich chocolate drink', price: 27000, categoryId: nonCoffeeId, image: STOCK_IMG.chocolate, stock: 55, available: true, cost: 11000, sku: 'NON-HOC' },
    { name: 'Lemon Tea', description: 'Refreshing iced lemon tea', price: 20000, categoryId: nonCoffeeId, image: STOCK_IMG.tea, stock: 85, available: true, cost: 7000, sku: 'NON-LET' },
    { name: 'Strawberry Lemonade', description: 'Fresh lemonade with strawberry', price: 26000, categoryId: nonCoffeeId, image: STOCK_IMG.lemonade, stock: 45, available: true, cost: 12000, sku: 'NON-SLL' },
    { name: 'Butter Croissant', description: 'Flaky butter croissant', price: 24000, categoryId: foodId, image: STOCK_IMG.croissant, stock: 40, available: true, cost: 10000, sku: 'FD-CRS' },
    { name: 'Club Sandwich', description: 'Triple decker sandwich', price: 42000, categoryId: foodId, image: STOCK_IMG.sandwich, stock: 35, available: true, cost: 18000, sku: 'FD-CLB' },
    { name: 'Chocolate Croffle', description: 'Croissant waffle hybrid', price: 36000, categoryId: foodId, image: STOCK_IMG.croffle, stock: 30, available: true, cost: 15000, sku: 'FD-CRF' },
    { name: 'Cheesecake', description: 'New York baked cheesecake', price: 38000, categoryId: dessertId, image: STOCK_IMG.cheesecake, stock: 25, available: true, cost: 16000, sku: 'DS-CHC' },
    { name: 'Chocolate Cake', description: 'Molten lava cake', price: 32000, categoryId: dessertId, image: STOCK_IMG.cake, stock: 28, available: true, cost: 13000, sku: 'DS-CKE' },
    { name: 'Glazed Donut', description: 'Soft sugar glazed donut', price: 18000, categoryId: dessertId, image: STOCK_IMG.donut, stock: 48, available: true, cost: 7000, sku: 'DS-DNT' },
    { name: 'Tiramisu', description: 'Classic Italian dessert', price: 36000, categoryId: dessertId, image: STOCK_IMG.cake, stock: 20, available: true, cost: 15000, sku: 'DS-TIR' },
  ];
  menu.forEach((m) => dbMenu.add(m));

  // sample transactions for the past 7 days
  const menuItems = dbMenu.all();
  const cashier = created.find((u) => u.role === 'cashier')!;
  const methods: Transaction['method'][] = ['cash', 'qris', 'debit', 'credit', 'ewallet'];
  const settings = dbSettings.get();
  const sampleMenus = menuItems.slice(0, 12);
  const totalTx = 38;
  for (let i = 0; i < totalTx; i++) {
    const daysAgo = Math.floor(i / 6);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(8 + (i % 12), (i * 7) % 60);
    const itemCount = 1 + (i % 4);
    const items = [];
    let subtotal = 0;
    for (let j = 0; j < itemCount; j++) {
      const mi = sampleMenus[(i + j) % sampleMenus.length];
      const qty = 1 + ((i + j) % 3);
      items.push({ id: mi.id, name: mi.name, price: mi.price, qty, image: mi.image });
      subtotal += mi.price * qty;
    }
    const discountValue = i % 5 === 0 ? 10 : 0;
    const discount = discountValue ? (subtotal * discountValue) / 100 : 0;
    const afterDiscount = subtotal - discount;
    const tax = (afterDiscount * settings.taxRate) / 100;
    const serviceCharge = (afterDiscount * settings.serviceChargeRate) / 100;
    const total = Math.round(afterDiscount + tax + serviceCharge);
    const method = methods[i % methods.length];
    const paid = method === 'cash' ? Math.ceil(total / 5000) * 5000 : total;
    dbTransactions.add({
      id: `tx_seed_${i}`,
      invoiceNo: `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(1001 + i)}`,
      items,
      subtotal,
      discount,
      discountType: 'percent',
      discountValue,
      tax,
      serviceCharge,
      total,
      paid,
      change: paid - total,
      method,
      customerName: i % 3 === 0 ? `Customer ${i + 1}` : undefined,
      customerPhone: i % 3 === 0 ? '0812xxxx' + (1000 + i) : undefined,
      cashierId: cashier.id,
      cashierName: cashier.name,
      status: 'completed',
      createdAt: date.toISOString(),
    });
  }
}
