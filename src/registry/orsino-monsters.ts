import type { RegistryEntry } from './orsino-extract';

type Score = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export interface MonsterChoice {
  monsterClass: string; monsterType: string; aspect: string; terrain: string; rank: string; level: number;
  color?: string; substance?: string;
}
export interface MonsterStep { step: string; source: string; values: Record<string, unknown> }
export interface MonsterDerivation {
  choice: MonsterChoice; scores: Record<Score, number>; hitPoints: number; weapon: string; naturalArmor: string;
  traits: string[]; abilities: string[]; attacksPerTurn: number; xp: number; gold: string;
  unapplied: Record<string, unknown>; steps: MonsterStep[];
}

// Orsino's `monster` generation template, step by step, with every random choice made explicit. It reads only
// registry entries and reproduces the template's own arithmetic (overlays add numbers, concatenate arrays and replace
// strings; hit points use Orsino's statMod), so a Kyr creature built from it can be checked against the source.
export class OrsinoMonsters {
  static readonly scores: Score[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  static statMod(score: number): number { return Math.round((score - 10) / 2); }
  static compose(entry: (id: string) => RegistryEntry, choice: MonsterChoice): MonsterDerivation {
    const steps: MonsterStep[] = [];
    const klass = entry(`monsterClass:${choice.monsterClass}`).definition as Record<string, unknown>;
    const type = entry(`monsterType:${choice.monsterType}`).definition as Record<string, unknown>;
    if (type.monsterTypeClass !== choice.monsterClass) { throw new Error(`${choice.monsterType} is not a ${choice.monsterClass}`); }
    const line = klass.monsterStat as Record<string, number>, base = klass.monsterStatBase as number;
    const record: Record<string, unknown> = Object.fromEntries(this.scores.map(k =>
      [k, Math.max(3, (line[k] ?? 0) + base + Math.round(choice.level / 8))]));
    steps.push({ step: 'stat line', source: `monsterClass:${choice.monsterClass}`, values: { ...record, statBase: base } });
    record.weapon = klass.monsterWeapon;
    record.traits = [...this.first(klass.monsterTraits)];
    const aspect = entry(`aspect:${choice.aspect}`).definition as Record<string, unknown>;
    record.abilities = [...new Set([...this.first(klass.monsterAbilities), ...this.list(type.monsterTypeAbilities),
      ...this.list(aspect.creatureAspectAbilities)])];
    steps.push({ step: 'natural equipment, traits and abilities', source: `monsterClass:${choice.monsterClass}`,
      values: { weapon: record.weapon, traits: record.traits, abilities: record.abilities } });
    const terrain = (entry(`terrain:${choice.terrain}`).definition as Record<string, unknown>).terrainModifier;
    for (const [step, source, overlay] of [
      ['terrain', `terrain:${choice.terrain}`, terrain],
      ['aspect', `aspect:${choice.aspect}`, aspect.creatureAspects],
      ['monster type', `monsterType:${choice.monsterType}`, type.monsterTypeModifier],
      ...choice.substance ? [['golem substance', `golemSubstance:${choice.substance}`,
        entry(`golemSubstance:${choice.substance}`).definition]] : [],
      ...choice.color ? [['dragon colour', `dragonColor:${choice.color}`,
        entry(`dragonColor:${choice.color}`).definition]] : [],
    ] as [string, string, unknown][]) {
      steps.push({ step, source, values: this.overlay(record, overlay) });
    }
    const hitPoints = Math.max(1, line.hp! + this.statMod(record.con as number) + choice.level * 3);
    steps.push({ step: 'hit points', source: 'template:monster', values: { hitPoints,
      formula: 'max(1, statLine.hp + statMod(con) + level * 3)' } });
    const rank = entry(`monsterRank:${choice.rank}`).definition as Record<string, unknown>;
    steps.push({ step: 'rank', source: `monsterRank:${choice.rank}`, values: { ...rank,
      note: 'Overlaid as fields maxHp and ac, which the combatant does not read; hit points are unchanged.' } });
    const scores = Object.fromEntries(this.scores.map(k => [k, record[k] as number])) as Record<Score, number>;
    return { choice, scores,
      hitPoints, weapon: record.weapon as string, naturalArmor: klass.monsterNaturalArmor as string,
      traits: record.traits as string[], abilities: record.abilities as string[],
      attacksPerTurn: klass.monsterAttacksPerTurn as number, xp: (klass.monsterXp as number) + 50 * choice.level,
      gold: klass.monsterGold as string, unapplied: rank, steps };
  }
  // Template overlay semantics (Template.assembleProperties): numbers add, arrays concatenate, strings replace.
  private static overlay(record: Record<string, unknown>, overlay: unknown): Record<string, unknown> {
    const changed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries((overlay ?? {}) as Record<string, unknown>)) {
      if (key === 'description') { continue; }
      if (typeof value === 'number') { record[key] = ((record[key] as number | undefined) ?? 0) + value; }
      else if (Array.isArray(value)) { record[key] = [...(record[key] as unknown[] | undefined) ?? [], ...value]; }
      else if (typeof value === 'string') { record[key] = value; }
      else { throw new Error(`Unsupported overlay value for ${key}`); }
      changed[key] = record[key];
    }
    return changed;
  }
  private static first(value: unknown): string[] {
    const list = value as unknown[];
    return (Array.isArray(list[0]) ? list[0] : list) as string[];
  }
  private static list(value: unknown): string[] { return (value as string[] | undefined) ?? []; }
}
