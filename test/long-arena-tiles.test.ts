import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

describe('the keeper\'s tile game', () => {
  it('keeps an unfinished game through a save and permits stopping early', async () => {
    const j = await Journey.start(campaign, 'tile-game-save');
    Placed.at(j, 'tallow__lc_ring');
    await j.play('Ask about the numbered tiles by the pool');
    const gold = j.measure('quantity', 'party', 'gold');
    await j.play('Pay one coin to play the keeper\'s tile game', 'Draw another numbered tile');
    const total = j.measure('lcStonesTotal', 'party');
    const saved = JSON.parse(JSON.stringify(j.session.checkpoint()));
    const resumed = Journey.of(PlaySession.resume(saved, { trusted: true }));
    expect(resumed.measure('lcStonesTotal', 'party')).toBe(total);
    expect(resumed.offers('Draw another numbered tile')).toBe(true);
    await resumed.play('End the tile game without a prize');
    expect(resumed.measure('quantity', 'party', 'gold')).toBe(gold - 1);
    expect(resumed.offers('Draw another numbered tile')).toBe(false);
  }, 10000);

  it('lets the player risk a draw, see the total and settle the actual wager', async () => {
    const outcomes = new Set<boolean>();
    for (let seed = 0; seed < 4; seed++) {
      const j = await Journey.start(campaign, `tile-game-${seed}`);
      Placed.at(j, 'tallow__lc_ring');
      expect(j.offers('Pay one coin to play the keeper\'s tile game')).toBe(false);
      await j.play('Ask about the numbered tiles by the pool');
      const gold = j.measure('quantity', 'party', 'gold');
      const purse = j.measure('quantity', 'lc_ring_keeper', 'gold');
      await j.play('Pay one coin to play the keeper\'s tile game');
      expect(j.measure('quantity', 'party', 'gold')).toBe(gold - 1);
      let total = 0;
      while (total < 5) {
        expect(j.offers('Draw another numbered tile')).toBe(true);
        const watch = j.watch();
        await j.play('Draw another numbered tile');
        expect(j.watch()).toBe(watch + 1);
        const next = j.measure('lcStonesTotal', 'party');
        expect(next - total).toBeGreaterThanOrEqual(1);
        expect(next - total).toBeLessThanOrEqual(3);
        expect(j.latest).toContain(next > 6 ? 'more than six' : ['zero', 'one', 'two', 'three', 'four', 'five', 'six'][next]!);
        total = next;
      }
      const won = total <= 6;
      outcomes.add(won);
      expect(j.offers('Stop and collect three coin')).toBe(won);
      await j.play(won ? 'Stop and collect three coin' : 'End the tile game without a prize');
      expect(j.measure('quantity', 'party', 'gold')).toBe(gold - 1 + (won ? 3 : 0));
      expect(j.measure('quantity', 'lc_ring_keeper', 'gold')).toBe(purse + 1 - (won ? 3 : 0));
      expect(j.offers('Pay one coin to play the keeper\'s tile game')).toBe(false);
      await j.play('==+12');
      expect(j.offers('Pay one coin to play the keeper\'s tile game')).toBe(true);
    }
    expect(outcomes).toEqual(new Set([true, false]));
  }, 10000);
});
