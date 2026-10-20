import { describe, expect, it } from 'bun:test';
import { buildSetting, Generator, Template, type DeemValue } from 'deem';
import tables from '../data/generation/tables/deem.tables.json';
import templates from '../data/generation/templates/deem.templates.json';
import { Creation } from '../src/rules/creation';
import { Fighting } from '../src/rules/fighting';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { CombatProjection } from '../src/combat-projection';
import { Battle } from '../src/battle';

class Stats {
  static setting = buildSetting(tables as unknown as Parameters<typeof buildSetting>[0], templates);
  static runtime = Template.bootstrapDeem({ seed: 'stat-contract' }, Stats.setting);
  static generate(parameters: Record<string, DeemValue>) {
    const options = { fixedHp: 0, hpBonus: 0, manaBonus: 0, slotScore: 10,
      slotBase: 0, slotMultiplier: 0, dexterity: 10, ...parameters,
      __setting: Stats.setting, __deemRuntime: Stats.runtime };
    return Generator.gen('creature_statistics', options) as Record<string, number>;
  }
}

describe('portable Deem arithmetic mirrors authoritative runtime rules', () => {
  it('agrees on HP across first/advanced levels, odd/even dice, and signed CON modifiers', () => {
    for (const hitDie of [3, 4, 7, 10, 20]) {
      for (const level of [1, 2, 3, 7]) {
        for (const constitution of [1, 3, 9, 10, 11, 15, 18, 35]) {
          const raw = Stats.generate({ hitDie, level, constitution });
          expect(raw.maxHp).toBe(Creation.hitPoints(hitDie, level, constitution));
        }
      }
    }
  });
  it('agrees on slots for every canonical class, including actual caster multipliers', () => {
    for (const [id, c] of Object.entries(Canon.classes)) {
      for (const score of [1, 9, 10, 11, 18, 35]) {
        for (const level of [1, 4, 12]) {
          const scores = { strength: score, dexterity: score, constitution: score,
            intelligence: score, wisdom: score, charisma: score };
          const raw = Stats.generate({ hitDie: c.hitDie, level, constitution: score,
            slotScore: c.slots.attribute ? scores[c.slots.attribute] : 10,
            slotBase: c.slots.base, slotMultiplier: c.slots.multiplier ?? 0 });
          expect(raw.maxMana).toBe(Creation.slots(id, level, scores));
        }
      }
    }
  });
  it('defines speed as a nonnegative, uncapped Dex modifier, not a movement rate', () => {
    for (const dexterity of [1, 3, 9, 10, 11, 18, 35, Number.MAX_SAFE_INTEGER]) {
      const raw = Stats.generate({ hitDie: 10, level: 1, constitution: 10, dexterity });
      expect(raw.speed).toBe(Math.max(0, Fighting.statMod(dexterity)));
      expect(Number.isSafeInteger(raw.speed)).toBe(true);
    }
    expect(Stats.generate({ hitDie: 10, level: 1, constitution: 10, dexterity: 18 }).speed).toBe(4);
    const a = new Content('speed').character('warrior', 'a', 'fighters');
    const b = new Content('speed').creature('wolf', 'b', 'goblins');
    const first = new Battle({ id: 'speed', combatants: [a, b], abilities: Content.abilities }, 'speed');
    const altered = structuredClone([a, b]);
    altered[0]!.speed = 100000;
    const second = new Battle({ id: 'speed', combatants: altered, abilities: Content.abilities }, 'speed');
    expect(first.events.find(e => e.type === 'initiative')).toEqual(second.events.find(e => e.type === 'initiative'));
    first.close(); second.close();
  });
  it('adds bonuses after HP/slot derivation and never adds derived outputs during finalization', () => {
    // A real adaptation contributes both valid bonuses and writes to reserved derived outputs.
    const extendedTables = structuredClone(tables) as Record<string, any>;
    extendedTables.environmentAdaptation.groups.stat_test = [{ _key: 'stat_test', _terrains: { any: true }, hpBonus: 3, manaBonus: 2,
      maxHp: 999, maxMana: 999, speed: 999 }];
    for (const rows of Object.values(extendedTables.creatureKinds.groups) as any[][]) {
      for (const row of rows) { row._adaptations.stat_test = true; row._adaptationTerrains.stat_test = { any: true }; }
    }
    const native = buildSetting(extendedTables, templates);
    const runtime = Template.bootstrapDeem({ seed: 'bonuses' }, native);
    const options = { family: 'construct', body: 'golem', material: 'stone',
      adaptation: 'stat_test', __setting: native, __deemRuntime: runtime };
    const raw = Generator.gen('creature', options) as Record<string, DeemValue>;
    expect(raw).toMatchObject({ maxHp: 20, maxMana: 5, speed: 0 });
    const bearOptions = { family: 'animal', body: 'bear', adaptation: 'stat_test',
      __setting: native, __deemRuntime: runtime };
    const bear = Generator.gen('creature', bearOptions) as Record<string, number>;
    expect(bear.maxHp).toBe(Creation.hitPoints(12, 1, bear.constitution!) + 3);
    expect(bear.maxMana).toBe(5);
    expect(CombatProjection.fighter(new Content('bonus').createCreature('golem', { family: 'construct', parameters: { material: 'none', role: 'none' } }), 'fighters')
      .maxHp).toBe(13);
  });
});
