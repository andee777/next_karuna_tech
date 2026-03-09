'use client';

import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import HeroSection from '@/components/home/HeroSection';
import StatsRibbon from '@/components/home/StatsRibbon';
import ServicesSection from '@/components/home/ServicesSection';
import WorkSection from '@/components/home/WorkSection';
import ProcessSection from '@/components/home/ProcessSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CtaSection from '@/components/home/CtaSection';


export default function HomePage() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  /**
   * Guard all isMobile-conditional renders behind `mounted` so the
   * server-rendered HTML always matches the initial client render,
   * preventing React hydration mismatches.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="relative bg-background text-foreground font-sans">
      <HeroSection mounted={mounted} isMobile={isMobile} />
      <StatsRibbon />
      <ServicesSection mounted={mounted} isMobile={isMobile} />
      <WorkSection />
      <ProcessSection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  );
}