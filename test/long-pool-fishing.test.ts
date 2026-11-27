import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

const cast = async (seed: number) => {
  const j = await Journey.start(campaign, `fishing-${seed}`);
  Placed.at(j, 'tallow__lc_ring');
  await j.play('Ask whether anything lives in the pool', 'Cast the keeper\'s line into the pool');
  return j;
};

describe('fishing the keeper\'s pool', () => {
  it('reads either bite, then smokes a real ration over six hours', async () => {
    for (const [seed, bite] of [[1, 2], [10, 1]] as const) {
      const j = await cast(seed);
      expect(j.measure('lcPoolBite', 'party')).toBe(bite);
      expect(j.latest).toContain(bite === 1 ? 'taps lightly' : 'pulls hard');
      await j.play(bite === 1 ? 'Pull the line steadily' : 'Give the line slack');
      expect(j.holds('lcPoolDrying', 'party')).toBe(true);
      const due = j.measure('lcPoolReady', 'party');
      expect(due - j.watch()).toBe(36);
      const saved = JSON.parse(JSON.stringify(j.session.checkpoint()));
      const resumed = Journey.of(PlaySession.resume(saved, { trusted: true }));
      await resumed.play(`==${due - 1}`);
      expect(resumed.offers('Collect the smoked eel')).toBe(false);
      await resumed.play('==+1');
      const food = resumed.measure('quantity', 'party', 'rations');
      await resumed.play('Collect the smoked eel');
      expect(resumed.measure('quantity', 'party', 'rations')).toBe(food + 1);
      expect(resumed.offers('Collect the smoked eel')).toBe(false);
    }
  }, 10000);

  it('loses the catch on the wrong response and lets the pool settle', async () => {
    for (const [seed, bite] of [[1, 2], [10, 1]] as const) {
      const j = await cast(seed);
      expect(j.measure('lcPoolBite', 'party')).toBe(bite);
      await j.play(bite === 1 ? 'Give the line slack' : 'Pull the line steadily');
      expect(j.holds('lcPoolDrying', 'party')).toBe(false);
      expect(j.offers('Cast the keeper\'s line into the pool')).toBe(false);
      expect(j.measure('lcPoolAgain', 'party') - j.watch()).toBe(12);
      await j.play(`==${j.measure('lcPoolAgain', 'party')}`);
      expect(j.offers('Cast the keeper\'s line into the pool')).toBe(true);
    }
  }, 10000);

  it('sometimes has no bite at all', async () => {
    const j = await cast(0);
    expect(j.measure('lcPoolBite', 'party')).toBe(0);
    expect(j.latest).toContain('The pool is quiet');
    expect(j.offers('Pull the line steadily')).toBe(false);
  }, 10000);

  it('does not leave an unattended bite waiting indefinitely', async () => {
    const j = await cast(10);
    expect(j.measure('lcPoolBite', 'party')).toBe(1);
    await j.play(`==${j.measure('lcPoolBiteDue', 'party')}`);
    expect(j.measure('lcPoolBite', 'party')).toBe(0);
    expect(j.holds('lcPoolDrying', 'party')).toBe(false);
    expect(j.offers('Pull the line steadily')).toBe(false);
  }, 10000);
});
