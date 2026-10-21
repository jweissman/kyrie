import { parseAbility, type Amount, type ArenaAbility } from '../lang/parse';
import { Canon, type Family } from './canon';
import type { Ability, Condition, Hooks, ItemKind, Modifiers, Perk, WeaponStats } from './schema';

// Where a perk is asked about: the holder's environment, and the weapon it wields.
export interface PerkAt { environment?: string; weapon?: { weight?: string; missile?: boolean } }

export interface RuntimeItem {
  name: string; description: string; slot?: string; capability?: string; ability?: string; use?: string;
  modifiers?: Modifiers; hooks?: Hooks; weapon?: WeaponStats; armorAc?: number; armor?: ItemKind['armor'];
}

// Lowers the canonical catalogs into the shapes the executor reads: the ability list for AbilityUse, condition
// definitions for Effects, item definitions for ItemCatalog, and the passive modifiers of traits.
export class CanonRuntime {
  private static withAliases<T>(family: Family, entries: Record<string, T>): Record<string, T> {
    const out = { ...entries };
    for (const [alias, target] of Object.entries(Canon.aliases[family] ?? {})) {
      if (entries[target]) { out[alias] = entries[target]; }
    }
    return out;
  }
  private static amount(text: string): Amount {
    return /^\d+$/.test(text.trim()) ? { kind: 'literal', value: Number(text) } : { kind: 'deem', expression: text };
  }
  static ability(id: string, a: Ability): ArenaAbility {
    const common = { cost: a.cost ?? 0, cooldown: a.recharge ?? 0, ...a.spell ? { spell: a.spell } : {},
      ...a.level !== undefined ? { level: a.level } : {}, ...a.requires ? { requires: a.requires } : {},
      ...a.windup ? { windup: a.windup } : {},
      ...a.resist ? { resist: { kind: a.resist.kind, difficulty: this.amount(a.resist.difficulty) } } : {} };
    if (a.effects) { return { id, name: a.name, effects: a.effects, ...common, description: a.description ?? a.name }; }
    return { ...parseAbility(id, a.name, a.effect!), description: a.effect!, ...common };
  }
  // Every ability Kyr can execute. Entries recorded as unsupported stay in the catalog but are never offered.
  static abilities(): ArenaAbility[] {
    const own = Object.fromEntries(Object.entries(Canon.abilities).filter(([, a]) => !a.unsupported)
      .map(([id, a]) => [id, this.ability(id, a)]));
    const all = { ...this.withAliases('abilities', own) };
    for (const deity of Object.values(Canon.deities)) {
      const b = deity.blessing;
      if (b) { all[b.id] = this.ability(b.id, { name: b.name, kind: 'technique', effect: b.effect }); }
    }
    for (const [id, p] of Object.entries(Canon.rules.procedures)) {
      all[id] = this.ability(id, { name: p.name, kind: 'technique', effect: p.effect });
    }
    return Object.entries(all).map(([id, a]) => ({ ...a, id }));
  }
  static conditions(): Record<string, Condition> {
    return this.withAliases('conditions', Object.fromEntries(Object.entries(Canon.conditions)
      .filter(([, c]) => !c.unsupported)));
  }
  static items(): Record<string, RuntimeItem> {
    const own = Object.fromEntries(Object.entries(Canon.items).map(([id, i]) => [id, {
      name: i.name, description: i.description, ...i.slot ? { slot: i.slot } : {},
      ...i.grants?.skill ? { capability: i.grants.skill } : {},
      ...i.grants?.ability ? { ability: i.grants.ability } : {},
      ...i.modifiers ? { modifiers: i.modifiers } : {}, ...i.hooks ? { hooks: i.hooks } : {},
      ...i.weapon ? { weapon: i.weapon } : {}, ...i.armor ? { armor: i.armor } : {},
      ...i.use ? { use: i.use } : {} } as RuntimeItem]));
    return this.withAliases('items', own);
  }
  // The permanent modifiers and hooks of the traits a creature holds, with the perks that hold only somewhere (in a
  // forest) or with something (a heavy weapon) when they do.
  static passives(traits: string[] = [], at: PerkAt = {}): { modifiers: Modifiers[]; hooks: Hooks[] } {
    const held = [...new Set(traits.map(id => Canon.resolve('traits', id)))].map(id => {
      const t = Canon.traits[id];
      if (!t) { throw new Error(`Unknown trait ${id}`); }
      return t;
    });
    const conditional = held.flatMap(t => (t.perks ?? [])
      .filter(p => (p.environment || p.weapon) && this.holds(p, at)));
    return { modifiers: [...held.map(t => t.modifiers), ...conditional.map(p => p.modifiers)], hooks: [] };
  }
  // Whether a conditional perk holds: its environment is where the holder is; its weapon is the kind wielded (Orsino
  // declares a melee condition but checks only weight; Kyr checks both).
  static holds(perk: Perk, at: PerkAt): boolean {
    if (perk.environment && perk.environment !== at.environment) { return false; }
    if (perk.weapon?.weight && perk.weapon.weight !== at.weapon?.weight) { return false; }
    return !(perk.weapon?.type === 'melee' && at.weapon?.missile);
  }
}
