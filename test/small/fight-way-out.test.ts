import { describe, expect, it } from 'bun:test';
import { ChoiceList } from '../../src/ui/choice-list';
import type { CombatScreen } from '../../src/ui/screen-types';

// A dangerous fight offers a response that is no attack beside the blow (the economy review, OR-1391, OR-1431): where
// the fight is reckoned grave or deadly, its way out stands as a section of its own after the blow (the hand draws it
// as a row of its own), not behind "Defend, wait or withdraw"; a fight reckoned fair keeps it there.
const ability = (id: string, name: string) => ({ id, name, text: '', cost: 0, price: '', cooldown: 0, scope: '',
  rank: 0, targets: [] });
const screen = (danger: string) => ({ turn: 1, actor: 'a', actorName: 'Ilse', ours: true, outcome: null, round: 1,
  abilities: [ability('melee', 'Strike'), ability('flee', 'Withdraw'), ability('defend', 'Defend')], foes: [], allies: [],
  order: [], laws: [], log: [], exchanges: [], danger }) as unknown as CombatScreen;
describe('a fight\'s way out', () => {
  it('stands beside the blow where the fight is grave or deadly, and with Other where it is not', () => {
    for (const danger of ['grave', 'deadly']) {
      const sections = ChoiceList.combat(screen(danger));
      expect(sections.map(s => s.id).slice(0, 2)).toEqual(['strike', 'away']);
      expect(sections.find(s => s.id === 'other')!.choices.some(c => /flee/.test(c.id))).toBe(false);
    }
    const fair = ChoiceList.combat(screen('fair'));
    expect(fair.some(s => s.id === 'away')).toBe(false);
    expect(fair.find(s => s.id === 'other')!.choices.length).toBe(2);
  });
});
