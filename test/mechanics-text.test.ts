import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { MechanicsText } from '../src/presentation/mechanics-text';

const ability = (id: string) => Content.abilities.find(a => a.id === id)!;
const actor = { strength: 14, dexterity: 12, constitution: 12, intelligence: 10, wisdom: 15, charisma: 9, level: 3,
  bonusSpellDC: 0 };

describe('ability text comes from the typed mechanics', () => {
  it('states amounts, targets, saves, conditions and costs, specialized to the actor', () => {
    // A save is said by the quality the sheet says it rests on; the one bitten is "it" the second time; what it takes
    // and when it can be used again come last (M16 read "one enemy gains bleeding", "(usable again in 1 turn)").
    expect(MechanicsText.full(ability('rending_bite'))).toBe('1d6 (1–6) physical damage to one enemy; it is '
      + 'bleeding for 2 turns (a Constitution save against 11 avoids it). '
      + 'Bleeding: takes 1 bleed damage each turn. Again after a turn.');
    expect(MechanicsText.ability(ability('second_wind'), actor).summary).toBe('Heal yourself for 1d10 + 3 (4–13).');
    expect(MechanicsText.full(ability('breathe_fire'), actor))
      .toBe('2d6 + 6 (8–18) fire damage to every enemy (a Constitution save against 18 halves it; may cause burning: a '
        + 'Constitution save against 15 avoids it). Burning: takes 1d3 (1–3) fire damage each turn. Again after 3 turns.');
    expect(MechanicsText.condition('defending')).toBe('Defending: 2 harder to hit.');
    expect(MechanicsText.condition('blessed')).toBe('Blessed: +1 to hit, +1 damage.');
  });
  it('states the conditions a damage type sets off', () => {
    expect(MechanicsText.full(ability('breathe_fire'))).toContain('may cause burning: a Constitution save against 15 avoids it');
    expect(MechanicsText.full(ability('breathe_fire'))).toContain('Burning: takes 1d3 (1–3) fire damage each turn.');
  });
  it('never shows formula syntax for any catalog ability once an actor is known', () => {
    for (const a of Content.abilities) {
      const text = MechanicsText.full(a, actor);
      expect([a.id, text]).not.toEqual([a.id, expect.stringMatching(/#|statMod\(|bonusSpellDC/)]);
    }
  });
  // Found by an independent review of the deployed game: Prepare Charge said what it gave, and not that the next turn
  // could be nothing but the charge, so the company found itself unable to guard or flee.
  it('says what a condition binds its holder to, as well as what it gives', () => {
    expect(MechanicsText.condition('preparing_to_charge'))
      .toBe('Preparing to Charge: +2 to hit, +2 damage; and the next turn can only be Charge, nothing else.');
    expect(MechanicsText.condition('taunted')).toBe('Taunted: whoever has it can strike at nobody but whoever gave it.');
  });
  // What a condition does that no figure said: the M16 sheet gave "Inspired: +2 to hit" without its hit points,
  // "Charmed" with nothing, and a braced spear without the blow it gives a charging enemy.
  it('says what a condition does beyond its figures: hit points, sides changed, answers to what an enemy does', () => {
    expect(MechanicsText.condition('inspired')).toBe('Inspired: +2 to hit, +1 to every save, 5 more hit points (spent first).');
    expect(MechanicsText.condition('charmed')).toBe('Charmed: fights for the other side.');
    expect(MechanicsText.condition('braced')).toContain('Braced: against an enemy who charges, 3d8 + 1 (4–25) piercing '
      + 'damage to that enemy');
    expect(MechanicsText.condition('riposte')).toContain('when a blow misses them, weapon attack against the attacker');
    expect(MechanicsText.condition('guarded')).toBe('Guarded: someone stands in front of them and takes the blows meant '
      + 'for them.');
    expect(MechanicsText.full(ability('set_spear'))).toMatch(/^You are braced for 3 turns\./);
    expect(ability('set_spear').name).toBe('Set Spear');
  });
  it('a blow sets off each condition once, under its own name, not again under an alias', () => {
    const smash = ability('smash').effects[0]!;
    expect(MechanicsText.triggered(smash).map(([id]) => id)).toEqual(['stun']);
  });
});
