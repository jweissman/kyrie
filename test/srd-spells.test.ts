import { describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { SrdSpells } from '../src/canon/srd-spells';
import type { Ability } from '../src/canon/schema';

// The SRD's spells laid over the generated records (data/catalog/srd-spells.json, SrdSpells): what one conversion does
// to a spell, read on fixtures so it holds whatever the catalog converts.
const orsino = (id: string): Ability => structuredClone(Canon.abilities[id]!);
describe('a spell brought to the SRD', () => {
  it('takes its level, school, harm, kind and save, and says where they came from', () => {
    const fire = SrdSpells.converted({ ...orsino('fireball'), resist: { kind: 'magic', difficulty: '15 + #bonusSpellDC' } },
      { srd35: 'spell:fireball', level: 3, school: 'evocation', harm: 'roll(min(#level, 10), 6)', damageType: 'fire',
        save: 'reflex half' });
    expect(fire.spell).toMatchObject({ level: 3, school: 'evocation' });
    expect(fire.effects![0]).toMatchObject({ kind: 'damage', damageType: 'fire', onResist: 'half',
      amount: { kind: 'deem', expression: 'roll(min(#level, 10), 6)' } });
    expect(fire.resist).toEqual({ kind: 'reflex', difficulty: '15 + #bonusSpellDC' });
    expect(fire.source).toMatchObject({ srd35: 'spell:fireball', conversion: 'srd35-westernesse-v1' });
  });
  it('gives a save to a harm that had none, and takes it from one the SRD gives none', () => {
    const bare = { ...orsino('fireball') }; delete bare.resist;
    expect(SrdSpells.converted(bare, { srd35: 'spell:x', level: 3, school: 'evocation', save: 'will negates' }).resist)
      .toEqual({ kind: 'will', difficulty: SrdSpells.difficulty });
    const none = SrdSpells.converted({ ...orsino('fireball'), resist: { kind: 'magic', difficulty: '15' } },
      { srd35: 'spell:x', level: 1, school: 'evocation', save: 'none' });
    expect(none.resist).toBeUndefined();
    expect(none.effects!.some(e => e.onResist)).toBe(false);
  });
  it('keeps a save named for what it guards against, and takes the SRD\'s kind for one named by a score', () => {
    const held = SrdSpells.converted(orsino('hold_person'), { srd35: 'spell:hold-person', level: 2,
      school: 'enchantment', save: 'will negates' });
    expect(held.effects!.find(e => e.save)!.save!.kind).toBe(Canon.abilities.hold_person!.effects!.find(e => e.save)!
      .save!.kind);
    const plain = orsino('hold_person'); plain.effects!.find(e => e.save)!.save!.kind = 'fortitude';
    expect(SrdSpells.converted(plain, { srd35: 'spell:x', level: 2, school: 'enchantment', save: 'will negates' })
      .effects!.find(e => e.save)!.save!.kind).toBe('will');
  });
  it('refuses what it cannot read', () => {
    expect(SrdSpells.problems({ fireball: { srd35: 'spell:fireball', level: 3, school: 'evocation', harm: '1d6 >',
      save: 'reflex quarter', color: 'red' } as never, nothing: { srd35: 'spell:x', level: 1, school: 'x' } },
    Canon.abilities)).toEqual(['srd spell fireball: unknown field color', 'srd spell fireball: harm 1d6 > is not an amount',
      'srd spell fireball: save reflex quarter', 'srd spell nothing: no such spell']);
    expect(SrdSpells.problems(Canon.srdSpells, Canon.abilities)).toEqual([]);
  });
});
