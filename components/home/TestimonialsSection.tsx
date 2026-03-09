import { testimonials } from './data';

export default function TestimonialsSection() {
  return (
    <section className="py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-indigo-400 mb-3">
            Client Stories
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-5">What Clients Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ quote, author, role, initial }) => (
            <div key={author} className="rounded-2xl border border-white/8 bg-white/3 p-8 flex flex-col gap-6">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm flex-1">"{quote}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-semibold text-white shrink-0">
                  {initial}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{author}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
