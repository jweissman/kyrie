import { WorldAssembler } from '../../src/world/world-assembler';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { PlaySession } from '../../src/session/play-session';
import { Journey } from '../../src/session/journey';
import { Placed } from './placed';
import { ModuleWriter } from '../../src/lang/module-writer';

// The Walk of the Milestones as a standing scenario (the line its integrator adds to data/scenarios/standing.json): specs
// set the standing list to test/fixtures/walk/standing.json, which is the five standing scenarios and the Walk.
export class Walking {
  static readonly standing = 'test/fixtures/walk/standing.json';
  static async world(seed: string, calling = 'warrior') {
    const was = WorldAssembler.standing;
    (WorldAssembler as unknown as { standing: string }).standing = this.standing;
    const party = [{ name: 'Mira', raceId: 'human', classId: calling }];
    try {
      const world = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { party });
      const j = Journey.of(await PlaySession.start(world.path, seed, world.source, party));
      return { world, j, placed: world.report.placements.find(p => p.scenario === 'walking')! };
    } finally { (WorldAssembler as unknown as { standing: string }).standing = was; }
  }
  static k(id: string) { return `walk__${id}`; }
  static holds(j: Journey, relation: string, ...args: string[]) {
    return Placed.holds(j, this.k(relation), ...args.map(a => a.includes('__') || a === 'party' ? a : this.k(a)));
  }
  static knows(j: Journey, fact: string) { return Placed.holds(j, 'knows', 'party', this.k(fact)); }
  static state(j: Journey, thing: string) { return j.campaign.world.one('state', this.k(thing)); }
  static drawn(j: Journey, relation: string) { return j.campaign.world.related(this.k(relation)).map(r => r.args.join('|').replaceAll('walk__', '')); }
  static flash(j: Journey): string { return this.drawn(j, 'flashpoint')[0]!.replace('f_', ''); }
  static at(j: Journey, who: string) { return j.campaign.world.one('at', this.k(who)); }
  static measure(j: Journey, name: string, who: string): number { const m = j.campaign.world.measured(this.k(name)).find(x => x.call.args[0] === this.k(who)); return m?.value ?? 0; }
  // Put a relation of the Walk's module in or out outright: for specs that set the world where a long play would have, and
  // say so in their name.
  static assert(j: Journey, relation: string, ...args: string[]) { this.apply(j, 'assert', relation, args); }
  static retract(j: Journey, relation: string, ...args: string[]) { this.apply(j, 'retract', relation, args); }
  private static apply(j: Journey, kind: string, relation: string, args: string[]) {
    const held = j.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(x: unknown): void };
    held.commit(held.world.apply([{ kind, call: ModuleWriter.call(`walk__${relation}`, ...args.map(a => a.includes('__') || a === 'party' ? a : `walk__${a}`)) }]));
  }
  // The same world again from a checkpoint of the first, so that each ending is played from the same morning.
  static fork(j: Journey): Journey {
    return Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
  }
  static quantity(j: Journey, who: string, good: string): number {
    const m = j.campaign.world.measured('quantity').find(x => x.call.args[0] === who && x.call.args[1] === good);
    return m?.value ?? 0;
  }
}
