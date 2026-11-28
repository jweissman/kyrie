import { useState, type CSSProperties } from 'react';
import type { Backdrop as Kind } from '../../src/creation/opening-pages';

// Sparks going up slowly through the dark, as off a fire out of sight below the page: a few, each its own way across
// and its own pace, the same every time (no chance in it), gone for one who asks for less motion. Back as they were
// before look-7 (IG-14, the owner: the title was much better with them; quiet never meant still): their own slow drift,
// answering nothing the hand does. Cooled toward the night's blue-white, the first step of their becoming the sky
// (OR-530). One passage, never begun again: each mote is where the page's one clock has it, so that the title, how a
// life begins, the country being drawn and the pages of the choosing, each drawing them anew, carry the same sparks
// on where they were (TO-03).
export class Embers {
  static View() {
    const [since] = useState(Embers.since);
    return (
      <div className="motes" aria-hidden="true">
        {Array.from({ length: Embers.count }, (_, i) => <i key={i} style={{ '--x': `${(i * 37 + 11) % 100}%`,
          '--d': `${-((i * 7919) % 23) - since}s`, '--t': `${16 + (i * 13) % 11}s`, '--s': `${2 + (i % 3)}px` } as CSSProperties} />)}
      </div>
    );
  }
  static readonly count = 34;
  // The motes' one clock: seconds since they were first drawn in this page's life.
  static since(): number {
    const now = typeof performance === 'undefined' ? 0 : performance.now();
    Embers.lit ??= now;
    return Math.round(now - Embers.lit) / 1000;
  }
  private static lit: number | undefined;
}

// What stands behind an engine page, as its hints say (PageHints.backdrop), drawn by the frame and never chosen by the
// page: the embers going up in the dark (the title's); the black curtain with the embers before it (creation's, the
// owner, 27 November: "I'd prefer black curtain and embers"; no painting, and nothing panned or zoomed); the dark
// alone; or nothing of the frame's (a country's painting is the shell's, behind the frame).
export class Backdrop {
  static View({ kind }: { kind?: Kind }) {
    if (kind === 'embers') { return <Embers.View />; }
    if (kind === 'curtain') { return <div className="curtain" data-backdrop="curtain" aria-hidden="true"><Embers.View /></div>; }
    return null;
  }
}
