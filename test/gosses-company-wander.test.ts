import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Gosse's Company, played at random: from Wending Cross, take one of whatever the page offers, again and again, and
// check after each step that the world is still a world. A failure names the seed and every command taken, so it can
// be replayed with `bin/kyrie play … --steps` (each command as `@command`). WANDER_STEPS and WANDER_SEEDS make longer
// or wider walks.
const campaign = 'data/campaigns/gosses-company.campaign.json';
const steps = Number(process.env.WANDER_STEPS ?? 200);
const seeds = (process.env.WANDER_SEEDS ?? 'w1,w2,w3').split(',');
const random = (seed: string) => {
  let h = 2166136261;
  for (const ch of seed) { h = Math.imul(h ^ ch.charCodeAt(0), 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
};
const call = (name: string, ...args: string[]) => ({ kind: 'call' as const, name, args });

describe("Gosse's Company, wandered", () => {
  for (const seed of seeds) {
    it(`a random walk of ${steps} offered choices from seed ${seed} leaves a coherent world`, async () => {
      const j = await Journey.start(campaign, seed), next = random(seed), taken: string[] = [];
      try {
        for (let i = 0; i < steps && j.campaign.running; i++) {
          // Mostly what the place offers; sometimes a long wait, so that the week's clocks are walked too.
          const offered = j.choices().filter(c => !/Set down here|Give to|advance ›|prepare spells/i.test(c.label));
          if (!offered.length) { break; }
          const waits = offered.filter(c => /Wait › (An hour|Until)/.test(c.label));
          const pool = waits.length && next() < 0.2 ? waits : offered;
          const c = pool[Math.floor(next() * pool.length)]!;
          taken.push(c.command);
          await j.perform(c.command, c.label);
          const world = j.campaign.world, here = world.one('at', 'party');
          if (here) { expect(world.module.entities.find(e => e.id === here)?.type).toBe('place'); }
          // The days of the Trial only go forward, and there are never more than four voices.
          const day = world.number(call('pentrice__tday', 'pentrice__pentrice'));
          expect(day).toBeGreaterThanOrEqual(0);
          expect(day).toBeLessThanOrEqual(6);
          const votes = world.number(call('pentrice__votes', 'pentrice__pentrice'));
          expect(votes).toBeGreaterThanOrEqual(0);
          expect(votes).toBeLessThanOrEqual(4);
          // The Ghost and Galt are never both played; and the book is in one state at a time.
          expect(world.test(call('pentrice__ghostPlay', 'pentrice__pentrice'))
            && world.test(call('pentrice__galtPlay', 'pentrice__pentrice'))).toBe(false);
          expect(world.related('state').filter(r => r.args[0] === 'pentrice__book').length).toBeLessThanOrEqual(1);
          // Each part has at most one player.
          for (const part of ['part_widow', 'part_bell', 'part_tapwell', 'part_ghost']) {
            expect(world.related('pentrice__plays').filter(r => r.args[1] === `pentrice__${part}`).length).toBeLessThanOrEqual(1);
          }
        }
      } catch (error) {
        throw new Error(`Wander ${seed} failed after ${taken.length} steps: ${(error as Error).message}\n` +
          `steps: ${JSON.stringify(taken.map(c => `@${c}`))}`);
      }
      if (process.env.WANDER_SHOW) { console.log(seed, taken.length, j.campaign.running, j.campaign.world.one("at", "party"), j.watch(), j.taken.slice(-3).map(t => t.label)); }
      expect(taken.length).toBeGreaterThan(0);
    }, 600000);
  }
});
