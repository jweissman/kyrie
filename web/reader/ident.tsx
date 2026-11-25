import type { CSSProperties } from 'react';
import { Identity } from '../../src/presentation/identity';

// The studio's mark, once a session before the title, a few seconds long. A horizon is drawn from the middle outward;
// seven towers rise from it in light, the tallest first (the City of Seven Towers), each finished by a fine spire; a
// lamp is lit on each lesser tower, the outermost pair first, closing in; the seventh light, over the tallest, is the
// star (or, for a studio named for its lamps, a seventh lamp); the studio's name comes up beneath the horizon with the
// seventh light, so that the whole of it is held a while together; and all of it goes out to black. Any key or touch
// ends it (TitlePage.useBeat). The towers stay stone, neutral; only their lights have colour, each pair of lamps in one
// of the Atlas's own, the outermost violet, then blue, then green, and the seventh light gold, each lit once and held
// steady, never a flash, all seven within two seconds of the first frame (the owner, 25 November, OR-528: "it was their
// lights, not the whole towers, that would be marked with the colors"; OR-507). One who asks for less motion is never
// shown it (TitlePage.first, SiteBuild.early).
export class Ident {
  static readonly towers = [0.46, 0.66, 0.82, 1, 0.78, 0.6, 0.42];
  // Each light's colour by how far its tower stands from the tallest: the seventh light gold, then green, blue and the
  // outermost violet; the Atlas's tones (Emphasis.tones), never a colour of the mark's own, and no danger's red. Each
  // is a class (light-gold…), its tone the stylesheet's (frame.css): no tone is written as a colour here.
  static readonly lights = ['gold', 'green', 'blue', 'violet'] as const;
  // When each part begins, in milliseconds from the first frame, and how long the whole mark lasts before it is gone.
  static readonly at = { ground: 100, tower: 300, rise: 85, spire: 520, lamp: 1080, kindle: 140, star: 1540,
    name: 1500 };
  // Held a little over a second once whole (the owner, 16 November: startup had seemed to take forever; it was 3.7 s).
  static readonly length = 2800;
  // How tall a tower's spire stands over its lamp, in the mark's units; the tallest's reaches up to the star's point.
  static readonly spire = 6;
  static View({ studio }: { studio: string }) {
    const w = 168, base = 112, gap = w / (Ident.towers.length + 1), mid = (Ident.towers.length - 1) / 2, at = Ident.at;
    const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });
    const seventh = Identity.seventh(studio);
    return (
      <div className="ident" style={{ animationDuration: `${Ident.length}ms` }}>
        <svg viewBox={`0 0 ${w} 124`} aria-hidden="true" focusable="false">
          <line className="ground" x1={8} x2={w - 8} y1={base} y2={base} style={delay(at.ground)} />
          {Ident.towers.map((h, i) => {
            const x = gap * (i + 1), top = base - h * 78, off = Math.abs(i - mid), rose = at.tower + off * at.rise;
            const lit = off > 0 || seventh === 'lamp', from = lit ? top - 2.6 : top;
            return <g key={i} className={`light-${Ident.lights[off]}`}>
              <line className="tower" x1={x} x2={x} y1={base} y2={top} style={delay(rose)} />
              <line className="spire" x1={x} x2={x} y1={from} y2={from - Ident.spire - (off > 0 ? 0 : 1)}
                style={delay(rose + at.spire)} />
              {lit && <circle className={off > 0 ? 'lamp' : 'lamp seventh'} cx={x} cy={top} r={off > 0 ? 2.2 : 2.3}
                style={delay(off > 0 ? at.lamp + (mid - off) * at.kindle : at.star)} />}
            </g>;
          })}
          {seventh === 'star' && <path d={Ident.star(w / 2, 2, 1)}
            className={`star light-${Ident.lights[0]}`} style={delay(at.star)} />}
        </svg>
        <p className="studio" style={delay(at.name)}>{studio}</p>
      </div>
    );
  }
  // The mark's emblem, small, beside the game's name on the title (OR-529): the tallest tower and its light, the star
  // (or its lamp, for a studio of lamps), so that the studio's mark and the title share one figure. In the ink of the
  // words beside it: on the title the Atlas's colours mean an opportunity and nothing else, so its light is uncoloured.
  static Glyph({ studio }: { studio: string }) {
    const lamp = Identity.seventh(studio) === 'lamp';
    return <svg className="mark-glyph" viewBox="0 0 14 28" aria-hidden="true" focusable="false">
      <line x1={7} x2={7} y1={27} y2={lamp ? 9 : 14} />
      {lamp ? <circle cx={7} cy={9} r={2} /> : <path d={Ident.star(7, 0, .5)} />}
    </svg>;
  }
  // The seventh light as a four-pointed star, its top point at (x, y), at a scale of the mark's (1: the mark's own).
  static star(x: number, y: number, k: number): string {
    const n = (v: number) => +(v * k).toFixed(2);
    return `M${x} ${y} l${n(3)} ${n(9)} l${n(9)} ${n(3)} l${n(-9)} ${n(3)} l${n(-3)} ${n(9)} l${n(-3)} ${n(-9)} l${n(-9)} ${n(-3)}`
      + ` l${n(9)} ${n(-3)} z`;
  }
}
