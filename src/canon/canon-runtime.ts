import { parseAbility, type ArenaAbility } from '../lang/parse';
import order from '../../data/legacy/ability-order.json';
import { Canon, type Family } from './canon';
import type { Ability, Modifiers } from './schema';

export interface RuntimeKind {
  name: string; nameGroup: string; description: string; classes: string[]; playable?: boolean;
  creationAbilities: string[]; playerFeature: string; resistances?: Record<string, number>;
  stats?: Record<string, number>; hitPoints?: number; traits?: string[];
}
export interface RuntimeCalling {
  name: string; role: string; hitDie: number; mana: number; primary: string; abilities: string[];
  hpPerLevel: number; playable?: boolean;
}
export interface RuntimeItem {
  name: string; description: string; slot?: string; capability?: string; ability?: string;
  armor?: number; power?: number; save?: number; use?: string;
}

// Lowers the canonical catalogs into the shapes the existing executor reads: creature generation tables, the
// ability list for AbilityUse, condition definitions for Effects, item definitions for ItemCatalog. A species
// lowers to a kind and a calling of the same id, so generation reads its statistics and natural abilities.
export class CanonRuntime {
  private static withAliases<T>(family: Family, entries: Record<string, T>): Record<string, T> {
    const out = { ...entries };
    for (const [alias, target] of Object.entries(Canon.aliases[family] ?? {})) {
      if (entries[target]) { out[alias] = entries[target]; }
    }
    return out;
  }
  static kinds(): Record<string, RuntimeKind> {
    const out: Record<string, RuntimeKind> = {};
    for (const [id, a] of Object.entries(Canon.ancestries)) {
      out[id] = { name: a.name, nameGroup: a.nameGroup, description: a.description, classes: a.classes,
        ...a.playable ? { playable: true } : {}, creationAbilities: a.techniques, playerFeature: a.feature };
    }
    for (const id of Object.keys(Canon.species)) {
      const s = Canon.creature(id), stats = s.statistics!;
      out[id] = { name: s.name, nameGroup: 'hero', description: s.description, classes: [id], creationAbilities: [],
        playerFeature: '', ...s.resistances ? { resistances: s.resistances } : {},
        ...typeof stats.attributes === 'object' ? { stats: stats.attributes } : {},
        ...stats.hitPoints ? { hitPoints: stats.hitPoints } : {}, ...s.traits?.length ? { traits: s.traits } : {} };
    }
    return out;
  }
  static callings(): Record<string, RuntimeCalling> {
    const out: Record<string, RuntimeCalling> = {};
    for (const [id, c] of Object.entries(Canon.classes)) {
      out[id] = { name: c.name, role: c.description, hitDie: c.hitDie, mana: c.mana, primary: c.primary,
        abilities: c.abilities, hpPerLevel: c.hpPerLevel, ...c.playable ? { playable: true } : {} };
    }
    for (const [id, c] of Object.entries(Canon.legacy.classes)) {
      out[id] = { name: c.name, role: c.role, hitDie: c.hitDie, mana: c.mana, primary: c.primary,
        abilities: c.abilities,
        hpPerLevel: c.hpPerLevel, ...c.playable ? { playable: true } : {} };
    }
    for (const id of Object.keys(Canon.species)) {
      const s = Canon.creature(id), stats = s.statistics!;
      out[id] = { name: s.name, role: s.description, hitDie: stats.hitDie, mana: stats.mana, primary: stats.primary,
        abilities: s.abilities ?? [], hpPerLevel: stats.hpPerLevel };
    }
    return out;
  }
  static ability(id: string, a: Ability): ArenaAbility {
    const common = { ...a.cost ? { cost: a.cost } : { cost: 0 }, cooldown: a.recharge ?? 0 };
    if (a.effects) {
      return { id, name: a.name, effects: a.effects, ...common, description: a.description ?? a.name,
        ...a.attack ? { attack: a.attack } : {}, ...a.damagePolicy ? { damagePolicy: a.damagePolicy } : {} };
    }
    return { ...parseAbility(id, a.name, a.effect!), description: a.effect!, ...common };
  }
  static abilities(): ArenaAbility[] {
    const own = Object.fromEntries(Object.entries(Canon.abilities).map(([id, a]) => [id, this.ability(id, a)]));
    const all = { ...this.withAliases('abilities', own) };
    for (const [id, a] of Object.entries(Canon.legacy.abilities)) { all[id] = this.ability(id, a); }
    for (const deity of Object.values(Canon.deities)) {
      const b = deity.blessing;
      if (b) { all[b.id] = this.ability(b.id, { name: b.name, kind: 'technique', effect: b.effect }); }
    }
    for (const [id, p] of Object.entries(Canon.rules.procedures)) {
      all[id] = this.ability(id, { name: p.name, kind: 'technique', effect: p.effect });
    }
    return Object.entries(all).map(([id, a]) => ({ ...a, id }))
      .sort((a, b) => this.rank(a.id) - this.rank(b.id));
  }
  // Combat breaks ties in catalog order, so the list keeps its historical order; a canonical ability that replaced
  // an older id takes that id's place.
  private static rank(id: string): number {
    const old = Object.entries(Canon.aliases.abilities).find(([, target]) => target === id)?.[0];
    const at = order.order.indexOf(id), was = old ? order.order.indexOf(old) : -1;
    return at >= 0 ? at : was >= 0 ? was + 0.5 : order.order.length + Object.keys(Canon.abilities).indexOf(id) / 1000;
  }
  static conditions() { return this.withAliases('conditions', Canon.conditions); }
  static items(): Record<string, RuntimeItem> {
    const own = Object.fromEntries(Object.entries(Canon.items).map(([id, i]) => [id, {
      name: i.name, description: i.description, ...i.slot ? { slot: i.slot } : {},
      ...i.grants?.skill ? { capability: i.grants.skill } : {},
      ...i.grants?.ability ? { ability: i.grants.ability } : {},
      ...i.modifiers ?? {}, ...i.use ? { use: i.use } : {} } as RuntimeItem]));
    return { ...this.withAliases('items', own), ...Canon.legacy.items };
  }
  // The permanent modifiers a creature carries from its kind, its calling and the traits it chose.
  static passives(raceId: string, chosen: string[] = []): Modifiers[] {
    const kind = Canon.isSpecies(raceId) ? Canon.creature(raceId).traits ?? [] : [];
    return [...new Set([...kind, ...chosen].map(id => Canon.resolve('traits', id)))].map(id => {
      const t = Canon.traits[id];
      if (!t) { throw new Error(`Unknown trait ${id}`); }
      return t.modifiers;
    });
  }
}
