import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Banns at Hessel, played at random: from the south road, take one of whatever the page offers, again and
// again, and check after each step that Hessel is still a town its Season can stand in; then wait out the Season and
// see that one ending is told. A failure names the seed and every command taken, so it can be replayed (each command
// as `@command`). WANDER_STEPS and WANDER_SEEDS make longer or wider walks.
const steps = Number(process.env.WANDER_STEPS ?? 200);
const seeds = (process.env.WANDER_SEEDS ?? 'w1,w2').split(',');
const walkers = [
  ['a bard', 'data/campaigns/hessel.campaign.json'],
  ['a thief', 'test/fixtures/hessel/thief.campaign.json'],
  ['a soldier', 'test/fixtures/hessel/soldier.campaign.json'],
] as const;
const random = (seed: string) => {
  let h = 2166136261;
  for (const ch of seed) { h = Math.imul(h ^ ch.charCodeAt(0), 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
};
const h = (id: string) => `hessel__${id}`;
const call = (name: string, ...args: string[]) => ({ kind: 'call' as const, name: h(name), args: args.map(a => a === 'party' ? a : h(a)) });

describe('The Banns at Hessel, wandered', () => {
  for (const [who, campaign] of walkers) {
    for (const seed of seeds) {
      it(`${who}, a random walk of ${steps} offered choices from seed ${seed}, then the Season out`, async () => {
        const j = await Journey.start(campaign, seed), next = random(`${who}${seed}`), taken: string[] = [];
        const check = () => {
          const world = j.campaign.world, held = (n: string, ...a: string[]) => world.test(call(n, ...a));
          const here = world.one('at', 'party');
          if (here) { expect(world.module.entities.find(e => e.id === here)?.type).toBe('place'); }
          // The page names people and things, never ids or unfilled slots.
          const page = `${j.taken.at(-1)?.page ?? ''} ${j.taken.at(-1)?.told ?? ''}`;
          expect(page).not.toMatch(/hessel__|\{[a-z?]+\}|undefined|NaN/);
          // The banns are stopped in church or read out, never both; and a wedding breaks only on banns read out.
          if (held('bannsStopped', 'ebbas') && held('bannsDone', 'ebbas')) { throw new Error('the banns were both stopped and read'); }
          if (held('weddingBroken', 'ebbas')) { expect(held('bannsDone', 'ebbas')).toBe(true); }
          // The household is in the Rooms or out of them, not both.
          expect(held('householdAdmitted', 'cherrett') && held('householdBarred', 'cherrett')).toBe(false);
          // Mrs Cherrett goes only by the drops, and is in her bed when she has gone.
          if (held('gone', 'cherrett')) {
            expect(j.measure(h('failing'), h('cherrett'))).toBeGreaterThanOrEqual(5);
            expect(world.one('at', h('cherrett'))).toBe(h('cherrett_bedroom'));
          }
          // Whoever follows the company is where the company is.
          for (const f of world.related(h('following')).filter(r => r.args[1] === 'party')) {
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
            const pool = waits.length && next() < 0.12 ? waits : offered.filter(c => !/^Wait/.test(c.label));
            const c = (pool.length ? pool : offered)[Math.floor(next() * (pool.length || offered.length))]!;
            taken.push(c.command);
            await j.perform(c.command, c.label);
            check();
          }
          while (j.campaign.running && !j.campaign.world.related('reached').length && j.watch() < 700) {
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
        // Unless the walk ended in a fight lost for good, the Season ends and one ending is told.
        if (j.campaign.fighters.some(f => f.hp > 0)) {
          expect(j.campaign.world.related('reached').length).toBe(1);
        }
      }, 900000);
    }
  }
});
