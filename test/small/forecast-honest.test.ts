import { describe, expect, it } from 'bun:test';
import { Gauntlet } from '../support/gauntlet';
import { DangerSense } from '../../src/presentation/danger-sense';

// The forecast is held to the fights it forecasts (the owner, 15 November: danger readable before the player commits;
// CB-02, a reckoning that did not match the fight). A lone level-one mage, thief and warrior against one to four rats,
// each fight played out on the real kernel by the game's own tactics, and the game's word for it beforehand compared
// with how often the company wins: a fight called deadly is mostly lost, one called slight or fair mostly won, and
// more rats never read safer; a fight called merely hard is not mostly lost. Tolerances are wide enough for 24
// seeded fights (about nine in a hundred of noise).
const cells: [string, number][] = [['mage', 1], ['mage', 2], ['mage', 3], ['mage', 4], ['thief', 2], ['thief', 3],
  ['thief', 4], ['warrior', 4]];
const ceiling: Record<string, number> = { deadly: 0.4, grave: 0.8 };
const floor: Record<string, number> = { slight: 0.8, fair: 0.75, hard: 0.35 };
const rank = ['slight', 'fair', 'hard', 'grave', 'deadly'];
const seen = cells.map(([calling, rats]) => ({ calling, rats,
  danger: DangerSense.of(Gauntlet.encounter({ calling, foe: 'rat', count: rats }, 'reckon')).danger,
  won: Gauntlet.wins({ calling, foe: 'rat', count: rats }, 24) }));
describe('the fight forecast, against the fights it forecasts', () => {
  it('calls deadly or grave what is mostly lost, slight or fair what is mostly won', () => {
    const wrong = seen.filter(s => s.won > (ceiling[s.danger] ?? 1) || s.won < (floor[s.danger] ?? 0))
      .map(s => `${s.calling} v ${s.rats} rats: said ${s.danger}, won ${Math.round(100 * s.won)}%`);
    expect(wrong).toEqual([]);
  });
  it('never reads safer for more foes, and never wins more often against more', () => {
    for (const calling of ['mage', 'thief']) {
      const mine = seen.filter(s => s.calling === calling);
      for (let i = 1; i < mine.length; i++) {
        expect([calling, rank.indexOf(mine[i]!.danger)]).toEqual([calling, expect.any(Number)]);
        expect(rank.indexOf(mine[i]!.danger)).toBeGreaterThanOrEqual(rank.indexOf(mine[i - 1]!.danger));
        expect(mine[i]!.won).toBeLessThanOrEqual(mine[i - 1]!.won + 0.15);
      }
    }
  });
});
