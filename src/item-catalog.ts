import { CanonRuntime, type RuntimeItem } from './canon/canon-runtime';
import { Canon } from './canon/canon';
import type { HookKey, Hooks } from './canon/schema';
import type { Effect } from './lang/parse';
import { ModifierSet, type Modifiers } from './rules/modifiers';
import type { WeaponProfile } from './rules/fighting';
import type { Creature } from './creature';
export type ItemDefinition = RuntimeItem;
export interface Equipment { modifiers: Modifiers; hooks: Hooks; weapon: WeaponProfile; armorAc: number }

export class ItemCatalog {
  static readonly definitions: Record<string, ItemDefinition> = CanonRuntime.items();
  static get(id: string): ItemDefinition {
    const result = this.definitions[id];
    if (!result) { throw new Error(`Unknown item definition ${id}`); }
    return result;
  }
  static abilities(creature: Creature): Record<string, { id: string; kind: 'item'; name: string }> {
    return Object.fromEntries((creature.state.inventory ?? []).filter(i => i.equipped)
      .flatMap(i => { const d = this.get(i.definition); return d.ability
        ? [[d.ability, { id: i.id, kind: 'item' as const, name: d.name }]] : []; }));
  }
  static weapon(id: string, name?: string): WeaponProfile {
    const w = this.get(id).weapon;
    if (!w) { throw new Error(`${id} is not a weapon`); }
    return { id, name: name ?? this.get(id).name, damage: w.damage, type: w.type,
      ...w.weight ? { weight: w.weight } : {},
      ...w.missile ? { missile: true } : {}, ...w.intercept ? { intercept: true } : {},
      ...w.natural ? { natural: true } : {} };
  }
  // What a creature's equipment contributes: the wielded weapon (else its natural weapon, else a fist, as in Orsino's
  // effectiveWeapon), the body armour's ac (else its natural armour), and the modifiers and hooks of equipped items.
  static equipment(creature: Creature): Equipment {
    const equipped = (creature.state.inventory ?? []).filter(i => i.equipped);
    const natural = Canon.isSpecies(creature.raceId) ? Canon.creature(creature.raceId).statistics : undefined;
    const wielded = equipped.find(i => this.get(i.definition).weapon);
    const worn = equipped.find(i => this.get(i.definition).armor);
    const hooks: Hooks = {};
    for (const i of equipped) {
      for (const [key, effects] of Object.entries(this.get(i.definition).hooks ?? {})) {
        if (key !== 'reactions') { (hooks[key as HookKey] ??= []).push(...effects as Effect[]); }
      }
    }
    return { modifiers: ModifierSet.sum(equipped.map(i => this.get(i.definition).modifiers ?? {})), hooks,
      weapon: wielded ? this.weapon(wielded.definition) : this.weapon(natural?.weapon ?? 'fist'),
      armorAc: worn ? this.get(worn.definition).armor!.ac : natural?.armor ? this.get(natural.armor).armor!.ac : 0 };
  }
}
