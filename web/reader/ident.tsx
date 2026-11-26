import type { CSSProperties } from 'react';
import { Identity } from '../../src/presentation/identity';

// The studio's mark, once a session before the title, a few seconds long: the Atlas's indicator, the small upright
// line that marks an opportunity at the left of an act's row, drawn once in heroic size (the owner, 26 November: "a
// 'heroic' version of the common vertical-line with atlas color/gradient… with a swirling gradient of all the
// colors"). It rises from its foot, the five tones of the Atlas flowing slowly through it in one OKLab gradient (gold,
// red, green, blue, violet), held while the studio's name comes up beneath it, and all of it goes out to black. Its
// colours move within it; nothing flashes or blinks (OR-507). Any key or touch ends it (TitlePage.useBeat). One who
// asks for less motion is never shown it (TitlePage.first, SiteBuild.early). The seven towers it had been (OR-528)
// remain the title's emblem (Ident.Glyph).
export class Ident {
  // Every tone of the Atlas, in its precedence (GRAMMAR.md: gold, red, green, blue, violet), as the stylesheet draws
  // them through the indicator (frame.css); no tone is written as a colour here.
  static readonly tones = ['gold', 'red', 'green', 'blue', 'violet'] as const;
  // When each part begins, in milliseconds from the first frame, and how long the whole mark lasts before it is gone.
  static readonly at = { rise: 120, name: 1300 };
  // Held a little over a second once whole (the owner, 16 November: startup had seemed to take forever; it was 3.7 s).
  static readonly length = 2800;
  static View({ studio }: { studio: string }) {
    const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });
    return (
      <div className="ident" style={{ animationDuration: `${Ident.length}ms` }}>
        <span className="indicator" aria-hidden="true" style={delay(Ident.at.rise)} />
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
