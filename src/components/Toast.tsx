import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';
interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastCtx {
  push: (message: string, type?: ToastType) => void;
  success: (m: string) => void;
  error: (m: string) => void;
  info: (m: string) => void;
  warning: (m: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-200',
  error: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-200',
  info: 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/60 dark:border-sky-800 dark:text-sky-200',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-200',
};

const iconColor = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  info: 'text-sky-500',
  warning: 'text-amber-500',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => remove(id), 3800);
    },
    [remove]
  );

  const api: ToastCtx = {
    push,
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
    warning: (m) => push(m, 'warning'),
  };

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-[min(92vw,360px)]">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur animate-toast-in ${styles[t.type]}`}
            >
              <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColor[t.type]}`} />
              <p className="text-sm font-medium flex-1">{t.message}</p>
              <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
