import { beforeAll, describe, expect, it } from 'bun:test';
import { Walking } from './support/walking';
import type { Journey } from '../src/session/journey';

// Every end state of the Walk is reachable, and each leaves its marks in all four towns. The company is not walked here:
// each spec sets the levers a long play would have set (named in the spec) and waits for the clock; test/walk-play.test.ts
// plays some of them by the page's own labels, on foot.
const towns = ['a', 'b', 'c', 'd'];
let base: Journey, flash: string, placed: Record<string, string>;
beforeAll(async () => {
  const w = await Walking.world('a1');
  base = w.j; flash = Walking.flash(base); placed = w.placed.bindings;
}, 300000);

const ended = async (set: (j: Journey) => Promise<void> | void, lift = false) => {
  const j = Walking.fork(base);
  await j.play('=day 2 08:00');
  await set(j);
  await j.play('=day 9 12:00');
  if (lift) { for (const x of towns) { Walking.retract(j, 'interdict', `walk_${x}`); Walking.assert(j, `lifted_${x}`, 'walk'); } }
  await j.play('=day 11 10:00');
  return j;
};
const marks = (j: Journey) => ({
  ending: Walking.drawn(j, 'ending').join(),
  chalk: towns.map(x => Walking.state(j, `chalk_${x}`)?.replace('walk__', '')),
  notice: towns.map(x => Walking.state(j, `notice_${x}`)?.replace('walk__', '')),
  chair: Walking.state(j, 'bench_chair')?.replace('walk__', ''),
  door: Walking.state(j, `station_door_${flash}`)?.replace('walk__', ''),
  leader: Walking.at(j, 'leader')?.replace('walk__', ''),
  larder: towns.map(x => Walking.quantity(j, `region__${placed[x]}_innkeeper`, 'rations')),
});
const calm = (j: Journey) => { for (const r of ['raid_off', 'duel_settled']) { Walking.assert(j, r, 'walk'); } };

describe('the Walk of the Milestones: every end state is reachable, and every town shows it', () => {
  it('suppressed: the Bench breaks the host (the Brethren parleyed with and the duel settled, but the raid and the interdict stand)', async () => {
    const j = await ended(x => { Walking.assert(x, 'gaunt_parleyed', 'walk'); Walking.assert(x, 'duel_settled', 'walk'); });
    const m = marks(j);
    expect(m.ending).toBe('e_suppressed');
    expect(m.notice).toEqual(Array(4).fill('end_suppressed'));
    expect(m.door).toBe('boarded');
    expect(m.leader).toBe('nowhere_gone');
    expect(m.chair).toBe('held_dray');
  }, 900000);
  it('licensed: the grant laid before the bailiff who goes by the book, the Brethren parleyed with, the duel settled', async () => {
    const j = await ended(x => { for (const r of ['grant_shown', 'gaunt_parleyed', 'duel_settled']) { Walking.assert(x, r, 'walk'); } });
    const m = marks(j);
    expect(m.ending).toBe('e_licensed');
    expect(m.notice).toEqual(Array(4).fill('end_licensed'));
    expect(m.door).toBe('open');
    expect(m.chair).toBe('held_dray');
    expect(m.larder.some(n => n >= 6)).toBe(true);
  }, 900000);
  it('schism: the raid prevented and the duel settled, the interdict lifted, the Brethren left holding the Station', async () => {
    const j = await ended(calm, true);
    const m = marks(j);
    expect(m.ending).toBe('e_schism');
    expect(m.door).toBe('sealed');
    expect(m.notice).toEqual(Array(4).fill('end_schism'));
  }, 900000);
  it('usurped: calm, the Brethren beaten, the patron not exposed: the steward sits in the bailiff’s chair', async () => {
    const j = await ended(x => { calm(x); Walking.assert(x, 'gaunt_down', 'walk'); }, true);
    const m = marks(j);
    expect(m.ending).toBe('e_usurped');
    expect(m.chair).toBe('held_orme');
    expect(Walking.at(j, 'dray')).toBe('walk__nowhere_gone');
    expect(m.notice).toEqual(Array(4).fill('end_usurped'));
  }, 900000);
  it('fades: calm, the Brethren beaten, the patron exposed', async () => {
    const j = await ended(x => { calm(x); Walking.assert(x, 'gaunt_down', 'walk'); Walking.assert(x, 'exposed', 'walk'); }, true);
    const m = marks(j);
    expect(m.ending).toBe('e_fades');
    expect(m.chalk).toEqual(Array(4).fill('after_fades'));
  }, 900000);
});
