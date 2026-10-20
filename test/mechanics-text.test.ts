import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { MechanicsText } from '../src/presentation/mechanics-text';

const ability = (id: string) => Content.abilities.find(a => a.id === id)!;
const actor = { strength: 14, dexterity: 12, constitution: 12, intelligence: 10, wisdom: 15, charisma: 9, level: 3,
  bonusSpellDC: 0 };

describe('ability text comes from the typed mechanics', () => {
  it('states amounts, targets, saves, conditions and costs, specialized to the actor', () => {
    expect(MechanicsText.full(ability('rending_bite'))).toBe('1d6 (1–6) physical damage to one enemy; one enemy gains '
      + 'bleeding for 2 turns (a constitution save against 11 avoids it). (usable again in 1 turn) '
      + 'Bleeding: takes 1 bleed damage each turn.');
    expect(MechanicsText.ability(ability('second_wind'), actor).summary).toBe('Heal yourself for 1d10 + 3 (4–13).');
    expect(MechanicsText.ability(ability('breathe_fire'), actor).summary)
      .toBe('2d6 + 6 (8–18) fire damage to every enemy (a breath save against 18 halves it; may cause burning: a '
        + 'fortitude save against 15 avoids it). (usable again in 3 turns)');
    expect(MechanicsText.condition('defending')).toBe('Defending: 2 harder to hit.');
    expect(MechanicsText.condition('blessed')).toBe('Blessed: +1 to hit, +1 damage.');
  });
  it('states the conditions a damage type sets off', () => {
    expect(MechanicsText.full(ability('breathe_fire'))).toContain('may cause burning: a fortitude save against 15 avoids it');
    expect(MechanicsText.full(ability('breathe_fire'))).toContain('Burning: takes 1d3 (1–3) fire damage each turn.');
  });
  it('never shows formula syntax for any catalog ability once an actor is known', () => {
    for (const a of Content.abilities) {
      const text = MechanicsText.full(a, actor);
      expect([a.id, text]).not.toEqual([a.id, expect.stringMatching(/#|statMod\(|bonusSpellDC/)]);
    }
  });
});
