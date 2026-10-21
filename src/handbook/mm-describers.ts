import { OrsinoAppendix, type Definition } from './orsino-appendix';

// How each of Orsino's creature families reads in the Monster Manual's appendix.
export class MonsterDescribers {
  static monsterClass(this: void, d: Definition): [string, string][] {
    return [['Stat line', `${OrsinoAppendix.scores(d.monsterStat as Definition)}, base ${d.monsterStatBase as number}`],
      ['Weapon', String(d.monsterWeapon)], ['Hide', String(d.monsterNaturalArmor)],
      ['Attacks a turn', String(d.monsterAttacksPerTurn ?? 1)], ['Worth', `${d.monsterXp as number} experience`],
      ['Gold', String(d.monsterGold ?? '—')], ['Traits', OrsinoAppendix.list(d.monsterTraits)],
      ['Abilities', OrsinoAppendix.list(d.monsterAbilities)], ['Kinds', OrsinoAppendix.list(d.monsterKind)]];
  }
  static monsterType(this: void, d: Definition): [string, string][] {
    const m = (d.monsterTypeModifier ?? {}) as Definition;
    return [['Class', String(d.monsterTypeClass)], ['Changes', OrsinoAppendix.scores(m) || '—'],
      ['Traits', OrsinoAppendix.list(m.traits) || '—'], ['Abilities', OrsinoAppendix.list(d.monsterTypeAbilities) || '—']];
  }
  static animal(this: void, d: Definition): [string, string][] {
    return [['Stat line', OrsinoAppendix.scores(d)], ['Weapon', String(d.weapon)], ['Hide', String(d.body)]];
  }
  static elemental(this: void, d: Definition): [string, string][] {
    const m = (d.elementalModifiers ?? {}) as Definition;
    return [['Traits', OrsinoAppendix.list(m.traits) || '—'], ['Abilities', OrsinoAppendix.list(d.elementalAbilities) || '—']];
  }
  static overlay(this: void, d: Definition): string { return OrsinoAppendix.scores((d.creatureAspects ?? {}) as Definition) || '—'; }
  static aspectAbilities(this: void, d: Definition): string { return OrsinoAppendix.list(d.creatureAspectAbilities) || '—'; }
  static rank(this: void, d: Definition): string {
    return Object.entries(d).map(([k, v]) => `${k === 'maxHp' ? 'hit points' : k} ${(v as number) > 0 ? '+' : ''}${v as number}`)
      .join(', ') || '—';
  }
  static weapon(this: void, d: Definition): string { return String(d.weapon ?? '—').replace(/_/g, ' '); }
  static description(this: void, d: Definition): string { return String(d.description ?? ''); }
  static scores(this: void, d: Definition): string { return OrsinoAppendix.scores(d) || '—'; }
  static abilities(this: void, d: Definition): string { return OrsinoAppendix.list(d.abilities) || '—'; }
  static role(this: void, d: Definition): string { return String(d.role ?? '—'); }
}
