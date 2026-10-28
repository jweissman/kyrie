import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// A Winter in Carth, played at random: from the Penitent's Cross, take one of whatever the page offers, again and
// again, and check after each step that Gaunt is still a city its Ash Day can come to; then wait out the days and
// see that one ending is told. A failure names the seed and every command taken, so it can be replayed (each command
// as `@command`). WANDER_STEPS and WANDER_SEEDS make longer or wider walks.
const steps = Number(process.env.WANDER_STEPS ?? 200);
const seeds = (process.env.WANDER_SEEDS ?? 'w1,w2').split(',');
const walkers = [
  ['a bard', 'data/campaigns/a-winter-in-carth.campaign.json'],
  ['a thief', 'test/fixtures/gaunt/thief.campaign.json'],
  ['a warrior', 'test/fixtures/gaunt/warrior.campaign.json'],
  ['a cleric', 'test/fixtures/gaunt/cleric.campaign.json'],
] as const;
const random = (seed: string) => {
  let h = 2166136261;
  for (const ch of seed) { h = Math.imul(h ^ ch.charCodeAt(0), 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
};
const g = (id: string) => `gaunt__${id}`;
const call = (name: string, ...args: string[]) => ({ kind: 'call' as const, name: g(name), args: args.map(a => a === 'party' ? a : g(a)) });

describe('A Winter in Carth, wandered', () => {
  for (const [who, campaign] of walkers) {
    for (const seed of seeds) {
      it(`${who}, a random walk of ${steps} offered choices from seed ${seed}, then the days out`, async () => {
        const j = await Journey.start(campaign, seed), next = random(`${who}${seed}`), taken: string[] = [];
        const check = () => {
          const world = j.campaign.world, held = (n: string, ...a: string[]) => world.test(call(n, ...a));
          const here = world.one('at', 'party');
          if (here) { expect(world.module.entities.find(e => e.id === here)?.type).toBe('place'); }
          // The page names people and things, never ids or unfilled slots.
          const page = `${j.taken.at(-1)?.page ?? ''} ${j.taken.at(-1)?.told ?? ''}`;
          expect(page).not.toMatch(/gaunt__|\{[a-z?]+\}|undefined|NaN/);
          // Hern is in one condition at a time: not both fled and in the gaol, nor dead and walking with the company.
          expect(held('hernFled', 'hern') && held('hernGaoled', 'hern')).toBe(false);
          if (held('hernDead', 'hern')) { expect(world.test({ kind: 'call', name: 'following', args: [g('hern'), 'party'] })).toBe(false); }
          // The Consistory gives one verdict at most.
          const verdicts = ['verdictFast', 'verdictFlight', 'verdictRecant', 'verdictBearer', 'verdictPutOut'].filter(v => held(v, 'consistory'));
          expect(verdicts.length).toBeLessThanOrEqual(1);
          // The vigil is broken, released or kept: never broken and kept on.
          if (held('vigilBroken', 'carth_vigil')) { expect(held('vigilEnded', 'carth_vigil')).toBe(true); }
          // Whoever follows the company is where the company is, unless Hern is off down the drovers' road.
          for (const f of world.related('following').filter(r => r.args[1] === 'party' && r.args[0] !== g('hern'))) {
            expect(world.one('at', f.args[0]!)).toBe(here);
          }
          // At most one ending.
          const reached = world.related('reached').map(r => r.args[0]);
          if (reached.length > 1) { throw new Error(`two endings: ${reached.join(', ')} at watch ${j.watch()}`); }
        };
        try {
          for (let i = 0; i < steps && j.campaign.running; i++) {
            const offered = j.choices().filter(c => !/Set down here|Give to|Make camp/.test(c.label));
            if (!offered.length) { break; }
            const waits = offered.filter(c => /Wait › (An hour|Until)/.test(c.label));
            const pool = waits.length && next() < 0.15 ? waits : offered.filter(c => !/^Wait/.test(c.label));
            const c = (pool.length ? pool : offered)[Math.floor(next() * (pool.length || offered.length))]!;
            taken.push(c.command);
            await j.perform(c.command, c.label);
            check();
          }
          while (j.campaign.running && !j.campaign.world.related('reached').length && j.watch() < 560) {
            const c = j.find('^Wait › An hour') ?? j.find('^Wait › A while') ?? j.find('^Wait') ?? j.find('^Lie as you are');
            if (!c) { break; }
            taken.push(c.command);
            await j.perform(c.command, c.label);
            check();
          }
        } catch (error) {
          throw new Error(`Wander ${who} ${seed} failed after ${taken.length} steps: ${(error as Error).message}\n` +
            `steps: ${JSON.stringify(taken.map(c => `@${c}`))}`);
        }
        // Unless the walk ended in a fight lost for good, Ash Day comes and one ending is told.
        if (j.campaign.fighters.some(f => f.hp > 0)) {
          expect(j.campaign.world.related('reached').length).toBe(1);
        }
      }, 900000);
    }
  }
});
