import { describe, expect, it } from 'bun:test';
import { Rolls } from '../src/rules/rolls';
import { Canon } from '../src/canon/canon';

// A new character's six rolls are placed where the calling wants them, the highest on what it adds most to (the cold
// evaluation's "Warrior, Str 8 … Int 17" read as random rather than as a start).
describe('six rolls for a calling', () => {
  const rolled = { strength: 8, dexterity: 18, intelligence: 17, wisdom: 10, constitution: 14, charisma: 12 };
  it('puts the highest on what the calling adds most to, keeping every roll', () => {
    const warrior = Rolls.suited(rolled, Canon.classes.warrior!.attributes);
    expect([warrior.strength, warrior.constitution]).toEqual([18, 17]);
    expect(Object.values(warrior).sort()).toEqual(Object.values(rolled).sort());
    expect(Object.keys(warrior)).toEqual(Object.keys(rolled));
    expect(Rolls.suited(rolled, Canon.classes.mage!.attributes).intelligence).toBe(18);
    expect(Rolls.suited(rolled, Canon.classes.bard!.attributes).charisma).toBe(18);
  });
});
