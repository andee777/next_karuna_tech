import { TrendingUp } from 'lucide-react';
import { featuredProjects } from './data';

// ─── Per-project accent ─────────────────────────────────────────────────────────
// A single restrained accent color per case study (used as a soft corner glow +
// eyebrow label color) instead of a loud full-bleed gradient — keeps each card
// on-brand without fighting the rest of the page's dark, neutral card language
// (`border-white/8 bg-white/3`, used by ServicesSection/TestimonialsSection).

interface ProjectMeta {
  glow: string;
  textClass: string;
  eyebrow: string;
}

const PROJECT_META: ProjectMeta[] = [
  { glow: '#4f46e5', textClass: 'text-indigo-400', eyebrow: 'Fleet & Logistics' },
  { glow: '#06b6d4', textClass: 'text-cyan-400', eyebrow: 'AgTech / IoT' },
  { glow: '#7c3aed', textClass: 'text-purple-400', eyebrow: 'Wellness & Booking' },
  { glow: '#4f46e5', textClass: 'text-indigo-400', eyebrow: 'Food & Hospitality' },
];

export default function WorkSection() {
  return (
    <section id="work" className="py-32 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-indigo-400 mb-3">
            Case Studies
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-5">Featured Work</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Real outcomes for real businesses — a selection of what we&apos;ve shipped.
          </p>
        </div>

        <div className="max-w-5xl mx-auto divide-y divide-white/5 border-y border-white/5">
          {featuredProjects.map(({ title, description, tech, result }, index) => {
            const { glow, textClass, eyebrow } = PROJECT_META[index % PROJECT_META.length];
            const reversed = index % 2 === 1;

            return (
              <div
                key={title}
                className={`group flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16 py-14 md:py-20`}
              >
                {/* Visual panel */}
                <div className="relative w-full md:w-1/2 aspect-[4/3] shrink-0 rounded-2xl overflow-hidden border border-white/8 bg-white/[0.02] transition-colors duration-300 group-hover:border-white/15">
                  <div
                    className="absolute -top-20 -right-10 w-72 h-72 rounded-full blur-[90px] opacity-20 transition-opacity duration-500 group-hover:opacity-35"
                    style={{ background: glow }}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                      backgroundSize: '32px 32px',
                    }}
                    aria-hidden="true"
                  />
                  <span
                    className="absolute -bottom-8 right-2 text-[8.5rem] leading-none font-black text-white/[0.05] select-none"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="absolute top-5 left-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-medium backdrop-blur-sm">
                    <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                    {result}
                  </div>
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2">
                  <p className={`text-xs font-semibold tracking-[0.2em] uppercase mb-3 ${textClass}`}>
                    {eyebrow}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{description}</p>
                  <div className="flex flex-wrap gap-2">
                    {tech.map(t => (
                      <span
                        key={t}
                        className="text-xs px-3 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/10"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
