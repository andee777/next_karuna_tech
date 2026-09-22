'use client';

import { useRef } from 'react';
import SplashCursor from '@/components/SplashCursor';
import { services } from './data';

interface ServicesSectionProps {
  mounted: boolean;
  isMobile: boolean;
}

export default function ServicesSection({ mounted, isMobile }: ServicesSectionProps) {
  // Pass this ref to SplashCursor so it listens on the section element.
  // This means mouse events fire even when the cursor is over child divs
  // (cards, headings, etc.) that sit above the canvas in the stacking order.
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} id="services" className="relative py-32 overflow-hidden">
      {/* SplashCursor — only mounted on client, scoped to this section.
          containerRef={sectionRef} routes all mouse/touch events through the section
          element so the effect is not blocked by the z-10 content layer above the
          canvas. Resolution is lowered on mobile to keep the fluid sim cheap on
          weaker GPUs; touch drag drives it there instead of mouse move. */}
      {mounted && (
        <SplashCursor
          scoped
          containerRef={sectionRef}
          SPLAT_RADIUS={0.25}
          DENSITY_DISSIPATION={4}
          VELOCITY_DISSIPATION={2.5}
          BACK_COLOR={{ r: 0, g: 0, b: 0 }}
          TRANSPARENT
          SIM_RESOLUTION={isMobile ? 64 : 128}
          DYE_RESOLUTION={isMobile ? 640 : 1440}
        />
      )}

      {/* Faint grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-3"
        style={{
          backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 container mx-auto px-6">
        <div className="text-center mb-20">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-indigo-400 mb-3">
            What We Do
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-5">Our Services</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            End-to-end digital solutions built for scale — move your cursor around to explore.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map(({ title, description, icon, tags }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-white/8 bg-white/3 p-8 hover:border-indigo-500/40 hover:bg-white/6 transition-all duration-300"
            >
              <div className="text-3xl mb-5 opacity-80">{icon}</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-5">{description}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}