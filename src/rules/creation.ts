import { Canon } from '../canon/canon';
import type { Attribute, CharacterClass, Proficiencies } from '../canon/schema';
import { Fighting } from './fighting';

export interface Chassis {
  hitDie: number; attributes: Partial<Record<Attribute, number>>; abilities: string[]; traits: string[];
  weapons: string[]; armor: string[]; fixed?: Record<Attribute, number>; hitPoints?: number;
  growth?: { hitPoints?: { base: number; perLevel: number } };
}
// Orsino's character creation (CharacterRecord and the pc template) and its NPC hit points, as rules over the canon.
export class Creation {
  static readonly picks: Record<number, number> = { 1: 3, 2: 2, 3: 1 };
  static a(word: string): string { return `${/^[aeiou]/i.test(word) ? 'an' : 'a'} ${word}`; }
  static classOf(id: string | undefined): CharacterClass | undefined {
    return id ? Canon.classes[Canon.resolve('classes', id)] : undefined;
  }
  static classId(id: string): string { return Canon.resolve('classes', id); }
  // What a calling brings at the levels after `from` up to `to`: the techniques it learns and the traits it takes.
  static features(classId: string | undefined, from: number, to: number): { abilities: string[]; traits: string[] } {
    const due = (this.classOf(classId)?.features ?? []).filter(f => f.level > from && f.level <= to);
    return { abilities: due.flatMap(f => f.abilities ?? []), traits: due.flatMap(f => f.traits ?? []) };
  }
  // A person's chassis comes from its ancestry, its class and the class's features to its level; a species
  // creature's from its own statistics.
  static chassis(raceId: string, classId?: string, level = 1): Chassis {
    if (Canon.isSpecies(raceId)) {
      const s = Canon.creature(raceId), st = s.statistics!;
      const grow = st.growth ? Math.round(level / 8) : 0;
      return { hitDie: st.hitDie ?? 0, attributes: {}, abilities: s.abilities ?? [], traits: s.traits ?? [],
        weapons: [st.weapon], armor: st.armor ? [st.armor] : [],
        ...typeof st.attributes === 'object' ? { fixed: Object.fromEntries(Object.entries(st.attributes)
          .map(([k, v]) => [k, v + grow])) as Record<Attribute, number> } : {},
        ...st.hitPoints ? { hitPoints: st.hitPoints } : {}, ...st.growth ? { growth: st.growth } : {} };
    }
    const a = Canon.ancestries[raceId], c = this.classOf(classId);
    if (!a || !c) { throw new Error(`A person needs an ancestry and a class: ${raceId}/${classId ?? '-'}`); }
    const attributes: Partial<Record<Attribute, number>> = { ...a.attributes };
    for (const [k, v] of Object.entries(c.attributes)) {
      attributes[k as Attribute] = (attributes[k as Attribute] ?? 0) + v;
    }
    const features = this.features(classId, 0, level);
    return { hitDie: c.hitDie, attributes, abilities: [...c.abilities, ...features.abilities],
      traits: [...a.traits, ...features.traits], weapons: c.weapons, armor: c.armor };
  }
  // A level-1 character has its hit die plus its positive CON modifier (the pc template). A creature made above level 1
  // uses Orsino's NPC formula: max(2, round(hitDie + (level − 1) × hitDie / 2 + statMod(con))).
  // A creature's hit points: fixed, grown by Orsino's monster template, or rolled from its hit die.
  static health(chassis: Chassis, level: number, constitution: number): number {
    return chassis.hitPoints ?? (chassis.growth?.hitPoints ? this.grown(chassis.growth.hitPoints, level, constitution)
      : this.hitPoints(chassis.hitDie, level, constitution));
  }
  // Orsino's monster template: max(1, the line's hit points + statMod(con) + perLevel × level).
  static grown(growth: { base: number; perLevel: number }, level: number, constitution: number): number {
    return Math.max(1, growth.base + Fighting.statMod(constitution) + growth.perLevel * level);
  }
  static hitPoints(hitDie: number, level: number, constitution: number): number {
    const mod = Fighting.statMod(constitution);
    return level <= 1 ? Math.max(1, hitDie + Math.max(0, mod))
      : Math.max(2, Math.round(hitDie + ((level - 1) * hitDie) / 2 + mod));
  }
  // Combat.maxSpellSlotsForCombatant: 2 + level for everyone; a mage, cleric or bard adds a base and a multiple of the
  // positive modifier of intelligence, wisdom or charisma.
  static slots(classId: string | undefined, level: number, scores: Record<Attribute, number>): number {
    const s = this.classOf(classId)?.slots ?? { base: 0 };
    const mod = s.attribute ? Math.max(0, Fighting.statMod(scores[s.attribute])) : 0;
    return s.base + 2 + level + (s.multiplier ?? 0) * mod;
  }
  static executable(id: string): boolean {
    const a = Canon.abilities[id];
    return !!a && !a.unsupported;
  }
  // The spells of a tradition at one level that Kyr can execute, optionally within a school or domain.
  static spellbook(tradition: string, level: number, restriction?: string): string[] {
    return Object.entries(Canon.abilities).filter(([id, a]) => a.spell?.tradition === tradition
      && a.spell.level === level
      && this.executable(id) && (!restriction || a.spell.school === restriction || a.spell.domain === restriction))
      .map(([id]) => id).sort();
  }
  static proficient(p: Proficiencies, item: { kind?: string; weight?: string; type?: string }, field: 'kind' | 'type'): boolean {
    if (p.all) { return true; }
    if (p.kinds && !p.kinds.includes(item[field] ?? '')) { return false; }
    return !(p.weights && !p.weights.includes(item.weight ?? ''));
  }
  // Inventory.isProficient for weapons and armour. A creature without a class (a species) is proficient by nature.
  static canEquip(classId: string | undefined, itemKind: string): boolean {
    const c = this.classOf(classId), item = Canon.items[itemKind];
    if (!c || !item) { return true; }
    if (item.weapon && item.slot === 'weapon') { return this.proficient(c.proficiencies.weapons, item.weapon, 'kind'); }
    if (item.armor) { return this.proficient(c.proficiencies.armor, item.armor, 'type'); }
    return true;
  }
}
