import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Quiet in the Sky, played at random: from the valley road, take one of whatever the page offers, again and again,
// and check after each step that the world is still one its people can stand in; then wait until the Morning After
// and see that at most one ending is told. A failure names the seed and every command taken, so it can be replayed
// (each as `@command`). WANDER_STEPS and WANDER_SEEDS make longer or wider walks.
const steps = Number(process.env.WANDER_STEPS ?? 250);
const seeds = (process.env.WANDER_SEEDS ?? 'w1,w2').split(',');
const walkers = [
  ['a warrior alone', 'data/campaigns/the-quiet-in-the-sky.campaign.json'],
  ['a thief alone', 'test/fixtures/quiet-in-the-sky/thief.campaign.json'],
  ['a cleric alone', 'test/fixtures/quiet-in-the-sky/cleric.campaign.json'],
] as const;
const random = (seed: string) => {
  let h = 2166136261;
  for (const ch of seed) { h = Math.imul(h ^ ch.charCodeAt(0), 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
};
const l = (id: string) => `larum__${id}`;
const call = (name: string, ...args: string[]) => ({ kind: 'call' as const, name: l(name), args: args.map(a => a === 'party' ? a : l(a)) });

describe('The Quiet in the Sky, wandered', () => {
  for (const [who, campaign] of walkers) {
    for (const seed of seeds) {
      it(`${who}, a random walk of ${steps} offered choices from seed ${seed}, then out to the Morning After`, async () => {
        const j = await Journey.start(campaign, seed), next = random(`${who}${seed}`), taken: string[] = [];
        const check = () => {
          const world = j.campaign.world, held = (n: string, ...a: string[]) => world.test(call(n, ...a));
          const here = world.one('at', 'party');
          if (here) { expect(world.module.entities.find(e => e.id === here)?.type).toBe('place'); }
          const page = `${j.taken.at(-1)?.page ?? ''} ${j.taken.at(-1)?.told ?? ''}`;
          expect(page).not.toMatch(/larum__|\{[a-z?]+\}|undefined|NaN/);
          // The Testing is decided one way, and the Field comes to one outcome.
          expect(['testingHeld', 'testingOff', 'testingBlocked'].filter(o => held(o, 'field_country')).length).toBeLessThanOrEqual(1);
          expect(['outcomeFear', 'outcomeDaily', 'outcomeHalf', 'outcomeHalt', 'outcomeQuiet'].filter(o => held(o, 'field_country')).length)
            .toBeLessThanOrEqual(1);
          // Halvard is buried once, in one place.
          expect(held('buriedIce', 'torold') && held('buriedLarum', 'torold')).toBe(false);
          // Edith goes one way.
          expect(['edithHome', 'edithDead'].filter(o => held(o, 'edith')).length).toBeLessThanOrEqual(1);
          // Hild is not both resolved and holding the company to its promise to kill.
          if (held('hildResolved', 'hild')) { expect(held('hildHardened', 'hild')).toBe(false); }
          const reached = world.related('reached').map(r => r.args[0]);
          if (reached.length > 1) { throw new Error(`two endings: ${reached.join(', ')}`); }
        };
        try {
          for (let i = 0; i < steps && j.campaign.running; i++) {
            const skipped = /Set down here|Give to ›|prepare spells|Make camp|advance ›/;
            const offered = j.choices().filter(c => !skipped.test(c.label));
            if (!offered.length) { break; }
            const resting = /Wait › (An hour|Until)|Rest six hours/;
            const waits = offered.filter(c => resting.test(c.label));
            const pool = waits.length && next() < 0.15 ? waits : offered.filter(c => !/^Wait/.test(c.label));
            const c = (pool.length ? pool : offered)[Math.floor(next() * (pool.length || offered.length))]!;
            taken.push(c.command);
            await j.perform(c.command, c.label, c.grave);
            check();
          }
          for (let i = 0; i < 800 && j.campaign.running && !j.campaign.world.related('reached').length; i++) {
            const c = j.find('^Wait › An hour') ?? j.find('^Wait');
            if (!c) { break; }
            taken.push(c.command);
            await j.perform(c.command, c.label);
            check();
          }
          // A company that came up onto the Field, and lived, sees the book closed on the Morning After.
          if (j.campaign.fighters.some(f => f.hp > 0) && j.campaign.world.test(call('cameUp', 'party'))) {
            expect(j.campaign.world.related('reached').length).toBe(1);
          }
          if (process.env.WANDER_REPORT) {
            const ends = j.campaign.world.related('reached').map(r => r.args[0]).join(',');
            console.log(who, seed, ends, j.watch(), j.campaign.world.one('at', 'party'));
          }
        } catch (error) {
          throw new Error(`Wander ${who} ${seed} failed after ${taken.length} steps: ${(error as Error).message}\n` +
            `steps: ${JSON.stringify(taken.map(c => `@${c}`))}`);
        }
      }, 900000);
    }
  }
});
