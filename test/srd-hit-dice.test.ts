import { describe, expect, it } from 'bun:test';
import { Amounts } from '../src/rules/amounts';
import { Content } from '../src/content';
import { CanonRuntime } from '../src/canon/canon-runtime';
import { Creation } from '../src/rules/creation';
import { Effects } from '../src/effects';
import { Expressions } from '../src/expressions';
import { ModifierSet } from '../src/rules/modifiers';
import { Canon } from '../src/canon/canon';
import { Fighting } from '../src/rules/fighting';
import type { Effect } from '../src/lang/parse';

// Dice wherever a number is wanted (the SRD adaptation briefing, §1). Hit Dice are an Amount like an effect's harm;
// their mean is worked out from the expression (never sampled), and listed rounded down as the SRD prints it; a kind
// with them is a fixed stat block, which no level it is met at grows.
describe('the mean of dice', () => {
  it.each([['3d8+4', 17.5, 17], ['2d12', 13, 13], ['1d6', 3.5, 3], ['2d6*2+1', 15, 15], ['4d8+11', 29, 29],
    ['(1d4+1)/2', 1.75, 1], ['10', 10, 10], ['1d2-1', 0.5, 1]])('%s is %d, listed %d', (dice, mean, listed) => {
    expect(Amounts.mean(dice)).toBe(mean);
    expect(Amounts.listed(dice)).toBe(listed);
  });
  it('reads a creature\'s quantities, and refuses what has no exact mean', () => {
    expect(Amounts.mean('1d6 + #level', { level: 4 })).toBe(7.5);
    expect(() => Amounts.mean('statMod(12)')).toThrow('No mean for a function');
    expect(() => Amounts.mean('1d6 > 3')).toThrow('No mean for a test');
    // Deem reads a bare "d6" as a word, not a die: a catalog writes 1d6.
    expect(() => Amounts.mean('d6')).toThrow('No value for d6');
    expect(Amounts.dice('2d12+3')).toEqual([{ count: 2, sides: 12 }]);
  });
});

// Every catalog field the schema calls an amount (or Orsino's Dice) takes dice, read through its own path: the table
// gives a field, a record holding "2d4+1" there, and the path that reads it. Each must accept it and throw within
// 3..9 (the mean 6 where the path is the mean).
const dice = '2d4+1', expressions = new Expressions('amount-fields');
const ability = (effects: Effect[]) => CanonRuntime.ability('t', { name: 't', kind: 'technique', effects });
const fields: [string, () => number][] = [
  ['an ability\'s compact effect', () => {
    const a = CanonRuntime.ability('t', { name: 't', kind: 'technique', effect: `Deal (${dice}) fire damage to enemy.` });
    return expressions.amount((a.effects[0] as unknown as { amount: never }).amount, {});
  }],
  ['a typed effect\'s amount', () => expressions.amount(Amounts.of(dice), {})],
  ['an effect save\'s difficulty', () => {
    const e: Effect = { kind: 'damage', amount: Amounts.of('1'), damageType: 'fire', target: 'enemy',
      save: { kind: 'reflex', difficulty: Amounts.of(dice) } };
    Effects.validate(ability([e]).effects[0]!, []);
    return expressions.amount(e.save!.difficulty, {});
  }],
  ['an ability\'s resist difficulty', () => {
    const a = CanonRuntime.ability('t', { name: 't', kind: 'spell', effect: 'Deal (1) fire damage to enemy.',
      resist: { kind: 'magic', difficulty: dice } });
    return expressions.amount(a.resist!.difficulty, {});
  }],
  ...(['bonusDamage', 'bonusMeleeDamage', 'bonusHealing'] as const).map((key): [string, () => number] =>
    [`the ${key} modifier`, () => {
      ModifierSet.validate({ [key]: dice }, 't', { saveKinds: [], damageTypes: [] });
      return Effects.dice(dice, { expressions } as never);
    }]),
  ['a condition\'s tempHp', () => expressions.number(dice, {})],
  ['a turn-end tick\'s amount', () => {
    ModifierSet.validate({ onTurnEnd: [{ kind: 'heal', amount: dice }] }, 't', { saveKinds: [], damageTypes: [] });
    return expressions.number(dice, {});
  }],
  ['a weapon\'s damage', () => {
    expect(/^\d+d\d+([+-]\d+)?$/.test(dice)).toBe(true);
    return Fighting.weaponDamage({ level: 1, strength: 10, dexterity: 10, armorAc: 0, modifiers: {},
      weapon: { id: 'w', name: 'w', damage: dice, type: 'slashing' } }, expressions.number(dice), false).amount;
  }],
  ['a kind\'s Hit Dice', () => Creation.health({ hitDie: 0, attributes: {}, abilities: [], traits: [], weapons: [],
    armor: [], hitDice: dice }, 1, 10)],
];
describe('every amount field takes dice', () => {
  it.each(fields)('%s', (_field, read) => {
    const value = read();
    expect(value).toBeGreaterThanOrEqual(3);
    expect(value).toBeLessThanOrEqual(9);
  });
});

// The unicorn is a fixed stat block of 4d10+20 (the SRD's 42 hit points). Made at any level, its hit points and
// qualities are its own; rolled, the same dice are thrown from its own seed, the same each time for one seed. (The
// ghoul was the example until its SRD stat block was withdrawn on 13 November: placed where Orsino's ghoul had been,
// in the first town's ossuary, a brood of them killed a first-level warrior; see srd-invariants.md.)
describe('a kind with Hit Dice', () => {
  const content = new Content('hit-dice');
  it('has their listed average whatever level it is made at, and no growth of its qualities', () => {
    const made = [1, 3, 7, 12].map(level => content.createCreature(`u${level}`, { raceId: 'unicorn', level }));
    expect(made.map(c => c.base.maxHp)).toEqual([42, 42, 42, 42]);
    expect(new Set(made.map(c => c.base.strength)).size).toBe(1);
    expect(Canon.creature('unicorn').statistics?.growth).toBeUndefined();
  });
  it('rolls the same expression from its seed when its dice are rolled', () => {
    const rolled = [1, 2, 3, 4, 5, 6].map(n => content.createCreature(`r${n}`, { raceId: 'unicorn', hitPoints: 'rolled' }));
    for (const r of rolled) {
      expect(r.base.maxHp).toBeGreaterThanOrEqual(24);
      expect(r.base.maxHp).toBeLessThanOrEqual(60);
    }
    expect(new Set(rolled.map(r => r.base.maxHp)).size).toBeGreaterThan(1);
    expect(content.createCreature('r1', { raceId: 'unicorn', hitPoints: 'rolled' }).base.maxHp).toBe(rolled[0]!.base.maxHp);
  });
  it('keeps its count of Hit Dice for effects that read it, apart from its level', () => {
    const unicorn = content.creature('unicorn', 'u', 'goblins', 5);
    expect(Effects.context(unicorn).hitDice).toBe(4);
    expect(Effects.context(unicorn).level).toBe(5);
    expect(Effects.context(content.creature('wolf', 'w', 'goblins', 3)).hitDice).toBe(3);
  });
});
