import React, { useId } from 'react';

type StarBorderProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  /** Color of the top star blob */
  color?: string;
  /** Color of the bottom star blob. Defaults to `color` if not provided. */
  color2?: string;
  /** Duration of the visible travel animation, e.g. "4s" */
  speed?: string;
  /** Pause between each travel cycle, e.g. "2s".
   *  The blob travels for `speed`, then stays invisible for `interval`,
   *  then travels again — indefinitely, with no one-time delay. */
  interval?: string;
  thickness?: number;
};

/** Parse a CSS time string like "4s" or "500ms" into milliseconds */
function parseMs(time: string): number {
  if (time.endsWith('ms')) return parseFloat(time);
  if (time.endsWith('s'))  return parseFloat(time) * 1000;
  return 0;
}

const StarBorder = <T extends React.ElementType = 'button'>({
  as,
  className = '',
  color  = 'white',
  color2,
  speed    = '6s',
  interval = '0s',
  thickness = 3,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component  = as || 'button';
  const uid        = useId().replace(/:/g, '');
  const bottomColor = color2 ?? color;

  const speedMs    = parseMs(speed);
  const intervalMs = parseMs(interval);
  const totalMs    = speedMs + intervalMs;
  const totalS     = `${totalMs / 1000}s`;

  // What percentage of the total cycle is the active travel phase?
  const activeRatio = speedMs / totalMs;   // e.g. 4s / 6s = 0.6667
  const activePct   = +(activeRatio * 100).toFixed(4); // e.g. 66.6667

  // Each blob travels across and fades for `activePct`% of the total duration,
  // then snaps invisible and holds until the next cycle begins.
  const css = `
    @keyframes star-movement-bottom-${uid} {
      0%           { transform: translate(0%, 0%);    opacity: 1; }
      ${activePct}%  { transform: translate(-100%, 0%); opacity: 0; }
      ${activePct + 0.001}% { opacity: 0; }
      100%         { transform: translate(-100%, 0%); opacity: 0; }
    }
    @keyframes star-movement-top-${uid} {
      0%           { transform: translate(0%, 0%);   opacity: 1; }
      ${activePct}%  { transform: translate(100%, 0%); opacity: 0; }
      ${activePct + 0.001}% { opacity: 0; }
      100%         { transform: translate(100%, 0%); opacity: 0; }
    }
  `;

  const bottomAnim = `star-movement-bottom-${uid} ${totalS} linear infinite`;
  const topAnim    = `star-movement-top-${uid}    ${totalS} linear infinite`;

  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-[20px] ${className}`}
      {...(rest as any)}
      style={{ padding: `${thickness}px 0`, ...(rest as any).style }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Bottom star blob */}
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full z-0"
        style={{
          background: `radial-gradient(circle, ${bottomColor}, transparent 10%)`,
          animation: bottomAnim,
        }}
      />

      {/* Top star blob */}
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animation: topAnim,
        }}
      />

      <div className="relative z-1 bg-gradient-to-b from-black to-gray-900 border border-gray-800 text-white text-center text-[16px] py-[16px] px-[26px] rounded-[20px]">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;