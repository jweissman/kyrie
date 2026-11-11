import { ModuleWriter } from '../../src/lang/module-writer';
import type { Journey } from '../../src/session/journey';

// A company set down in a place by the test, with its darkness lifted: for specs that exercise a room's contents, not
// the way to it (the way is the specs of the journey that reaches it).
export class Placed {
  static at(j: Journey, place: string, lit = true) {
    const held = j.campaign as unknown as { world: { apply(c: unknown[]): unknown; one(r: string, a: string): string };
      commit(x: unknown): void };
    held.commit(held.world.apply([
      { kind: 'retract', call: ModuleWriter.call('at', 'party', held.world.one('at', 'party')) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', place) },
      ...lit ? [{ kind: 'retract', call: ModuleWriter.call('unlit', place) }] : []]));
  }
  static knows(j: Journey, fact: string) {
    const held = j.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(x: unknown): void };
    held.commit(held.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', fact) }]));
  }
  static carried(j: Journey, item: string) { return j.campaign.world.related('ownedItem').some(r => r.args[0] === item); }
  static holds(j: Journey, relation: string, ...args: string[]) {
    return j.campaign.world.test(ModuleWriter.call(relation, ...args));
  }
}
