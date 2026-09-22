import { Calendar, Check } from 'lucide-react';
import DiscoveryCallForm from './DiscoveryCallForm';

const HIGHLIGHTS = [
  '30 minutes, no pressure or sales pitch',
  "Talk directly to the people who'll build it",
  'Leave with a clear, actionable next step',
];

export default function DiscoveryCallSection() {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-8 lg:sticky lg:top-28">
      <div className="w-12 h-12 rounded-full border border-indigo-500/40 bg-indigo-500/10 flex items-center justify-center mb-6">
        <Calendar className="w-5 h-5 text-indigo-400" aria-hidden="true" />
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-3">Prefer to Talk It Through?</h2>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6">
        Skip the form and grab 30 minutes with our team — we&apos;ll walk through your goals,
        technical constraints, and what a realistic plan looks like.
      </p>

      <ul className="space-y-3 mb-8">
        {HIGHLIGHTS.map(item => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>

      <DiscoveryCallForm />
    </div>
  );
}
