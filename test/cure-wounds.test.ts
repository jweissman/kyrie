import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { FieldUse } from '../src/campaign/field-use';
import { Amounts } from '../src/rules/amounts';

// The cure family, the SRD's (doc/architecture/mission-22/srd-proving-cases.md, case 16): each its dice and a point a
// casting level, to its cap (Cure Light Wounds 1d8 to +5, Moderate 2d8 to +10, Serious 3d8 to +15, Critical 4d8 to
// +20), where Orsino's healed the same at every level. Light is at the SRD's first level; the other three keep Orsino's
// levels (3, 4, 6), which the preset companions' spells are chosen by. This spec is their play-identity test.
const mean = (id: string, castingLevel: number) => {
  const e = Content.abilities.find(a => a.id === id)!.effects[0]!;
  return Amounts.mean(e.kind === 'heal' && e.amount.kind === 'deem' ? e.amount.expression : '', { castingLevel });
};
const cleric = (level: number) => {
  const c = new Content('cure').createCreature('dori', { raceId: 'dwarf', classId: 'cleric', traits: ['vitalist'], level,
    spells: ['cure', 'bless', 'anoint', 'prayer', 'resist_fire', 'cure_moderate'], wisdom: 14 });
  c.state.hp = 1;
  return new CreatureStore([c]);
};
const healed = (level: number, seed: string) => FieldUse.perform(cleric(level), ['dori'],
  { ability: 'cure', caster: 'dori', target: 'dori', seed }).flatMap(e => e.type === 'heal' ? [e.amount] : []);
describe('the cure family, by the SRD\'s numbers', () => {
  it('heals its dice and a point a casting level, to its cap', () => {
    expect([1, 4, 5, 6, 20].map(l => mean('cure', l))).toEqual([5.5, 8.5, 9.5, 9.5, 9.5]);
    expect([1, 10, 11].map(l => mean('cure_moderate', l))).toEqual([10, 19, 19]);
    expect([1, 15, 16].map(l => mean('cure_serious', l))).toEqual([14.5, 28.5, 28.5]);
    expect([1, 20, 21].map(l => mean('cure_critical', l))).toEqual([19, 38, 38]);
    expect(['cure', 'cure_moderate', 'cure_serious', 'cure_critical']
      .map(id => Content.abilities.find(a => a.id === id)!.spell!.level)).toEqual([1, 3, 4, 6]);
  });
  it('mends a first-level cleric\'s wounds by 1d8 and one, a fifth-level\'s by 1d8 and five, the same die', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const [first] = healed(1, seed), [fifth] = healed(5, seed);
      expect(first).toBeGreaterThanOrEqual(2);
      expect(first).toBeLessThanOrEqual(9);
      expect(fifth! - first!).toBe(4);
    }
  });
});
