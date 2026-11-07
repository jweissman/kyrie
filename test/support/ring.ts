import { WorldAssembler } from '../../src/world/world-assembler';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { PlaySession } from '../../src/session/play-session';
import { PlayerView } from '../../src/presentation/player-view';
import { Journey } from '../../src/session/journey';
import { Frontier } from '../../src/world/frontier';
import { ModuleWriter } from '../../src/lang/module-writer';
import { GeneratedWorld } from './generated';

// The Ring (doc/imbar/17-the-ring.md): a Deem-cast smuggling ring in the largest town, whose lieutenant sits in a store
// in Tolleth and whose Principal goes round town, Tolleth, Port Ness and home. The harness plays it as a player would,
// from a drawn world.
export class Ring {
  static async world(seed: string, terrain: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { region: { terrain } });
    const s = await PlaySession.start(w.path, seed, w.source), frontier = new Frontier(seed, NodeBundleSource.shared);
    const town = (w.report.placements.find(p => p.scenario === 'factors')!.bindings as { town: string }).town;
    return { w, s, j: Journey.of(s), frontier, town };
  }
  // Brings Tolleth into the world as a company would, by standing at its way in.
  static async tolleth(world: Awaited<ReturnType<typeof Ring.world>>) {
    await GeneratedWorld.travel(world.s, 'gate_tolleth');
    await world.frontier.expand(world.s.campaign);
  }
  static names(j: Journey) { return j.choices().map(c => c.label); }
  static async save(s: PlaySession) {
    return Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint()))));
  }
  static choose(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No ${pattern}`); }
    return s.perform(c.choice.id);
  }
  // A measure made so, for a branch of the Deem table a test wants to walk whichever world it was drawn in.
  static set(j: Journey, name: string, who: string, value: number) {
    const world = j.campaign.world, call = ModuleWriter.call(name.includes('__') ? name : `factors__${name}`, who);
    j.campaign.commitWorld(world.apply([{ kind: 'set', call, value: ModuleWriter.number(value) }]));
  }
}
