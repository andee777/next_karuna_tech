'use client';

import { useEffect, useState } from 'react';
import MagnetLines from '@/components/MagnetLines';
import GlassSurface from '@/components/GlassSurface';

export default function CtaSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section id="contact" className="relative border-t border-white/5 overflow-hidden bg-background">

      {/* ── MagnetLines background ────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      >
        <MagnetLines
          rows={16}
          columns={24}
          containerSize="100%"
          lineColor="oklch(from var(--color-indigo-500) l c h / 0.35)"
          lineWidth="2px"
          lineHeight="24px"
          baseAngle={-10}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* ── Content ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 py-32 container mx-auto px-6">
        <div className="max-w-3xl mx-auto" style={{ minHeight: '420px' }}>

          {/* SSR: plain shell with no GlassSurface — avoids navigator/matchMedia
              calls during render that cause the hydration mismatch.
              Client: full GlassSurface card + glass buttons after mount. */}
          {mounted ? (
            <GlassSurface
              width="100%"
              height="100%"
              borderRadius={24}
              blur={14}
              brightness={18}
              opacity={0.5}
              backgroundOpacity={0.08}
              distortionScale={-120}
              disableShadow
              redOffset={0}
              greenOffset={8}
              blueOffset={16}
              className="w-full"
              style={{ minHeight: '420px' }}
            >
              {/* Text content */}
              <div className="w-full px-8 py-20 text-center flex flex-col items-center">
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-indigo-400 mb-4">
                  Let's Build Together
                </p>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-5">
                  Ready to start your project?
                </h2>
                <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                  Tell us what you're building — we'll respond within 48 hours with a tailored plan and honest estimate.
                </p>

                {/* Native CSS glass pills — GlassSurface requires explicit px dimensions
                    and breaks with auto sizing; backdrop-filter works correctly here */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="#"
                    className="cursor-pointer px-8 py-3 text-base font-semibold text-foreground whitespace-nowrap rounded-full"
                    style={{
                      backdropFilter: 'blur(16px) saturate(1.8) brightness(1.15)',
                      WebkitBackdropFilter: 'blur(16px) saturate(1.8) brightness(1.15)',
                      background: 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.25)',
                    }}
                  >
                    Start a Conversation
                  </a>

                  <a
                    href="mailto:info@karunatech.ca"
                    className="cursor-pointer px-8 py-3 text-base text-foreground/80 whitespace-nowrap rounded-full"
                    style={{
                      backdropFilter: 'blur(16px) saturate(1.8) brightness(1.1)',
                      WebkitBackdropFilter: 'blur(16px) saturate(1.8) brightness(1.1)',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    info@karunatech.ca
                  </a>
                </div>
              </div>
            </GlassSurface>
          ) : (
            /* SSR fallback: identical content, zero GlassSurface instances */
            <div className="w-full rounded-3xl" style={{ minHeight: '420px' }}>
              <div className="w-full px-8 py-20 text-center flex flex-col items-center">
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-indigo-400 mb-4">
                  Let's Build Together
                </p>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-5">
                  Ready to start your project?
                </h2>
                <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                  Tell us what you're building — we'll respond within 48 hours with a tailored plan and honest estimate.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="#" className="cursor-pointer px-8 py-3 text-base font-semibold text-foreground rounded-full border border-white/20">
                    Start a Conversation
                  </a>
                  <a href="mailto:info@karunatech.ca" className="cursor-pointer px-8 py-3 text-base text-foreground/80 rounded-full border border-white/10">
                    info@karunatech.ca
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}