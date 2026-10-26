import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { home, build } from './support/wrayford';

// The Third Night, played at random: from a seeded start, take one of whatever the page offers, again and again, and
// check after each step that Wrayford is still a city its story can stand in; then wait out the four days and see
// that the captain gives a verdict and one ending is told. A failure names the seed and every command taken, so it
// can be replayed (each command as `@command`). WANDER_STEPS and WANDER_SEEDS make longer or wider walks.
const steps = Number(process.env.WANDER_STEPS ?? 200);
const seeds = (process.env.WANDER_SEEDS ?? 'r1,r2').split(',');
const walkers = [['the homecomer', home], ['a thief', build('thief')], ['a traveller', build('traveller')]] as const;
const random = (seed: string) => {
  let h = 2166136261;
  for (const ch of seed) { h = Math.imul(h ^ ch.charCodeAt(0), 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
};
const call = (name: string, ...args: string[]) => ({ kind: 'call' as const, name, args });
const dead = ['wrayford__wat_dead', 'wrayford__dunstan_dead', 'wrayford__joss_dead'];

describe('The Third Night, wandered', () => {
  for (const [who, campaign] of walkers) {
    for (const seed of seeds) {
      it(`${who}, a random walk of ${steps} offered choices from seed ${seed}, then the verdict`, async () => {
        const j = await Journey.start(campaign, seed), next = random(`${who}${seed}`), taken: string[] = [];
        const check = () => {
          const world = j.campaign.world, here = world.one('at', 'party'), held = (n: string, ...a: string[]) => world.test(call(n, ...a));
          if (here) { expect(world.module.entities.find(e => e.id === here)?.type).toBe('place'); }
          // The page names people and things, never ids or unfilled slots.
          const page = `${j.taken.at(-1)?.page ?? ''} ${j.taken.at(-1)?.told ?? ''}`;
          expect(page).not.toMatch(/wrayford__|\{[a-z]+\}|undefined|NaN/);
          // The buried are in the earth, and nobody is buried twice over, or hanging and buried at once.
          for (const d of dead) {
            if (held('wrayford__buried', d)) { expect(world.one('at', d)).toBe('wrayford__limbo'); }
          }
          if (held('state', 'wrayford__rail', 'wrayford__hanging')) {
            expect(dead.some(d => held('wrayford__buried', d))).toBe(false);
          }
          // Whoever is taken is in the cellar until the verdict; whoever is hanged was taken.
          if (!held('wrayford__verdictGiven', 'wrayford__wray') && held('wrayford__kitTaken', 'wrayford__kit')) {
            expect(world.one('at', 'wrayford__kit')).toBe('wrayford__guild_cellar');
          }
          if (held('wrayford__maudieHanged', 'wrayford__maudie')) { expect(held('wrayford__maudieTaken', 'wrayford__maudie')).toBe(true); }
          expect(world.related('reached').length).toBeLessThanOrEqual(1);
        };
        try {
          for (let i = 0; i < steps && j.campaign.running; i++) {
            const offered = j.choices().filter(c => !/Set down here|Give to|Make camp/.test(c.label));
            if (!offered.length) { break; }
            // Mostly what the place offers; now and then a long wait, so that the four days are walked too.
            const waits = offered.filter(c => /Wait › (An hour|Until)/.test(c.label));
            const pool = waits.length && next() < 0.12 ? waits : offered.filter(c => !/^Wait/.test(c.label));
            const c = (pool.length ? pool : offered)[Math.floor(next() * (pool.length || offered.length))]!;
            taken.push(c.command);
            await j.perform(c.command, c.label);
            check();
          }
          while (j.campaign.running && j.watch() < 440) {
            const c = j.find('^Wait › An hour') ?? j.find('^Wait › A while') ?? j.find('^Wait');
            if (!c) { break; }
            taken.push(c.command);
            await j.perform(c.command, c.label);
            check();
          }
        } catch (error) {
          throw new Error(`Wander ${who} ${seed} failed after ${taken.length} steps: ${(error as Error).message}\n` +
            `steps: ${JSON.stringify(taken.map(c => `@${c}`))}`);
        }
        // Unless the walk ended in a fight lost for good, the captain has given a verdict and an ending is told.
        const world = j.campaign.world;
        if (j.campaign.fighters.some(f => f.hp > 0)) {
          expect(world.test(call('wrayford__verdictGiven', 'wrayford__wray'))).toBe(true);
          expect(world.related('reached').length).toBe(1);
        }
      }, 900000);
    }
  }
});
