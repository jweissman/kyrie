import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// weather.kyr: the sea's own table. Each watch in open water may draw one of five things by the ship's die; two at
// most; which and when depend on the seed. This sweeps seeds, asks each drawn trouble for the exits it promises, and
// checks the passage goes on after it.
const campaign = 'data/campaigns/the-dorothea.campaign.json';
const k = (id: string) => `dorothea__${id}`;
const kinds = ['squall', 'raft', 'fever', 'calm'] as const;
const exits: Record<string, string[]> = {
  squall: ['^Bear away and run before the squall'],
  raft: ['^Sail on, and leave it burning', '^Fish the lantern off the raft'],
  fever: ['^Say the office for the sick', '^Sit with the boy'],
  calm: [],
};

async function sail(seed: string) {
  const j = await Journey.start(campaign, seed);
  await j.play('^To Tolleth quay', 'Ask Captain Bascom for passage', 'Pay Captain Bascom six', "^To the Dorothea's waist");
  await j.play('=25');
  const drawn: string[] = [];
  for (let i = 0; i < 60; i++) {
    await j.play('=+2');
    const hit = kinds.find(t => j.holds(k(t), k('hull')));
    if (hit) {
      drawn.push(hit);
      break;
    }
    if (j.campaign.world.one('at', k('hull')) === k('teeth')) {break;}
  }
  return { j, drawn };
}

describe('the sea table', () => {
  it('draws different troubles under different seeds, and each can be answered', async () => {
    const seen = new Set<string>();
    for (const seed of ['s1', 'a', 'b', 'c', 'd', 'e']) {
      const { j, drawn } = await sail(seed);
      for (const kind of drawn) {
        seen.add(kind);
        expect(j.holds(k('troubled'), k('hull'))).toBe(true);
        if (kind === 'calm') {
          await j.play('=+14');
        } else {
          let done = false;
          for (const e of exits[kind]) {
            if (j.matches(e).length) { await j.play(e); done = true; break; }
          }
          expect(done).toBe(true);
        }
        expect(j.holds(k(kind), k('hull'))).toBe(false);
        // Answering takes a watch, and the table may draw again in it: a trouble is left only if it is another's.
        const other = kinds.some(t => t !== kind && j.holds(k(t), k('hull')));
        expect([seed, kind, j.holds(k('troubled'), k('hull')) && !other && !j.holds(k('hailed'), k('hull'))])
          .toEqual([seed, kind, false]);
      }
    }
    expect(seen.size).toBeGreaterThanOrEqual(2);
  }, 900000);
});
