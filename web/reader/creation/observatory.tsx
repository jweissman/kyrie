import { useRef, type CSSProperties } from 'react';
import type { Catalog } from '../../engine/protocol';
import { SkyCanvas } from './sky-canvas';

type Sign = Catalog['signs'][number];

// The sky you were born under, as an observatory sees it (the owner, 14 and 15 November, TO-04: a starfield whose
// constellations answer focus). Imbar's twelve signs stand round one great ring of the sky, a month apart, each drawn
// from its own stars and lines (data/imbar/sky.json); the ring turns, over most of a second, to bring the sign the hand
// or the keys are on to the top of the dome, where it is lit and the rest are dim. The rows beside it answer at once;
// the sky follows them, never the other way. It decides nothing: which signs there are and what choosing one settles
// are the engine's (CreationFlow), and a sign chosen in the sky is chosen by the same row's act.
// focus: the sign considered; chosen: the one taken; flare: the one just committed, lit for a moment.
export class Observatory {
  // The ring's centre and radius in the sky's units (1600 by 1000), and the size of a constellation's field.
  static readonly cx = 470;
  static readonly cy = 2050;
  static readonly r = 1640;
  static readonly field = 440;
  // How far the far field slides as the ring turns a degree (a sign is thirty: over a third of what is in sight).
  static readonly pan = 18;
  static View({ signs, focus, chosen, flare, onFocus, onChoose }: { signs: Sign[]; focus?: string; chosen?: string;
    flare?: string; onFocus: (id: string) => void; onChoose: (id: string) => void }) {
    const turned = useRef(0), at = Math.max(0, signs.findIndex(s => s.id === focus)), step = 360 / Math.max(1, signs.length);
    // The nearest way round to the sign: the ring never spins the long way past eleven months.
    const want = -at * step, now = turned.current;
    turned.current = now + ((((want - now) % 360) + 540) % 360) - 180;
    const { cx, cy } = Observatory, pan = turned.current * Observatory.pan;
    const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    return (
      <div className="observatory" aria-hidden="true">
        <SkyCanvas.View pan={pan} still={still} />
        <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" focusable="false">
          <defs>
            <filter id="obs-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <g className="obs-turned" style={{ '--turn': `${turned.current}deg` } as CSSProperties}>
          <g className="obs-ring" style={{ transformOrigin: `${cx}px ${cy}px` }}>
            <circle className="obs-arc" cx={cx} cy={cy} r={Observatory.r} />
            {signs.map((s, i) => <Observatory.Figure key={s.id} sign={s} angle={i * step} lit={s.id === focus}
              chosen={s.id === chosen} flare={s.id === flare} onFocus={onFocus} onChoose={onChoose} />)}
          </g>
          </g>
        </svg>
        <i className="obs-meteor a" /><i className="obs-meteor b" />
      </div>
    );
  }
  // One constellation at its place on the ring, upright at the top of it: its lines, then its stars by brightness.
  static Figure({ sign, angle, lit, chosen, flare, onFocus, onChoose }: { sign: Sign; angle: number; lit: boolean;
    chosen: boolean; flare: boolean; onFocus: (id: string) => void; onChoose: (id: string) => void }) {
    const { cx, cy, r, field } = Observatory, star = (k: number) => sign.stars[k] ?? [0, 0, 1];
    const p = (k: number) => [(star(k)[0]! - .5) * field, (star(k)[1]! - .5) * field] as const;
    const cls = ['obs-sign', lit ? 'lit' : '', chosen ? 'chosen' : '', flare ? 'flare' : ''].filter(Boolean).join(' ');
    return (
      <g className={cls} data-sign={sign.id} transform={`rotate(${angle} ${cx} ${cy}) translate(${cx} ${cy - r})`}
        onMouseEnter={() => onFocus(sign.id)} onClick={() => onChoose(sign.id)}>
        <circle className="obs-hit" r={field * .62} />
        {sign.lines.map(([a, b], i) => <Observatory.Link key={i} from={p(a!)} to={p(b!)}
          gap={[Observatory.radius(star(a!)[2]), Observatory.radius(star(b!)[2])]} />)}
        {sign.stars.map((s, i) => <circle key={i} className={`obs-star b${s[2] ?? 1}`} cx={p(i)[0]} cy={p(i)[1]}
          r={Observatory.radius(s[2])} />)}
        <text className="obs-name" y={Observatory.foot(sign) * field + 46} textAnchor="middle">
          {sign.name.replace(/^the /i, '')}</text>
      </g>
    );
  }
  // A star's size by its magnitude (1 faint to 3 bright): plainly different, so that a figure reads by its bright stars.
  static radius(magnitude = 1): number { return [0, 2.2, 3.8, 5.6][Math.min(3, Math.max(1, magnitude))]!; }
  // A line of a figure, from star to star but never into them: it stops a little short of each, as a drawn constellation
  // does, so that the stars stand clear of the figure they make.
  static Link({ from, to, gap }: { from: readonly [number, number]; to: readonly [number, number];
    gap: readonly [number, number] }) {
    const dx = to[0] - from[0], dy = to[1] - from[1], len = Math.hypot(dx, dy) || 1, a = gap[0] + 4, b = gap[1] + 4;
    return <line pathLength="1" x1={from[0] + dx / len * a} y1={from[1] + dy / len * a} x2={to[0] - dx / len * b} y2={to[1] - dy / len * b} />;
  }
  // How far below the field's middle its lowest star stands, as a fraction of the field (its name goes beneath).
  static foot(sign: Sign): number { return Math.max(...sign.stars.map(x => x[1] ?? .5)) - .5; }
}
