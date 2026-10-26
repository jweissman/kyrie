import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// What Tessary Owes, played at random: from a seeded start, take one of whatever the page offers, again and again,
// and check after each step that the world is still a world. A failure names the seed and every command taken, so it
// can be replayed with `bin/kyrie play … --steps` (each command as `@command`). WANDER_STEPS and WANDER_SEEDS make
// longer or wider walks.
const campaign = 'data/campaigns/what-tessary-owes.campaign.json';
const steps = Number(process.env.WANDER_STEPS ?? 160);
const seeds = (process.env.WANDER_SEEDS ?? 'w1,w2,w3,w4').split(',');
// A small deterministic generator, so a walk is the same walk every time.
const random = (seed: string) => {
  let h = 2166136261;
  for (const ch of seed) { h = Math.imul(h ^ ch.charCodeAt(0), 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
};

describe('What Tessary Owes, wandered', () => {
  for (const seed of seeds) {
    it(`a random walk of ${steps} offered choices from seed ${seed} leaves a coherent world`, async () => {
      const j = await Journey.start(campaign, seed), next = random(seed), taken: string[] = [];
      try {
        for (let i = 0; i < steps && j.campaign.running; i++) {
          // Mostly what the place offers; sometimes a long wait, so that the fortnight's clocks are walked too.
          const offered = j.choices().filter(c => !/Set down here|Give to/.test(c.label));
          if (!offered.length) { break; }
          const waits = offered.filter(c => /Wait › (An hour|Until)/.test(c.label));
          const pool = waits.length && next() < 0.15 ? waits : offered;
          const c = pool[Math.floor(next() * pool.length)]!;
          taken.push(c.command);
          await j.perform(c.command, c.label);
          const world = j.campaign.world, here = world.one('at', 'party');
          // The company is somewhere, or between places on a way; never nowhere while it stands.
          if (here) { expect(world.module.entities.find(e => e.id === here)?.type).toBe('place'); }
          // Nobody held in the Holding walks with the company, and the count of the held never goes below nothing.
          for (const h of world.related('tessary__heldNow')) {
            expect(world.test({ kind: 'call', name: 'travelsWith', args: [h.args[0]!, 'party'] })).toBe(false);
          }
          expect(world.number({ kind: 'call', name: 'tessary__held', args: ['tessary__ossel'] })).toBeGreaterThanOrEqual(0);
          // The night counter only goes forward, and the note matures once.
          expect(world.number({ kind: 'call', name: 'tessary__night', args: ['tessary__ossel'] })).toBeLessThanOrEqual(16);
        }
      } catch (error) {
        throw new Error(`Wander ${seed} failed after ${taken.length} steps: ${(error as Error).message}\n` +
          `steps: ${JSON.stringify(taken.map(c => `@${c}`))}`);
      }
      expect(taken.length).toBeGreaterThan(0);
    }, 600000);
  }
});
