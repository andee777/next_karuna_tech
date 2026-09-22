'use client';

import TiltedCard from '@/components/TiltedCard';
import { featuredProjects } from './data';

// ─── On-brand cover art ─────────────────────────────────────────────────────────
// Generated SVG gradients instead of stock photography — keeps every card in the
// site's indigo/purple/cyan palette and reuses visual motifs already used
// elsewhere on the page (HeroSection's soft glow blobs, ServicesSection's faint
// grid) instead of introducing unrelated, inconsistently-lit Unsplash photos.

interface CoverArtSpec {
  from: string;
  to: string;
  angle: number;
  glowX: number;
  glowY: number;
}

const COVER_ART: CoverArtSpec[] = [
  { from: '#4f46e5', to: '#7c3aed', angle: 135, glowX: 480, glowY: 120 },
  { from: '#7c3aed', to: '#06b6d4', angle: 205, glowX: 150, glowY: 380 },
  { from: '#06b6d4', to: '#4f46e5', angle: 60, glowX: 500, glowY: 400 },
  { from: '#4338ca', to: '#7c3aed', angle: 300, glowX: 140, glowY: 90 },
];

function buildCoverArt({ from, to, angle, glowX, glowY }: CoverArtSpec, index: number): string {
  const svg = `
    <svg width="640" height="500" viewBox="0 0 640 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" gradientTransform="rotate(${angle} 0.5 0.5)">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.07" stroke-width="1" />
        </pattern>
      </defs>
      <rect width="640" height="500" fill="url(#bg)" />
      <rect width="640" height="500" fill="url(#grid)" />
      <circle cx="${glowX}" cy="${glowY}" r="240" fill="url(#glow)" />
      <text x="608" y="455" font-family="Arial, Helvetica, sans-serif" font-size="200" font-weight="800"
        fill="#ffffff" fill-opacity="0.08" text-anchor="end">${String(index + 1).padStart(2, '0')}</text>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 place-items-center">
          {featuredProjects.map(({ title, description, tech, result }, index) => (
            // Sized by the grid column (w-full) with a fixed 640:500 aspect ratio,
            // capped at the card's native 640px — so TiltedCard never forces a
            // fixed pixel width wider than its column, on any breakpoint.
            <div
              key={title}
              className="group relative w-full max-w-[640px] overflow-hidden rounded-2xl ring-1 ring-white/8 transition-shadow duration-300 hover:ring-indigo-500/40 hover:shadow-[0_0_40px_-12px_rgba(79,70,229,0.35)]"
              style={{ aspectRatio: '640 / 500' }}
            >
              <TiltedCard
                imageSrc={buildCoverArt(COVER_ART[index % COVER_ART.length], index)}
                altText={title}
                captionText={title}
                containerHeight="100%"
                containerWidth="100%"
                imageHeight="100%"
                imageWidth="100%"
                rotateAmplitude={8}
                scaleOnHover={1.03}
                showMobileWarning={false}
                showTooltip
                displayOverlayContent
                overlayContent={
                  <div className="w-full h-full rounded-2xl p-5 sm:p-8 flex flex-col justify-between bg-gradient-to-t from-black/85 via-black/25 to-transparent">
                    {/* Top: result badge */}
                    <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-medium backdrop-blur-sm">
                      {result}
                    </div>

                    {/* Bottom: text content */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{title}</h3>
                      <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-4 max-w-md">{description}</p>
                      <div className="flex flex-wrap gap-2">
                        {tech.map(t => (
                          <span
                            key={t}
                            className="text-xs px-2.5 py-1 rounded-md bg-white/10 text-white/80 border border-white/10 backdrop-blur-sm"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
