import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { CartProvider } from './lib/cart';
import { ToastProvider } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { POSPage } from './pages/POSPage';
import { PaymentPage } from './pages/PaymentPage';
import { ReceiptPage } from './pages/ReceiptPage';
import { MenuPage } from './pages/MenuPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { UsersPage } from './pages/UsersPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

function Shell() {
  const { user, route } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user || route === '/login') {
    return <LoginPage />;
  }

  const isPos = route === '/pos' || route.startsWith('/payment') || route.startsWith('/receipt');

  const renderPage = () => {
    const base = route.split('?')[0];
    switch (base) {
      case '/dashboard': return <DashboardPage />;
      case '/pos': return <POSPage />;
      case '/payment': return <PaymentPage />;
      case '/receipt': return <ReceiptPage />;
      case '/menu': return <MenuPage />;
      case '/categories': return <CategoriesPage />;
      case '/users': return <UsersPage />;
      case '/transactions': return <TransactionsPage />;
      case '/reports': return <ReportsPage />;
      case '/settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className={`flex-1 p-4 sm:p-6 ${isPos ? 'max-w-none' : 'max-w-7xl w-full mx-auto'}`}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <CartProvider>
          <Shell />
        </CartProvider>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
