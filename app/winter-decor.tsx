import type { CSSProperties } from 'react';

const flakes = Array.from({length: 28}, (_, i) => ({
  left: `${(i * 37 + 3) % 100}%`,
  size: `${3 + (i * 7) % 6}px`,
  delay: `${-(i * 1.37) % 18}s`,
  duration: `${11 + (i * 7) % 12}s`,
  drift: `${(i % 2 ? 1 : -1) * (25 + (i * 11) % 55)}px`,
}));

export default function WinterDecor() {
  return <div className="winter-snowfall" aria-hidden="true">{flakes.map((flake, i) => <i key={i} style={{'--left':flake.left,'--size':flake.size,'--delay':flake.delay,'--duration':flake.duration,'--drift':flake.drift} as CSSProperties}/>)}</div>;
}
