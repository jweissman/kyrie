import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Lull, played at random: from the march road, take one of whatever the page offers, again and again, and check
// after each step that the valley is still a place its people can stand in; then wait out three Lulldays and see that
// one ending is told. A failure names the seed and every command taken, so it can be replayed (each as `@command`).
// WANDER_STEPS and WANDER_SEEDS make longer or wider walks.
const steps = Number(process.env.WANDER_STEPS ?? 250);
const seeds = (process.env.WANDER_SEEDS ?? 'w1,w2').split(',');
const walkers = [
  ['a warrior alone', 'data/campaigns/the-lull.campaign.json'],
  ['a thief alone', 'test/fixtures/the-lull/thief.campaign.json'],
  ['a company of three', 'test/fixtures/the-lull/party.campaign.json'],
] as const;
const random = (seed: string) => {
  let h = 2166136261;
  for (const ch of seed) { h = Math.imul(h ^ ch.charCodeAt(0), 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
};
const l = (id: string) => `lull__${id}`;
const call = (name: string, ...args: string[]) => ({ kind: 'call' as const, name: l(name), args: args.map(a => a === 'party' ? a : l(a)) });

describe('The Lull, wandered', () => {
  for (const [who, campaign] of walkers) {
    for (const seed of seeds) {
      it(`${who}, a random walk of ${steps} offered choices from seed ${seed}, then out to the Working Day's end`, async () => {
        const j = await Journey.start(campaign, seed), next = random(`${who}${seed}`), taken: string[] = [];
        const check = () => {
          const world = j.campaign.world, held = (n: string, ...a: string[]) => world.test(call(n, ...a));
          const here = world.one('at', 'party');
          if (here) { expect(world.module.entities.find(e => e.id === here)?.type).toBe('place'); }
          const page = `${j.taken.at(-1)?.page ?? ''} ${j.taken.at(-1)?.told ?? ''}`;
          expect(page).not.toMatch(/lull__|\{[a-z?]+\}|undefined|NaN/);
          // Hester dies once, by one hand, and is never both eased and gone by the phial.
          if (held('hesterDead', 'hester')) {
            const hands = ['party', 'tobias'].filter(h => held('diedBy', 'hester', h));
            expect(hands.length).toBe(1);
          }
          // The Working Day ends one way.
          const outcomes = ['outcomeSeventh', 'outcomeMonday', 'outcomeSunday', 'outcomeBroken', 'outcomeMeant']
            .filter(o => held(o, 'lull_country'));
          expect(outcomes.length).toBeLessThanOrEqual(1);
          // The law goes only with the week.
          if (held('lawGone', 'lull_country')) { expect(held('weekReturned', 'lull_country')).toBe(true); }
          // Linnet is promised one thing, not both.
          expect(held('stayPromised', 'party') && held('linnetWillCome', 'linnet')).toBe(false);
          const reached = world.related('reached').map(r => r.args[0]);
          if (reached.length > 1) { throw new Error(`two endings: ${reached.join(', ')}`); }
        };
        try {
          for (let i = 0; i < steps && j.campaign.running; i++) {
            const offered = j.choices().filter(c => !/Set down here|Give to ›|prepare spells|Make camp/.test(c.label));
            if (!offered.length) { break; }
            const waits = offered.filter(c => /Wait › (An hour|Until)|Lie down|Sit down by the Fold-stone/.test(c.label));
            const pool = waits.length && next() < 0.15 ? waits : offered.filter(c => !/^Wait/.test(c.label));
            const c = (pool.length ? pool : offered)[Math.floor(next() * (pool.length || offered.length))]!;
            taken.push(c.command);
            await j.perform(c.command, c.label, c.grave);
            check();
          }
          for (let i = 0; i < 400 && j.campaign.running && !j.campaign.world.related('reached').length; i++) {
            const c = j.find('Lie down Lull-fashion') ?? j.find('Lie down with your hands open') ?? j.find('^Sit down by the Fold-stone')
              ?? j.find('^Wait › An hour') ?? j.find('^Wait');
            if (!c) { break; }
            taken.push(c.command);
            await j.perform(c.command, c.label);
            check();
          }
          // A company that came into the valley, and lived, sees the book closed on the Working Day.
          if (j.campaign.fighters.some(f => f.hp > 0) && j.campaign.world.test(call('cameIn', 'party'))) {
            expect(j.campaign.world.related('reached').length).toBe(1);
          }
          if (process.env.WANDER_REPORT) {
            console.log(who, seed, j.campaign.world.related('reached').map(r => r.args[0]).join(','), j.watch(), j.campaign.world.one('at', 'party'));
          }
        } catch (error) {
          throw new Error(`Wander ${who} ${seed} failed after ${taken.length} steps: ${(error as Error).message}\n` +
            `steps: ${JSON.stringify(taken.map(c => `@${c}`))}`);
        }
      }, 900000);
    }
  }
});
