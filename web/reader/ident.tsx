import type { CSSProperties } from 'react';
import { Identity } from '../../src/presentation/identity';

// The studio's mark, once a session before the title, a few seconds long. A horizon is drawn from the middle outward;
// seven towers rise from it in light, the tallest first (the City of Seven Towers), each finished by a fine spire; a
// lamp is lit on each lesser tower, the outermost pair first, closing in; the seventh light, over the tallest, is the
// star (or, for a studio named for its lamps, a seventh lamp); the studio's name comes up beneath the horizon with the
// seventh light, so that the whole of it is held a while together; and all of it goes out to black. Any key or touch
// ends it (TitlePage.useBeat).
export class Ident {
  static readonly towers = [0.46, 0.66, 0.82, 1, 0.78, 0.6, 0.42];
  // When each part begins, in milliseconds from the first frame, and how long the whole mark lasts before it is gone.
  static readonly at = { ground: 100, tower: 300, rise: 85, spire: 520, lamp: 1080, kindle: 140, star: 1540,
    name: 1500 };
  static readonly length = 3700;
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
            return <g key={i}>
              <line className="tower" x1={x} x2={x} y1={base} y2={top} style={delay(rose)} />
              <line className="spire" x1={x} x2={x} y1={from} y2={from - Ident.spire - (off > 0 ? 0 : 1)}
                style={delay(rose + at.spire)} />
              {lit && <circle className={off > 0 ? 'lamp' : 'lamp seventh'} cx={x} cy={top} r={off > 0 ? 1.9 : 2.3}
                style={delay(off > 0 ? at.lamp + (mid - off) * at.kindle : at.star)} />}
            </g>;
          })}
          {seventh === 'star' && <path className="star" d={`M${w / 2} 2 l3 9 l9 3 l-9 3 l-3 9 l-3 -9 l-9 -3 l9 -3 z`}
            style={delay(at.star)} />}
        </svg>
        <p className="studio" style={delay(at.name)}>{studio}</p>
      </div>
    );
  }
}
