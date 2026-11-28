import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
import { Runner, type Offered } from '../../../src/cli/runner';

// Routine in one act (the cold-play review's Wave 2, doc/design/cold-play-8-to-8-5-2026-11-27.md: "compress
// administration at its actual sources"; OR-1440's traversal-and-administration share). A pile of finds is gathered
// up in one act that leads the place where its finds would each have led, and says who carries it (OR-1870); and a
// trader is haggled with once, over everything they sell, so that their trade is no longer than what they buy of the
// company's, their wares, the one haggle and Back (OR-1852: twenty-one "Haggle with Soveliss for a lantern" rows).
const flat = (os: Offered[]): Offered[] => os.flatMap(o => [o, ...flat(o.opens ?? [])]);
const ask = async (r: Runner, line: object) => {
  const said = await r.ask(JSON.stringify(line));
  if ('error' in said) { throw new Error(said.error); }
  return said;
};
const stone = `
  Place stone "the back-stone" is room at 0, 0.
  Company party "You" of 2 at stone.
  Item compass "an antique compass" is antique_compass at stone.
  Item crown "a broken crown" is broken_crown at stone.
  Item coil "a coil of rope" is rope at stone.
  Observe stone_scene at stone when true "A cold room under the stones.".
  Goal false.`;
const shop = `
  Place shop "the shop" is room at 0, 0 indoors.
  Person mabel "Mabel" at shop { Role "a chandler". Ancestry human. Peaceable. Pronouns she.
    Sells lantern for 7 coin from 2. Sells torch for 1 coin from 6. Sells crowbar for 3 coin from 1. }
  Company party "You" of 1 at shop.
  Goal false.`;
const two = [{ name: 'Odile', raceId: 'human', classId: 'warrior' }, { name: 'Reed', raceId: 'human', classId: 'warrior' }];
describe('Interface › Routine in one act', () => {
  it('gathers up a pile of finds in one act, which leads the place and says who carries it', async () => {
    const t = await Tiny.start(stone, { horizon: ['belongings'], party: two });
    const r = new Runner(t.session), here = await ask(r, { look: true });
    // The four lead with the pile, not with each of its finds; the finds are still each to be had, among the rest.
    const pile = here.offer.primary.find(o => /^take_pile\(/.test(o.does ?? ''))!;
    expect(pile.label).toBe('Gather up what lies here, for Odile');
    expect(here.offer.primary.filter(o => /^take_item\(/.test(o.does ?? ''))).toEqual([]);
    expect(flat(here.offer.rest).filter(o => /^take_item\(/.test(o.does ?? '')).length).toBe(3);
    const before = t.session.campaign.history.length, done = await ask(r, { act: pile.id });
    // One act, which says who gathered it up, and each thing found (a treasure, by the finding of it).
    expect(t.session.campaign.history.length - before).toBe(1);
    expect(done.scene.prose[0]).toBe('Odile gathers up what lies here.');
    for (const thing of ['an antique compass', 'a broken crown', 'a coil of rope']) {
      expect(done.scene.prose.slice(1).filter(l => l.endsWith(`${thing}.`)).length).toBe(1);
    }
    const w = t.session.campaign.world, odile = w.related('memberOf').find(m => m.args[1] === 'party')!.args[0]!;
    expect(['compass', 'crown', 'coil'].map(id => w.one('ownedItem', `t__${id}`))).toEqual([odile, odile, odile]);
    expect(w.related('at').filter(a => a.args[0]!.startsWith('t__') && a.args[0] !== 'party')).toEqual([]);
    // Nothing is left lying, so there is no pile, nor a take, to be had.
    const after = flat([...done.offer.primary, ...done.offer.rest]);
    expect(after.filter(o => /^take_(pile|item)\(/.test(o.does ?? ''))).toEqual([]);
  });
  it('haggles with a trader once, over everything they sell, their trade no longer than their wares', async () => {
    const t = await Tiny.start(shop, { horizon: ['services'] });
    t.journey.coin(20); t.look();
    const r = new Runner(t.session);
    await ask(r, { act: 't__mabel#talk' });
    const rows = (said: Awaited<ReturnType<typeof ask>>) => flat([...said.offer.primary, ...said.offer.rest]);
    const now = rows(await ask(r, { act: 'focus:trade:on' }));
    const haggles = now.filter(o => /^haggle/.test(o.does ?? ''));
    expect(haggles.map(o => o.label)).toEqual([expect.stringMatching(/^Haggle with Mabel · .* · one try$/)]);
    // What she would buy of the company's, the one haggle, her three wares, Back.
    const buys = now.filter(o => /^buy_item\(/.test(o.does ?? ''));
    expect(buys.length).toBe(3);
    expect(now.length).toBe(now.filter(o => /^sell/.test(o.does ?? '')).length + 1 + buys.length + 1);
    const after = rows(await ask(r, { act: haggles[0]!.id }));
    expect(after.filter(o => /^haggle/.test(o.does ?? ''))).toEqual([]);
    expect(after.filter(o => /^buy_item\(/.test(o.does ?? '')).length).toBe(3);
  });
});
