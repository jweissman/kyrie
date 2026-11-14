import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ScreenModel } from '../../src/ui/screen-model';

// Asking someone to join says what it costs, where it costs anything (the terminal line's play: Cyril's 6 coin was
// said only in her earlier reply), and says nothing of coin where it is free.
const inn = (fee: number) => `
  Place taproom "the taproom" is room at 0, 0.
  Company party "You" of 1 at taproom.
  Person cyril "Cyril" at taproom { Role "a scholar for hire". Ancestry human. Calling cleric. Peaceable. Pronouns she. }
  Initially Assert willing(cyril, party). Initially Set hire(cyril) to ${fee}.`;
describe('asking someone to join', () => {
  it('says the price where there is one, and none where it is free', async () => {
    const label = async (fee: number) => {
      const t = await Tiny.start(inn(fee));
      t.journey.coin(10);
      return ScreenModel.build(t.campaign).people.flatMap(p => p.acts).find(a => a.does === 'recruit')?.label;
    };
    expect(await label(6)).toBe('Ask Cyril to join the company — 6 coin');
    expect(await label(0)).toBe('Ask Cyril to join the company');
  });
});
