import { describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { CombatProjection } from '../src/combat-projection';
import { Content } from '../src/content';
import { Effects, type EffectContext } from '../src/effects';
import { Targeting } from '../src/targeting';

// Orsino's reflect, executed (it had been only represented): a share of each blow its holder takes goes back on
// whoever dealt it, through that one's own defences, and the holder takes the rest; never true damage, nor a blow
// itself reflected. Its three strengths are Orsino's: a quarter, a half, three quarters.
describe('a reflection', () => {
  it('sends a share of each blow back on whoever dealt it, and the holder takes the rest', () => {
    expect(['minor_reflect', 'reflect', 'major_reflect'].map(id => Canon.conditions[id]!.modifiers.reflectDamagePercent))
      .toEqual([0.25, 0.5, 0.75]);
    expect(Canon.abilities.reflection!.unsupported).toBeUndefined();
    const content = new Content('mirror');
    const mage = CombatProjection.fighter(content.createCreature('mage', { raceId: 'human', classId: 'mage', level: 9 }),
      'fighters');
    const brute = CombatProjection.fighter(content.createCreature('brute', { raceId: 'human', classId: 'warrior', level: 9 }),
      'goblins');
    mage.statuses.push({ id: 'reflect', remaining: 3 });
    const context = (actor: typeof mage): EffectContext => ({ actor, fighters: [mage, brute], turn: 1, events: [],
      content, abilities: [], retreat: false, location: null });
    const [mageHp, bruteHp] = [mage.hp, brute.hp];
    Effects.damage(mage, { amount: 10, type: 'force' }, context(brute));
    // The mage takes half; half goes back on the brute, who takes it less what his own defences turn.
    const back = bruteHp - brute.hp;
    expect([mageHp - mage.hp, back > 0 && back <= 5]).toEqual([5, true]);
    // True damage is not reflected.
    Effects.damage(mage, { amount: 4, type: 'true' }, context(brute));
    expect([mageHp - mage.hp, bruteHp - brute.hp]).toEqual([9, back]);
  });
});

// Orsino's invisible, executed: no one picks an invisible creature out as the one foe they go for, unless they see
// the invisible (truesight); what falls on every foe falls on it too.
describe('the invisible', () => {
  it('are not gone for one by one, unless the invisible are seen', () => {
    const content = new Content('unseen');
    const thief = CombatProjection.fighter(content.createCreature('thief', { raceId: 'human', classId: 'thief', level: 3 }),
      'fighters');
    const guard = CombatProjection.fighter(content.createCreature('guard', { raceId: 'human', classId: 'warrior', level: 3 }),
      'goblins');
    thief.statuses.push({ id: 'invisible', remaining: 3 });
    const fighters = [thief, guard];
    expect(Targeting.candidates('enemy', guard, fighters).map(f => f.id)).toEqual([]);
    expect(Targeting.candidates('enemies', guard, fighters).map(f => f.id)).toEqual(['thief']);
    guard.statuses.push({ id: 'truesight', remaining: 3 });
    expect(Targeting.candidates('enemy', guard, fighters).map(f => f.id)).toEqual(['thief']);
  });
});
