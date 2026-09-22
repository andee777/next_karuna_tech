'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import StarBorder from '@/components/StarBorder';
import { ThemeToggle } from '../theme-toggle';

const NAV_LINKS = ['Services', 'Work', 'Process', 'Contact'] as const;

// ─── Logo mark ────────────────────────────────────────────────────────────────

function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="slash-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="55%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {/* Left forward slash */}
      <rect x="5" y="2" width="10" height="36" rx="3" fill="url(#slash-grad)" transform="rotate(15 20 20)" />
      {/* Right forward slash */}
      <rect x="21" y="2" width="10" height="36" rx="3" fill="url(#slash-grad)" transform="rotate(15 36 20)" />
    </svg>
  );
}

// ─── Full wordmark ────────────────────────────────────────────────────────────

function LogoFull() {
  return (
    <span className="flex items-center gap-3 select-none">
      <LogoMark size={34} />
      <span className="flex flex-col leading-0 gap-0.5">
        <span className="text-lg font-black tracking-tight text-black dark:text-white">karuna</span>
        <span className="text-lg -mt-3 font-black tracking-tight text-black dark:text-white">technologies</span>
      </span>
    </span>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setPastHero(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile menu on route-anchor navigation and on viewport resize past the md breakpoint.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">

        {/* ── Logo (left) ──────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center" aria-label="Karuna Technologies — home">
          {/* Icon-only while in hero, full wordmark once past it */}
          <span
            className="transition-all duration-500"
            style={{
              opacity: pastHero ? 0 : 1,
              position: pastHero ? 'absolute' : 'relative',
              pointerEvents: pastHero ? 'none' : 'auto',
            }}
          >
            <LogoMark size={34} />
          </span>
          <span
            className="transition-all duration-500"
            style={{
              opacity: pastHero ? 1 : 0,
              position: pastHero ? 'relative' : 'absolute',
              pointerEvents: pastHero ? 'auto' : 'none',
            }}
          >
            <LogoFull />
          </span>
        </Link>

        {/* ── Nav links + CTA (right) ───────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-8 text-sm text-muted-foreground">
            {NAV_LINKS.map(item => (
              <a
                key={item}
                href={`/#${item.toLowerCase()}`}
                className="hover:text-foreground transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </nav>
          <ThemeToggle/>
          {/* StarBorder CTA — [&>div:last-child] overrides the hardcoded inner padding */}
          <StarBorder
            as={Link}
            href="/new-project"
            color="#7c3aed"
            color2="#7c3aed"
            speed="2s"
            interval='5s'
            // thickness={2}
            className="[&>div:last-child]:py-2 [&>div:last-child]:px-4 [&>div:last-child]:text-xs [&>div:last-child]:font-semibold [&>div:last-child]:rounded-[20px]"
          >
            Start a Project →
          </StarBorder>
        </div>

        {/* ── Mobile controls (right) ─────────────────────────────────────────── */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen(open => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="flex items-center justify-center h-9 w-9 rounded-full text-foreground hover:bg-white/5 transition-colors"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* ── Mobile menu panel ───────────────────────────────────────────────── */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden border-t border-white/5 bg-background/95 backdrop-blur-md transition-[max-height] duration-300 ease-in-out ${
          menuOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <nav className="flex flex-col px-6 py-6 gap-1">
          {NAV_LINKS.map(item => (
            <a
              key={item}
              href={`/#${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-base text-muted-foreground hover:text-foreground transition-colors duration-200 border-b border-white/5 last:border-b-0"
            >
              {item}
            </a>
          ))}
          <Link
            href="/new-project"
            onClick={() => setMenuOpen(false)}
            className="mt-5 w-full text-center rounded-full bg-indigo-600 text-white text-sm font-semibold py-3 hover:bg-indigo-500 transition-colors"
          >
            Start a Project →
          </Link>
        </nav>
      </div>
    </header>
  );
}