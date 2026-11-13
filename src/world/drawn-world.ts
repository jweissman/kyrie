import type { BundleSource } from '../campaign/bundle-source';
import { Stopwatch } from '../stopwatch';
import { PlaySession, type Drawn } from '../session/play-session';
import { WorldAssembler } from './world-assembler';
import { Frontier } from './frontier';

// A generated world drawn again from its seed and what it was drawn for (the company, the country's terrain, the
// origin, someone who died there before): the same world, so that a transcript of play in it can be replayed in the
// terminal as in the browser, past its march-stones too. The browser draws it by the same options.
export class DrawnWorld {
  static options(drawn: Drawn): Parameters<typeof WorldAssembler.assemble>[2] {
    return { ...drawn.terrain ? { region: { terrain: drawn.terrain } } : {}, party: drawn.party,
      ...drawn.origin ? { origin: drawn.origin } : {}, ...drawn.memorial ? { memorial: drawn.memorial } : {},
      ...drawn.standing ? { standing: drawn.standing } : {} };
  }
  // A watch, where one is kept, times each phase (see Stopwatch: the terminal says them as they begin).
  static async start(seed: string, drawn: Drawn, source: BundleSource, watch?: Stopwatch): Promise<PlaySession> {
    const world = await Stopwatch.in(watch, 'Drawing the country', () =>
      WorldAssembler.assemble(seed, source, this.options(drawn)));
    const session = await Stopwatch.in(watch, 'Composing the world', () =>
      PlaySession.start(world.path, seed, world.source, drawn.origin ? undefined : drawn.party));
    return Stopwatch.in(watch, 'Readying the borders', () =>
      session.drawnFor(drawn).extend(new Frontier(seed, source, this.options(drawn))));
  }
}
