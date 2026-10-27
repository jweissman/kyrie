import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { home, build } from './support/pellam';
import type { CreatureGenerationContext } from '../src/content';

// The Liberty of the Ice, played at random: from a seeded start, take one of whatever the page offers, again and again,
// and check after each step that Pellam is still a city its story can stand in; then wait out the three days and see
// that the ice goes out and one ending is told. A failure names the seed and every command taken, so it can be
// replayed (each command as `@command`). WANDER_STEPS and WANDER_SEEDS make longer or wider walks.
const steps = Number(process.env.WANDER_STEPS ?? 220);
const seeds = (process.env.WANDER_SEEDS ?? 'r1,r2').split(',');
const one = (classId: string, backgroundId: string): CreatureGenerationContext[] =>
  [{ name: 'Sam', raceId: 'human', classId, backgroundId } as CreatureGenerationContext];
const walkers: [string, string, CreatureGenerationContext[] | undefined][] = [
  ['the bard', home, undefined], ['a thief', home, one('thief', 'cutpurse')], ['a plain labourer', home, one('warrior', 'laborer')],
  ['a ranger in a world that goes on', build('continuing'), undefined]];
const random = (seed: string) => {
  let h = 2166136261;
  for (const ch of seed) { h = Math.imul(h ^ ch.charCodeAt(0), 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
};
const call = (name: string, ...args: string[]) => ({ kind: 'call' as const, name, args });
const P = (id: string) => `pellam__${id}`;
const ice = ['swan_foot', 'under_arches', 'freezeland', 'freezeland_low', 'hiring_ring', 'bear_stake', 'ox_roast', 'court', 'printing',
  'lamb', 'chapel', 'hay_foot', 'reach_head', 'black_reach', 'patience_deck', 'patience_hold', 'sledge_road'].map(P);

describe('The Liberty of the Ice, wandered', () => {
  for (const [who, campaign, party] of walkers) {
    for (const seed of seeds) {
      it(`${who}, a random walk of ${steps} offered choices from seed ${seed}, then the thaw`, async () => {
        const j = await Journey.start(campaign, seed, party ? { party } : {}), next = random(`${who}${seed}`), taken: string[] = [];
        const check = () => {
          const world = j.campaign.world, here = world.one('at', 'party'), held = (n: string, ...a: string[]) => world.test(call(n, ...a));
          if (here) { expect(world.module.entities.find(e => e.id === here)?.type).toBe('place'); }
          // The page names people and things, never ids or unfilled slots.
          const page = `${j.taken.at(-1)?.page ?? ''} ${j.taken.at(-1)?.told ?? ''}`;
          expect(page).not.toMatch(/pellam__|\{[a-z?]+\}|undefined|NaN/);
          expect(j.measure('quantity', 'party', 'gold')).toBeGreaterThanOrEqual(0);
          // The hired are free or landed, never both; a dead preacher is nowhere.
          expect(held(P('hiredFled'), P('lisk')) && held(P('hiredLanded'), P('lisk'))).toBe(false);
          if (held(P('callowDead'), P('callow'))) { expect(world.one('at', P('callow'))).toBe(P('limbo')); }
          // Ursel is with the company or gone, not both.
          expect(held('travelsWith', P('ursel'), 'party') && held(P('urselGone'), P('ursel'))).toBe(false);
          // Once the ice has gone out, nobody stands on it.
          if (held(P('thawed'), P('lisk')) && j.watch() > 380) { expect(ice).not.toContain(here); }
          expect(world.related('reached').length).toBeLessThanOrEqual(1);
        };
        try {
          for (let i = 0; i < steps && j.campaign.running; i++) {
            const offered = j.choices().filter(c => !/Set down here|Give to|Make camp|prepare spells/i.test(c.label));
            if (!offered.length) { break; }
            // Mostly what the place offers; now and then a long wait, so that the three days are walked too.
            const waits = offered.filter(c => /Wait › (An hour|Until)/.test(c.label));
            const pool = waits.length && next() < 0.12 ? waits : offered.filter(c => !/^Wait/.test(c.label));
            const c = (pool.length ? pool : offered)[Math.floor(next() * (pool.length || offered.length))]!;
            taken.push(c.command);
            await j.perform(c.command, c.label);
            check();
          }
          while (j.campaign.running && j.watch() < 420) {
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
        // Unless the walk ended in a fight lost for good, the ice has gone and one ending is told.
        const world = j.campaign.world;
        if (j.campaign.fighters.some(f => f.hp > 0)) {
          expect(world.test(call(P('thawed'), P('lisk')))).toBe(true);
          expect(world.related('reached').length).toBe(1);
        }
      }, 1200000);
    }
  }
});
