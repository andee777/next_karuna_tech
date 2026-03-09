'use client';

import TiltedCard from '@/components/TiltedCard';
import { featuredProjects } from './data';

const projectImages: Record<string, string> = {
  'car rental': 'https://images.unsplash.com/photo-1685091955352-4bb8796aef12',
  'spa': 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2',
  'food ordering': 'https://images.unsplash.com/photo-1615495504323-13bc487d9c9f',
  'hydroponic': 'https://images.unsplash.com/photo-1667509860948-46d20f127b43',
};

function getImageSrc(title: string) {
  const key = Object.keys(projectImages).find(k => title.toLowerCase().includes(k));
  return key ? `${projectImages[key]}?auto=format&fit=crop&w=480&h=360` : '';
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
            Real outcomes for real businesses — a selection of what we've shipped.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 place-items-center">
          {featuredProjects.map(({ title, description, tech, result }) => (
            <TiltedCard
              key={title}
              imageSrc={getImageSrc(title)}
              altText={title}
              captionText={title}
              containerHeight="500px"
              containerWidth="640px"
              imageHeight="500px"
              imageWidth="640px"
              rotateAmplitude={12}
              scaleOnHover={1.05}
              showMobileWarning={false}
              showTooltip
              displayOverlayContent
              overlayContent={
                <div className="w-[640px] h-[500px] rounded-[15px] p-7 flex flex-col justify-between bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                  {/* Top: result badge */}
                  <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-medium backdrop-blur-sm">
                    {result}
                  </div>

                  {/* Bottom: text content */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                    <p className="text-white/70 text-sm leading-relaxed mb-4">{description}</p>
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
          ))}
        </div>
      </div>
    </section>
  );
}