import type { BundleSource } from '../campaign/bundle-source';
import { PlaySession, type Drawn } from '../session/play-session';
import { WorldAssembler } from './world-assembler';
import { Frontier } from './frontier';

// A generated world drawn again from its seed and what it was drawn for (the company, the country's terrain, the
// origin, someone who died there before): the same world, so that a transcript of play in it can be replayed in the
// terminal as in the browser, past its march-stones too. The browser draws it by the same options.
export class DrawnWorld {
  static options(drawn: Drawn): Parameters<typeof WorldAssembler.assemble>[2] {
    return { ...drawn.terrain ? { region: { terrain: drawn.terrain } } : {}, party: drawn.party,
      ...drawn.origin ? { origin: drawn.origin } : {}, ...drawn.memorial ? { memorial: drawn.memorial } : {} };
  }
  static async start(seed: string, drawn: Drawn, source: BundleSource): Promise<PlaySession> {
    const world = await WorldAssembler.assemble(seed, source, this.options(drawn));
    const session = await PlaySession.start(world.path, seed, world.source, drawn.origin ? undefined : drawn.party);
    return session.drawnFor(drawn).extend(new Frontier(seed, source));
  }
}
