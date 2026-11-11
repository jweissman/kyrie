import { WorldAssembler } from '../../src/world/world-assembler';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { PlaySession } from '../../src/session/play-session';
import { Journey } from '../../src/session/journey';
import { Placed } from './placed';

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
    return Placed.holds(j, this.k(relation), ...args.map(a => a.includes('__') ? a : this.k(a)));
  }
  static state(j: Journey, thing: string) { return j.campaign.world.one('state', this.k(thing)); }
  static drawn(j: Journey, relation: string) { return j.campaign.world.related(this.k(relation)).map(r => r.args.join('|').replaceAll('walk__', '')); }
  static flash(j: Journey): string { return this.drawn(j, 'flashpoint')[0]!.replace('f_', ''); }
  static at(j: Journey, who: string) { return j.campaign.world.one('at', this.k(who)); }
  static measure(j: Journey, name: string, who: string): number { const m = j.campaign.world.measured(this.k(name)).find(x => x.call.args[0] === this.k(who)); return m?.value ?? 0; }
}

import { ModuleWriter } from '../../src/lang/module-writer';
export class WalkingState {
  // Assert a relation of the Walk's module outright: for specs that put the world where a long play would have, and say so.
  static assert(j: Journey, relation: string, ...args: string[]) {
    const held = j.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(x: unknown): void };
    held.commit(held.world.apply([{ kind: 'assert', call: ModuleWriter.call(`walk__${relation}`, ...args.map(a => a.includes('__') ? a : `walk__${a}`)) }]));
  }
  static set(j: Journey, measure: string, who: string, value: number) {
    const held = j.campaign as unknown as { world: { apply(c: unknown[]): unknown; one(r: string, a: string): string }; commit(x: unknown): void };
    void value; void held; void measure; void who;
  }
}
