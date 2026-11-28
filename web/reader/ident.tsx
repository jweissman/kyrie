import type { CSSProperties } from 'react';
import { Identity } from '../../src/presentation/identity';

// The studio's mark, once a session before the title, a few seconds long: the Atlas's indicator, the small upright
// line that marks an opportunity at the left of an act's row, drawn once in heroic size (the owner, 26 November: "a
// 'heroic' version of the common vertical-line with atlas color/gradient… with a swirling gradient of all the
// colors"). It rises from its foot, the five tones of the Atlas flowing slowly through it in one OKLab gradient (gold,
// red, green, blue, violet), held while the studio's name comes up beneath it, and all of it goes out to black. Its
// colours move within it; nothing flashes or blinks (OR-507). Any key or touch ends it (TitlePage.useBeat). One who
// asks for less motion is never shown it (TitlePage.first, SiteBuild.early). The seven towers it had been (OR-528)
// remain the title's emblem (Ident.Glyph). As it rises, sparks are struck from its tip (see sparks).
export class Ident {
  // Every tone of the Atlas, in its precedence (GRAMMAR.md: gold, red, green, blue, violet), as the stylesheet draws
  // them through the indicator (frame.css); no tone is written as a colour here.
  static readonly tones = ['gold', 'red', 'green', 'blue', 'violet'] as const;
  // When each part begins, in milliseconds from the first frame, and how long the whole mark lasts before it is gone.
  static readonly at = { rise: 120, name: 1300 };
  // Held a little over a second once whole (the owner, 16 November: startup had seemed to take forever; it was 3.7 s).
  static readonly length = 2800;
  // The sparks struck from the indicator's tip as it rises (the owner, 27 November: "Studio stab could be more
  // interesting"; OR-1804): each where the tip has risen to when it is struck (near the rise's easing, as a share of
  // its height), thrown up and aside into the dark and gone, the first of the title's embers. Every one is out before the
  // mark goes to black (its last sixth), so that the stab keeps its timing; in no colour, once.
  static readonly sparks = Array.from({ length: 9 }, (_, i) => {
    const at = 220 + i * 105, risen = Math.min(1, (at - Ident.at.rise) / 1000);
    return { at, height: Math.round((1 - (1 - risen) ** 4.5) * 100), lasts: 900 + (i % 3) * 180,
      dx: (i % 2 ? 1 : -1) * (22 + (i * 13) % 36), dy: -(60 + (i * 23) % 70), size: 3 + (i % 2) };
  });
  static View({ studio }: { studio: string }) {
    const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });
    return (
      <div className="ident" style={{ animationDuration: `${Ident.length}ms` }}>
        <span className="stand" aria-hidden="true">
          <span className="indicator" style={delay(Ident.at.rise)} />
          {Ident.sparks.map((x, i) => <i key={i} className="spark" style={{ '--sh': `${x.height}%`, '--sd': `${x.at}ms`,
            '--st': `${x.lasts}ms`, '--sx': `${x.dx}px`, '--sy': `${x.dy}px`, '--ss': `${x.size}px` } as CSSProperties} />)}
        </span>
        <p className="studio" style={delay(Ident.at.name)}>{studio}</p>
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
