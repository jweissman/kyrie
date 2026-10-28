import { ItemCatalog } from '../item-catalog';
import { ConditionSense } from '../presentation/condition-sense';
import type { Act } from './screen-types';

// What a thing carried is kept for, when its use is not offered now: a salve when none of the company needs it, a
// flask of fire outside a fight (PT-18: moss that "binds a wound better than linen" could not be used, and nothing
// said why).
export class ItemUses {
  static readonly using = /^(use_item|light_item|light_lamp)\(/;
  static kept(kind: string, acts: Act[]): string | undefined {
    const use = ItemCatalog.use(kind);
    if (!use || acts.flatMap(a => [a, ...a.children ?? []]).some(a => a.command && this.using.test(a.command))) {
      return undefined;
    }
    if (use.effects.every(e => /enem/.test(e.target))) { return 'for a fight · thrown at a foe'; }
    const cures = use.effects.flatMap(e => e.kind === 'remove' ? [ConditionSense.name(e.status).toLowerCase()] : []);
    const states = [...cures, ...use.effects.some(e => e.kind === 'heal') ? ['hurt'] : []];
    return states.length ? `for one who is ${states.join(' or ')} · none of you is now` : undefined;
  }
}
