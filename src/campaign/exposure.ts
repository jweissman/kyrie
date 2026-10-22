import { Content } from '../content';
import { ModuleWriter } from '../lang/module-writer';
import type { World } from '../lang/world';
import type { Operator } from '../lang/module';
import type { CombatEvent } from '../model';

// An area effect of an element lets that element loose in the place where it happens: a fire breath fills the room
// with fire, not just the people in it. The coordinator records `exposedTo(place, element)` after the command; what
// burns, freezes or spoils is authored as ordinary world events. Physical damage is not an element.
export class Exposure {
  private static readonly area = new Set(['enemies', 'allies', 'party', 'all']);
  static record(before: World, after: World, action: Operator, events: CombatEvent[]): World {
    if (!after.module.relations.some(r => r.name === 'exposedTo') || action.resolve?.name !== 'combat' || !action.actor) {
      return after;
    }
    const place = before.one('at', action.actor);
    if (!place) { return after; }
    const elements = new Set(events.flatMap(e => {
      const ability = e.type === 'action' ? Content.abilities.find(a => a.id === e.command.ability) : undefined;
      return ability?.effects.flatMap(effect => effect.kind === 'damage' && this.area.has(effect.target)
        ? [effect.damageType] : []) ?? [];
    }));
    const changes = [...elements].filter(element => after.module.entities.some(x => x.id === element && x.type === 'element'))
      .map(element => ({ kind: 'assert' as const, call: ModuleWriter.call('exposedTo', place, element) }));
    return changes.length ? after.apply(changes) : after;
  }
}
