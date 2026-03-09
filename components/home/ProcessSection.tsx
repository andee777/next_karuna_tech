import { processSteps } from './data';

export default function ProcessSection() {
  return (
    <section id="process" className="py-32 bg-white/2 border-y border-white/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-indigo-400 mb-3">
            How We Work
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-5">Our Process</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            A transparent, structured approach that keeps you informed at every stage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          {processSteps.map(({ step, title, description }) => (
            <div key={step} className="relative text-center">
              <div className="w-14 h-14 rounded-full border border-indigo-500/40 bg-indigo-500/10 flex items-center justify-center mx-auto mb-6 relative z-10">
                <span className="text-sm font-bold text-indigo-400">{step}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
