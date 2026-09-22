import { Calendar } from 'lucide-react';
import DiscoveryCallForm from './DiscoveryCallForm';

export default function DiscoveryCallSection() {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-8 lg:sticky lg:top-28">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 shrink-0 rounded-full border border-indigo-500/40 bg-indigo-500/10 flex items-center justify-center">
          <Calendar className="w-4 h-4 text-indigo-400" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground leading-tight">Prefer to Talk It Through?</h2>
          <p className="text-xs text-muted-foreground">30 min · No pressure · No sales pitch</p>
        </div>
      </div>

      <DiscoveryCallForm />
    </div>
  );
}
