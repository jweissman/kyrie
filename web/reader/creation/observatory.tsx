import { useRef, type CSSProperties } from 'react';
import type { Catalog } from '../../engine/protocol';

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
  static readonly cx = 980;
  static readonly cy = 2050;
  static readonly r = 1640;
  static readonly field = 420;
  static View({ signs, focus, chosen, flare, onFocus, onChoose }: { signs: Sign[]; focus?: string; chosen?: string;
    flare?: string; onFocus: (id: string) => void; onChoose: (id: string) => void }) {
    const turned = useRef(0), at = Math.max(0, signs.findIndex(s => s.id === focus)), step = 360 / Math.max(1, signs.length);
    // The nearest way round to the sign: the ring never spins the long way past eleven months.
    const want = -at * step, now = turned.current;
    turned.current = now + ((((want - now) % 360) + 540) % 360) - 180;
    const { cx, cy } = Observatory;
    return (
      <div className="observatory" aria-hidden="true">
        <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" focusable="false">
          <defs>
            <radialGradient id="obs-haze" cx="62%" cy="38%" r="70%">
              <stop offset="0" stopColor="#1b2134" /><stop offset=".55" stopColor="#0d1019" /><stop offset="1" stopColor="#07080c" />
            </radialGradient>
            <filter id="obs-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <rect width="1600" height="1000" fill="url(#obs-haze)" />
          <g className="obs-far">{Observatory.far.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>
          <g className="obs-ring" style={{ '--turn': `${turned.current}deg`, transformOrigin: `${cx}px ${cy}px` } as CSSProperties}>
            <circle className="obs-arc" cx={cx} cy={cy} r={Observatory.r} />
            <g className="obs-near">{Observatory.near.map(([a, d, r], i) => <circle key={i} r={r}
              cx={cx + Math.sin(a) * d} cy={cy - Math.cos(a) * d} />)}</g>
            {signs.map((s, i) => <Observatory.Figure key={s.id} sign={s} angle={i * step} lit={s.id === focus}
              chosen={s.id === chosen} flare={s.id === flare} onFocus={onFocus} onChoose={onChoose} />)}
          </g>
        </svg>
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
        {sign.lines.map(([a, b], i) => <line key={i} x1={p(a!)[0]} y1={p(a!)[1]} x2={p(b!)[0]} y2={p(b!)[1]} />)}
        {sign.stars.map((s, i) => <circle key={i} className={`obs-star b${s[2] ?? 1}`} cx={p(i)[0]} cy={p(i)[1]}
          r={1.6 + (s[2] ?? 1) * 1.6} />)}
        <text className="obs-name" y={Observatory.foot(sign) * field + 46} textAnchor="middle">
          {sign.name.replace(/^the /i, '')}</text>
      </g>
    );
  }
  // How far below the field's middle its lowest star stands, as a fraction of the field (its name goes beneath).
  static foot(sign: Sign): number { return Math.max(...sign.stars.map(x => x[1] ?? .5)) - .5; }
  // The far stars, still behind the turning ring; and the near ones on it, turning with the signs (by a fixed rule, the
  // same every time: [x, y, r] and [angle, distance, r]).
  static readonly far: [number, number, number][] = Array.from({ length: 150 }, (_, i) =>
    [(i * 977 + 131) % 1600, (i * 563 + 71) % 1000, i % 11 === 0 ? 1.3 : .7]);
  static readonly near: [number, number, number][] = Array.from({ length: 260 }, (_, i) =>
    [(i * 137.508 * Math.PI) / 180, 1180 + ((i * 7919) % 900), i % 9 === 0 ? 1.9 : i % 3 === 0 ? 1.2 : .8]);
}
