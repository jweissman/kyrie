import type { Instrument } from '../../../src/presentation/instruments';
import { Glyphs } from '../creation/glyphs';

// A sense the company has earned: passive, engine-read and apart from the scene's acts.
export class SkySense {
  static View({ instruments }: { instruments?: Instrument[] }) {
    const sky = instruments?.find(i => i.id === 'sky' && i.relevant && i.emblem && i.name);
    if (!sky?.emblem || !sky.name) { return null; }
    return <aside className="sky-sense" data-instrument="sky" aria-label={`${sky.name} rising`}>
      <Glyphs.View id={sky.emblem} className="sky-sense-emblem" />
      <span>{sky.name}</span>
    </aside>;
  }
}
