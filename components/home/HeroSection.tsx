'use client';

import Particles from '@/components/Particles';
import GradientText from '@/components/GradientText';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  mounted: boolean;
  isMobile: boolean;
}

export default function HeroSection({ mounted, isMobile }: HeroSectionProps) {
  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background — neutral placeholder on server, real bg after mount */}
      {!mounted && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-background to-purple-950" />
      )}
      {mounted && !isMobile && (
        <div className="absolute inset-0 pointer-events-none">
          <Particles
            particleColors={['#4f46e5', '#7c3aed', '#06b6d4']}
            particleCount={220}
            particleSpread={10}
            speed={0.08}
            className="w-full h-full"
          />
        </div>
      )}
      {mounted && isMobile && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-background to-purple-950" />
      )}

      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-indigo-400 mb-5">
          Software Studio · Est. 2020
        </p>
        <GradientText
          as="h1"
          colors={['#4f46e5', '#7c3aed', '#06b6d4', '#4f46e5']}
          animationSpeed={10}
          showBorder={false}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-tight"
        >
          Karuna Technologies
        </GradientText>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          We design, build, and scale digital products — from bespoke web apps and mobile experiences
          to cloud infrastructure and intelligent automation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="rounded-full px-8 py-6 text-base">
            View Our Work
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-base border-white/20 hover:bg-white/5">
            Book a Discovery Call
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/40">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-muted-foreground/40 to-transparent animate-pulse" />
      </div>
    </section>
  );
}