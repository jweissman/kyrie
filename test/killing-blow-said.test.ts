import { describe, expect, it } from 'bun:test';
import { CombatPresenter } from '../src/ui/combat-presenter';
import type { CombatEvent } from '../src/model';

// A killing blow is told by its weight ("for 13"), and the dice line under it says what it took and why the two
// differ (round 10, both players: "for 13" over "takes 1 slashing damage (roll 13)").
describe('a killing blow\'s dice', () => {
  const state = { combatants: [{ id: 'g', name: 'the ghoul', side: 'foe', hp: 0, maxHp: 9 }], turn: 1, actor: '',
    outcome: null } as unknown as Parameters<typeof CombatPresenter.format>[1];
  const blow = (amount: number, rolled: number, hp: number) => CombatPresenter.format({ type: 'damage', turn: 1,
    actor: 'x', target: 'g', rolled, amount, hp, damageType: 'slashing' } as CombatEvent, state);
  it('says what was left when the roll was more', () => {
    expect(blow(1, 13, 0)).toMatch(/roll 13, 1 was all it had left/);
  });
  it('says nothing more of a blow that did not kill, or took all it rolled', () => {
    expect(blow(5, 5, 0)).not.toMatch(/all it had left/);
    expect(blow(4, 4, 3)).not.toMatch(/all it had left/);
  });
});
