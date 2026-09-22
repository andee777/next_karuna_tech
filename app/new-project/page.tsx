import type { Metadata } from 'next';
import ProjectForm from './ProjectForm';
import DiscoveryCallSection from './DiscoveryCallSection';

export const metadata: Metadata = {
  title: 'Start a New Project',
  description:
    'Tell us about your project — web design, hosting, automation, or a mobile app — and we will respond within 48 hours with a tailored plan and honest estimate.',
  alternates: { canonical: '/new-project' },
};

export default function NewProjectPage() {
  return (
    <section className="relative pt-40 pb-32 overflow-hidden">
      {/* Radial glow — matches the background treatment used on the homepage hero */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-indigo-400 mb-4">
            Let&apos;s Build Together
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            Start a New Project
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Tell us what you&apos;re building — we&apos;ll respond within 48 hours with a
            tailored plan and honest estimate.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-3 rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-10">
            <ProjectForm />
          </div>
          <div className="lg:col-span-2">
            <DiscoveryCallSection />
          </div>
        </div>
      </div>
    </section>
  );
}
