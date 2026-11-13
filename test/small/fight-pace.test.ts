import { describe, expect, it } from 'bun:test';
import { ChoiceList } from '../../src/ui/choice-list';
import type { CombatScreen } from '../../src/ui/screen-types';

// The fight's pace is acts like any other, with ids and commands (CN-04, CN-06): "Let … fight this turn" and "Press on
// to the end" had been the page's own buttons, outside the contract, so they could not go in the hand as rows. Press on
// is offered only when the fight is as good as won.
const fighter = (id: string, hp: number, maxHp = 10) => ({ id, name: id, line: '', hp, maxHp, mana: 0, maxMana: 0,
  statuses: [], acting: false, down: hp <= 0 });
const fight = (foe: number, ally: number, ours = true) => ({ turn: 1, actor: 'wynn', actorName: 'Wynn', ours,
  outcome: null, round: 1, foes: [fighter('rat', foe)], allies: [fighter('wynn', ally)], abilities: [] }) as unknown as
  CombatScreen;
const pace = (c: CombatScreen) => ChoiceList.combat(c).find(s => s.id === 'pace')?.choices
  .map(x => [x.id, x.command, x.label]);

describe('the fight\'s pace', () => {
  it('lets the one whose turn it is fight it, by its own command', () => {
    expect(pace(fight(10, 10))).toEqual([['fight:auto', 'fight:auto', 'Let Wynn fight this turn']]);
  });
  it('offers to press on to the end only when the fight is as good as won', () => {
    expect(pace(fight(4, 9))?.map(x => x[0])).toEqual(['fight:auto', 'fight:through']);
    expect(pace(fight(4, 4))?.map(x => x[0])).toEqual(['fight:auto']);
  });
  it('is nothing when it is not the company\'s turn', () => {
    expect(pace(fight(10, 10, false))).toBeUndefined();
  });
});
