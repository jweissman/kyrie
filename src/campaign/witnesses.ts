import { World } from '../lang/world';
import { ModuleWriter } from '../lang/module-writer';
import type { Operator } from '../lang/module';
import type { CombatEvent } from '../model';

// Bounded direct perception: present at the attempt, alive at commit, not a participant. No offscreen hearsay.
export class Witnesses {
  private static members(world: World, group: string) {
    return world.related('memberOf').filter(r => r.args[1] === group)
      .map(r => world.module.entities.find(e => e.id === r.args[0])?.creatureId);
  }
  static record(before: World, after: World, action: Operator, events: CombatEvent[]): World {
    if (!after.module.relations.some(r => r.name === 'witnessedAttack') || action.resolve?.name !== 'combat'
      || !action.actor) { return after; }
    const actor = action.actor, opponent = action.resolve.args[0]!;
    const attackers = this.members(before, actor), defenders = this.members(before, opponent);
    if (!events.some(e => e.type === 'damage' && attackers.includes(e.actor) && defenders.includes(e.target))) {
      return after;
    }
    const location = before.one('at', actor);
    if (!location) { return after; }
    const witnesses = before.module.entities.filter(e => e.type === 'group' && e.id !== actor && e.id !== opponent
      && before.test(ModuleWriter.call('at', e.id, location)) && before.test(ModuleWriter.call('able', e.id))
      && after.test(ModuleWriter.call('able', e.id)));
    return after.apply(witnesses.map(w => ({ kind: 'assert',
      call: ModuleWriter.call('witnessedAttack', w.id, actor, opponent) })));
  }
}
