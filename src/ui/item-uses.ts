import type { ItemCatalog } from '../item-catalog';
import { Conditions as ConditionSense } from '../ports/conditions';
import type { Act } from './screen-types';

// What a thing carried is kept for, when its use is not offered now: a salve when none of the company needs it, a
// flask of fire outside a fight (PT-18: moss that "binds a wound better than linen" could not be used, and nothing
// said why).
export class ItemUses {
  static readonly using = /^(use_item|light_item|light_lamp)\(/;
  // A lamp with nothing to burn says so, by what the company carries (CL-62: a lantern bought with no oil sat in the
  // pack as if it were a light, and only the torch and the candles were offered).
  static kept(catalog: ItemCatalog, kind: string, acts: Act[], carried: ReadonlySet<string> = new Set()):
    string | undefined {
    if (acts.flatMap(a => [a, ...a.children ?? []]).some(a => a.command && this.using.test(a.command))) {
      return undefined;
    }
    const fuel = catalog.get(kind).fuel;
    if (fuel) {
      return carried.has(fuel) ? undefined
        : `for light · burns ${catalog.get(fuel).name.replace(/^flask of /i, '').toLowerCase()}, and you have none`;
    }
    const use = catalog.use(kind);
    if (!use) { return undefined; }
    if (use.effects.every(e => /enem/.test(e.target))) { return 'for a fight · thrown at a foe'; }
    const cures = use.effects.flatMap(e => e.kind === 'remove' ? [ConditionSense.name(e.status).toLowerCase()] : []);
    const states = [...cures, ...use.effects.some(e => e.kind === 'heal') ? ['hurt'] : []];
    return states.length ? `for one who is ${states.join(' or ')} · none of you is now` : undefined;
  }
  // What a kind of lamp burns, if it is one (the catalog's fuel), by its bare kind.
  static fuel(catalog: ItemCatalog, kind: string): string | undefined { return catalog.find(kind)?.fuel; }
  // The kinds the company carries, among them a lamp's fuel.
  static carried(members: { state: { inventory?: { definition: string }[] } }[]): Set<string> {
    return new Set(members.flatMap(c => (c.state.inventory ?? []).map(i => i.definition)));
  }
  // Whether the company carries a lamp with nothing to burn in it: no light to spare, and the provisions say so
  // (CL-62).
  static dry(items: readonly { kind: string; fuel?: string }[]): boolean {
    return items.some(i => !!i.fuel && !items.some(j => j.kind === i.fuel));
  }
  // Whether what using a thing does heals, or lifts something.
  static mends(ability: { effects: { kind: string }[] } | undefined): boolean {
    return !!ability?.effects.some(e => e.kind === 'heal' || e.kind === 'remove');
  }
}
