import { stats } from './data';

export default function StatsRibbon() {
  return (
    <section className="border-y border-white/5 bg-white/2">
      <div className="container mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
