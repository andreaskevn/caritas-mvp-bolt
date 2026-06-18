import { Loader2 } from 'lucide-react';

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`h-5 w-5 animate-spin ${className}`} />;
}

export function FullLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
      <Spinner className="h-7 w-7 text-accent" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
