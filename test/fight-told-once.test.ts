import { describe, expect, it } from 'bun:test';
import { CombatTelling } from '../src/ui/combat-telling';
import { Narration } from '../src/presentation/narration';
import type { BattleState, CombatEvent } from '../src/model';

// A fight's end is told once (the owner, 11 November late: the rats' last blow was told, then told again with its
// rolls, its rat falling and the fight won; then "The fight is over"; and back at the place, "You attack the rats",
// "The fight is won" and "The rats lie dead"). How a blow fell is its dice, not the blow again; the end of the fight
// is a sentence the scene after it knows to leave to the fight's own page (see Told.Happened).
describe('a fight ended', () => {
  const state = { combatants: [{ id: 'h', name: 'Hamo' }, { id: 'r', name: 'the third rat' }] } as unknown as BattleState;
  const last: CombatEvent[] = [{ type: 'action', turn: 5, command: { actor: 'h', ability: 'melee', target: 'r' } },
    { type: 'attack', turn: 5, actor: 'h', target: 'r', die: 17, need: 9, toHit: 2, armorClass: 7, weapon: 'battleaxe',
      success: true, critical: false },
    { type: 'damage', turn: 5, actor: 'h', target: 'r', rolled: 8, amount: 1, hp: 0, damageType: 'slashing' },
    { type: 'death', turn: 5, actor: 'r' } as unknown as CombatEvent,
    { type: 'end', turn: 5, outcome: 'fighters', reason: 'elimination' } as unknown as CombatEvent];
  it('tells the last blow once, and how it fell by its dice alone', () => {
    const [told] = CombatTelling.exchanges(last, state);
    expect(told!.text).toContain('The third rat falls.');
    expect(told!.detail).toContain('rolled 17, needed 9');
    expect(told!.detail).not.toMatch(/falls|fight is won/);
  });
  it('knows the sentence a fight ends with', () => {
    for (const end of ['The fight is won.', 'The fight is lost.', 'You are clear of the fight.']) {
      expect(Narration.ends.test(end)).toBe(true);
    }
    expect(Narration.ends.test('The rats under the corn-store lie dead.')).toBe(false);
  });
});
