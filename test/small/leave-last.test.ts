import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Runner, type Offered } from '../../src/cli/runner';
import { Doable } from '../../src/presentation/doable';
import { Leaving } from '../../src/presentation/leaving';

// What leaves comes last, and a trader's wares are the trader's (the owner's playtest, 25 November): "'Take your
// leave' or 'exit-like' options always need to come at the bottom", and the first town's menu "overrun" with "haggle
// with Helga for the price of x" three times. One rule orders every client (Leaving); a ware's buying and haggling are
// held within its trader's talk, under Trade, not rows of the place.
const shop = `
  Place shop "the shop" is room at 0, 0 indoors.
  Place lane "the lane" is room at 1, 0.
  Passage door "the door" is door between shop and lane.
  Person mabel "Mabel" at shop { Role "a chandler". Ancestry human. Peaceable. Pronouns she.
    Sells lantern for 7 coin from 2. Sells torch for 1 coin from 6. Sells crowbar for 3 coin from 1. }
  Company party "You" of 1 at shop.
  Goal false.`;
const flat = (os: Offered[]): Offered[] => os.flatMap(o => [o, ...flat(o.opens ?? [])]);
const ask = async (r: Runner, line: object) => {
  const said = await r.ask(JSON.stringify(line));
  if ('error' in said) { throw new Error(said.error); }
  return said;
};

describe('what leaves', () => {
  it('comes last, in the place, in a talk, and among the engine\'s rows', async () => {
    const t = await Tiny.start(shop, {});
    t.journey.coin(20); t.look();
    const r = new Runner(t.session);
    const ways = Leaving.ways(t.screen), trails = (os: { id: string; label: string; does?: string }[]) => {
      const first = os.findIndex(x => Leaving.is(x, ways));
      return first < 0 || os.slice(first).every(x => Leaving.is(x, ways));
    };
    // The shop's door onto the lane is its way out: led with, it is still the last row of all.
    const here = await ask(r, { look: true });
    expect(here.offer.rest.at(-1)?.id).toBe('exit:t__lane');
    expect(here.offer.primary.some(o => Leaving.is(o, ways))).toBe(false);
    expect(trails(here.offer.rest)).toBe(true);
    // Turned to Mabel: what is had of her, taking leave of her last (the engine's question, OR-1451: what she has for
    // sale under Trade, the place's ways not beside her talk).
    const talk = await ask(r, { act: 't__mabel#talk' });
    const all = [...talk.offer.primary, ...talk.offer.rest];
    expect(all.at(-1)?.does).toBe('take_leave(t__mabel)');
    expect(trails(talk.offer.rest)).toBe(true);
    t.look();
    const rows = Doable.of(t.glance, t.screen);
    expect(rows.some(x => Leaving.is(x, ways)) && trails(rows)).toBe(true);
  });
  it('is known by what it does or is, never a row that only says "Leave"', () => {
    const ways = new Set(['exit:t__lane']);
    expect([{ id: 'x#leave', label: 'Take your leave' }, { id: 'exit:t__lane', label: 'To the lane' },
      { id: 'x#back', label: 'Back' }, { id: 'y', label: 'Out to the old quarry pit' }]
      .every(x => Leaving.is(x, ways))).toBe(true);
    expect(Leaving.is({ id: 'altar#look', label: 'Leave an offering' }, ways)).toBe(false);
  });
});
describe('a trader\'s wares', () => {
  it('are bought and haggled for within the trader\'s talk, not offered one by one in the place', async () => {
    const t = await Tiny.start(shop, {});
    t.journey.coin(20); t.look();
    const r = new Runner(t.session);
    const here = flat([...(await ask(r, { look: true })).offer.primary, ...(await ask(r, { look: true })).offer.rest]);
    expect(here.filter(o => /^(buy_item|haggle_item)\(/.test(o.does ?? '') || /^(Buy|Haggle)\b/.test(o.label))
      .map(o => o.label)).toEqual([]);
    expect(here.filter(o => o.id === 't__mabel#talk').length).toBe(1);
    await ask(r, { act: 't__mabel#talk' });
    const trading = await ask(r, { act: 'focus:trade:on' });
    const talk = flat([...trading.offer.primary, ...trading.offer.rest]);
    // The lantern and the crowbar are dearer than a coin, and may be haggled for; the torch may not.
    expect(talk.filter(o => /^haggle_item\(/.test(o.does ?? '')).length).toBe(2);
    expect(talk.filter(o => /^buy_item\(/.test(o.does ?? '')).length).toBe(3);
  });
});
