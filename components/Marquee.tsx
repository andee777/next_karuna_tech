"use client";

interface MarqueeProps {
  items: string[];
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  separator?: string;
  className?: string;
  itemClassName?: string;
}

export function Marquee({
  items,
  direction = "left",
  speed = "normal",
  separator = "·",
  className = "",
  itemClassName = "",
}: MarqueeProps) {
  const speedMap = {
    slow: direction === "left" ? "animate-marquee-left-slow" : "animate-marquee-right",
    normal: direction === "left" ? "animate-marquee-left" : "animate-marquee-right",
    fast: direction === "left" ? "animate-marquee-left" : "animate-marquee-right",
  };

  // Duplicate items for seamless looping
  const doubled = [...items, ...items];

  return (
    <div className={`overflow-hidden w-full ${className}`}>
      <div
        className={`flex items-center gap-0 ${speedMap[speed]}`}
        style={{ width: "max-content" }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className={`px-4 text-xs font-bold tracking-[0.15em] uppercase ${itemClassName}`}>
              {item}
            </span>
            {separator && (
              <span className={`opacity-30 ${itemClassName}`}>{separator}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
