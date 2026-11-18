import { useRef, type CSSProperties, type MouseEvent } from 'react';
import type { Catalog } from '../../engine/protocol';
import { SkyCanvas } from './sky-canvas';
import { SkyTexture } from './sky-texture';

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
  // What of the sky is in view: all of it on a wide screen, the constellation at the left beside the rows; on a tall
  // one, a wider field set by the screen's foot, the constellation drawn whole and smaller, low, under the rows and
  // above the foot (M22's review: on a phone the lit sign had been off the left of the screen, a single line of it
  // showing; OR-17: a figure filling its field had then reached up into the rows).
  static view(): { box: string; align: string } {
    const tall = typeof innerWidth === 'number' && innerHeight > innerWidth * 1.2;
    return tall ? { box: `${Observatory.cx - 594} -1204 1188 2200`, align: 'xMidYMax slice' }
      : { box: '0 0 1600 1000', align: 'xMidYMid slice' };
  }
  // The whole ring in view, at the left of the page beside the rows, below the question.
  static wheel(): { box: string; align: string } {
    const { cx, cy, r, field } = Observatory, m = field * .75, size = 2 * (r + m);
    return { box: `${cx - r - m} ${cy - r - m - size * .14} ${size * 2.1} ${size * 1.14}`, align: 'xMinYMid meet' };
  }
  // How far the far field slides as the ring turns a degree (a sign is thirty: over a third of what is in sight).
  static readonly pan = 18;
  // whole: the twelve at once round the still ring, each where it always stands, the one considered lit (the owner,
  // 17 November, FM-02: all twelve signs at once, the zodiac and its rows in step; a fixed set's instrument).
  // zoom: whole, the sign whose row the hand or the keys are on, drawn up large where the wheel stands (OR-78).
  // onOut: a touch on the open sky while a sign is drawn up lets the wheel go (OR-89).
  static View({ signs, focus, chosen, flare, onFocus, onChoose, whole, zoom, onOut }: { signs: Sign[]; focus?: string;
    chosen?: string; flare?: string; onFocus: (id: string) => void; onChoose: (id: string) => void; whole?: boolean;
    zoom?: string; onOut?: () => void }) {
    const turned = useRef(0), at = Math.max(0, signs.findIndex(s => s.id === focus)), step = 360 / Math.max(1, signs.length);
    // The nearest way round to the sign: the ring never spins the long way past eleven months; whole, it stands still.
    const want = whole ? 0 : -at * step, now = turned.current;
    turned.current = whole ? 0 : now + ((((want - now) % 360) + 540) % 360) - 180;
    const { cx, cy } = Observatory, pan = turned.current * Observatory.pan;
    const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const view = whole ? Observatory.wheel() : Observatory.view();
    const near = whole && zoom ? signs.findIndex(s => s.id === zoom) : -1;
    const lens = near >= 0 ? Observatory.lens(signs[near]!, near * step) : 'none';
    return (
      <div className={`observatory${whole ? ' whole' : ''}${near >= 0 ? ' zoomed' : ''}`} aria-hidden="true"
        data-zoom={near >= 0 ? zoom : ''} onClick={near >= 0 && onOut ? Observatory.open.bind(null, onOut) : undefined}>
        <SkyCanvas.View pan={pan} still={still} />
        <svg viewBox={view.box} preserveAspectRatio={view.align} focusable="false">
          <Observatory.Defs />
          <g className="obs-lens" style={{ transform: lens }}>
          <g className="obs-turned" style={{ '--turn': `${turned.current}deg` } as CSSProperties}>
          <g className="obs-ring" style={{ transformOrigin: `${cx}px ${cy}px` }}>
            <circle className="obs-arc" cx={cx} cy={cy} r={Observatory.r} />
            {signs.map((s, i) => <Observatory.Figure key={s.id} sign={s} angle={i * step} lit={s.id === focus}
              chosen={s.id === chosen} flare={s.id === flare} onFocus={onFocus} onChoose={onChoose} upright={whole} />)}
          </g>
          </g>
          </g>
        </svg>
        <i className="obs-meteor a" /><i className="obs-meteor b" />
      </div>
    );
  }
  // A touch on the sky that is not on a sign.
  private static open(out: () => void, e: MouseEvent) {
    if (!(e.target instanceof Element && e.target.closest('.obs-sign'))) { out(); }
  }
  // The still wheel drawn up to one sign (the owner, 18 November, OR-78: "just zoom in the sky to the constellation if
  // we hover over the menu action item for that sign"): the sky's units moved and scaled so that the sign stands where
  // the wheel's middle is, about two thirds of the wheel across, its stars and lines plain; on a narrow screen, where the
  // rows cover the wheel, in the band between the rows and the foot, as large as that band allows. A transform of the
  // sky's units, as the ring is turned, eased by creation.css and cut for one who asks for less motion.
  static lens(sign: Sign, angle: number): string {
    const { cx, cy, r, field } = Observatory, [bx, by, bw, bh] = Observatory.wheel().box.split(' ').map(Number) as
      [number, number, number, number];
    const w = innerWidth, h = innerHeight, unit = Math.min(w / bw, h / bh), top = (h - bh * unit) / 2;
    const a = angle * Math.PI / 180, sx = cx + r * Math.sin(a), sy = cy - r * Math.cos(a) + field * .06;
    let tx = cx, ty = cy, size = Math.min(2 * r * unit * .66, h * .55);
    if (w <= 760) {
      const below = document.querySelector('.composed-rows')?.getBoundingClientRect().bottom ?? h * .7;
      const band = Math.max(80, h - 96 - below);
      size = Math.min(w * .62, band * .95);
      tx = bx + w / 2 / unit;
      ty = by + (below + band / 2 - top) / unit;
    }
    const k = size / (field * unit);
    return `translate(${tx}px, ${ty}px) scale(${k}) translate(${-sx}px, ${-sy}px)`;
  }
  // A halo for each colour a star may be: a soft light of its own tint about it, fading to nothing.
  static Defs() {
    return (
      <defs>
        {SkyTexture.stars.map((c, t) => <radialGradient key={t} id={`obs-halo-${t}`}>
          <stop offset="0" stopColor={`rgb(${c.join(',')})`} stopOpacity=".55" />
          <stop offset=".25" stopColor={`rgb(${c.join(',')})`} stopOpacity=".16" />
          <stop offset="1" stopColor={`rgb(${c.join(',')})`} stopOpacity="0" /></radialGradient>)}
      </defs>
    );
  }
  // One constellation at its place on the ring, upright at the top of it, as a star atlas draws one (OR-17): the figure
  // it is named for engraved faintly about its stars, the lines that join them, then its stars by magnitude and colour.
  // upright: stood upright where it stands on the ring (the still wheel), not turned with it.
  static Figure({ sign, angle, lit, chosen, flare, onFocus, onChoose, upright }: { sign: Sign; angle: number;
    lit: boolean; chosen: boolean; flare: boolean; onFocus: (id: string) => void; onChoose: (id: string) => void;
    upright?: boolean }) {
    const { cx, cy, r, field } = Observatory, star = (k: number) => sign.stars[k] ?? [0, 0, 1];
    const p = (k: number) => [(star(k)[0]! - .5) * field, (star(k)[1]! - .5) * field] as const;
    const cls = ['obs-sign', lit ? 'lit' : '', chosen ? 'chosen' : '', flare ? 'flare' : ''].filter(Boolean).join(' ');
    return (
      <g className={cls} data-sign={sign.id}
        transform={`rotate(${angle} ${cx} ${cy}) translate(${cx} ${cy - r})${upright ? ` rotate(${-angle})` : ''}`}
        onMouseEnter={() => onFocus(sign.id)} onClick={() => onChoose(sign.id)}>
        <circle className="obs-hit" r={field * .62} />
        {sign.figure && <path className="obs-figure" d={sign.figure}
          transform={`translate(${-field / 2} ${-field / 2}) scale(${field / 100})`} />}
        {sign.lines.map(([a, b], i) => <Observatory.Link key={i} from={p(a!)} to={p(b!)}
          gap={[Observatory.radius(star(a!)[2]), Observatory.radius(star(b!)[2])]} />)}
        {sign.stars.map((s, i) => <Observatory.Star key={i} at={p(i)} magnitude={s[2]} tint={s[3]} />)}
        <text className="obs-name" y={Observatory.foot(sign) * field + 46} textAnchor="middle">
          {sign.name.replace(/^the /i, '')}</text>
      </g>
    );
  }
  // A star as an atlas marks one: a disc by its magnitude in its own colour (blue-white to orange, SkyTexture.stars),
  // the brighter in a halo of that colour, the brightest of a sign with fine tapering rays.
  static Star({ at, magnitude = 1, tint = 3 }: { at: readonly [number, number]; magnitude?: number; tint?: number }) {
    const m = Math.min(4, Math.max(1, magnitude)), r = Observatory.radius(m), t = Math.min(6, Math.max(0, tint));
    const ray = (x: number, y: number) => `M${-x} ${-y}L${y * .09} ${-x * .09}L${x} ${y}L${-y * .09} ${x * .09}Z`;
    return (
      <g className={`obs-star b${m}`} transform={`translate(${at[0]} ${at[1]})`}
        style={{ color: `rgb(${SkyTexture.stars[t]!.join(',')})` }}>
        {m > 1 && <circle className="obs-halo" r={r * (m + 2)} fill={`url(#obs-halo-${t})`} />}
        {m > 3 && <path className="obs-rays" d={`${ray(r * 6, 0)}${ray(0, r * 4.2)}`} />}
        <circle className="obs-core" r={r} />
      </g>
    );
  }
  // A star's size by its magnitude (1 faint to 4, a sign's brightest): plainly different, so that a figure reads by its
  // bright stars and the faint ones fill it out.
  static radius(magnitude = 1): number { return [0, 1.7, 2.7, 3.9, 5.2][Math.min(4, Math.max(1, magnitude))]!; }
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
