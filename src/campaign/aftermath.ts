import { ModuleWriter } from '../lang/module-writer';
import { Exposure } from './exposure';
import { Witnesses } from './witnesses';
import type { World } from '../lang/world';
import type { Operator } from '../lang/module';
import type { CombatEvent } from '../model';

// What a committed command leaves behind in the world: who saw an attack, which elements it let loose where, and
// whether an opponent fled the fight.
export class Aftermath {
  static record(before: World, after: World, action: Operator, events: CombatEvent[]): World {
    return this.rout(Exposure.record(before, Witnesses.record(before, after, action, events), action, events),
      action, events);
  }
  // An opponent that flees is routed: it gives up any blocking stance, so it no longer holds a passage, and what was
  // conditioned on that stance (its description, its growl) ends with it.
  static rout(world: World, action: Operator, events: CombatEvent[]): World {
    const opponent = action.resolve?.name === 'combat' ? action.resolve.args[0] : undefined;
    const fled = events.some(e => e.type === 'end' && e.fled?.team === 'goblins');
    if (!opponent || !fled || !world.module.relations.some(r => r.name === 'routed')) { return world; }
    const stances = world.module.relations.some(r => r.name === 'blocksWhen')
      ? [...world.solve(ModuleWriter.call('state', opponent, '?s'), {})].map(b => b['?s']!)
        .filter(s => world.test(ModuleWriter.call('blocksWhen', opponent, s))) : [];
    return world.apply([{ kind: 'assert', call: ModuleWriter.call('routed', opponent) },
      ...stances.map(s => ({ kind: 'retract' as const, call: ModuleWriter.call('state', opponent, s) }))]);
  }
}
