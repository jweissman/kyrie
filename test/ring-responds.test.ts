import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Ring } from './support/ring';
import { GeneratedWorld } from './support/generated';

// The ring answers what the company has exposed (doc/imbar/17-the-ring.md, the table of responses). Each interference
// is something its own people see; each answer is a fact in the world that outlasts the visit and survives a reload.
type World = Awaited<ReturnType<typeof Ring.world>>;
const F = (id: string) => `factors__${id}`;
const T = (id: string) => `ptolleth__${id}`;
const seen = (j: Journey) => PlayerView.observe(j.campaign).observations.map(o => o.text).join(' ');
const reload = (w: World) => Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(w.s.checkpoint()))));
const cellar = async (w: World) => {
  await GeneratedWorld.travel(w.s, `${w.town}_taproom`);
  await w.j.play('Search');
  w.j.coin(80);
  await w.j.play("To the Exchange's cellar", 'Pay the cellar-men six', 'Look through the cellar');
};

describe('the ring answers', () => {
  it('hires muscle when its cellar is searched, and posts it on the stair to the book', async () => {
    const w = await Ring.world('thorn', 'mountain');
    const { j } = w;
    await cellar(w);
    // The cellar-men saw the company search, and the Principal's hire is on its way; it is posted a few hours later.
    expect(j.holds(F('hired'), F('principal'))).toBe(true);
    expect(j.at(F('bravos'))).toBe(F('abroad'));
    await j.play('^Wait › An hour', '^Wait › An hour');
    expect(j.at(F('bravos'))).toBe(F('counting_room'));
  }, 600000);

  it('sends the hired hands to where the company sleeps, at night, and takes five coin to sit on the stair', async () => {
    const w = await Ring.world('thorn', 'mountain');
    const { j } = w;
    await cellar(w);
    await j.play('^To the taproom', '^Wait › An hour', '^Wait › Until dark');
    await j.play('^Wait › A while');
    expect(j.at(F('bravos'))).toBe(`region__${w.town}_taproom`);
    await j.play('Pay the hired men five coin');
    expect(j.holds('tolerates', F('bravos'), 'party')).toBe(true);
    // The answer outlasts the visit, and the reload.
    const back = reload(w);
    expect(back.session.canonical()).toBe(w.s.canonical());
    expect(back.holds(F('hired'), F('principal'))).toBe(true);
    expect(back.at(F('bravos'))).toBe(`region__${w.town}_taproom`);
    expect(back.holds('tolerates', F('bravos'), 'party')).toBe(true);
  }, 600000);

  it('burns the book in a day if the company searched the cellar and did not take it', async () => {
    const w = await Ring.world('thorn', 'mountain');
    const { j } = w;
    await cellar(w);
    expect(j.holds('inside', F('leaf'), F('strongbox'))).toBe(true);
    await j.play(`=${j.watch() + 200}`);
    expect(j.holds('inside', F('leaf'), F('strongbox'))).toBe(false);
    expect(j.holds(F('burnt'), F('principal'))).toBe(true);
    j.put('party', F('counting_room'));
    await j.play('^Wait › A while');
    expect(seen(j)).toContain('fresh ash');
  }, 600000);

  it('does not burn what the company already holds', async () => {
    const w = await Ring.world('thorn', 'mountain');
    const { j } = w;
    await cellar(w);
    await j.play('Pack › A cellar waybill › Read', '^To the taproom');
    j.roll('pass');
    await j.play('Put the cellar waybill to', '^To the counting-room', 'Open the strongbox', "Take from the factor's strongbox");
    j.roll(undefined);
    // Out of the town, where the hired men are not: they stand on the stair to the book.
    await GeneratedWorld.travel(w.s, 'gate_tolleth');
    await j.play(`=${j.watch() + 300}`);
    expect(j.holds(F('burnt'), F('principal'))).toBe(false);
    expect(j.choices().some(c => /day-book.* › Read/.test(c.label))).toBe(true);
  }, 600000);

  it('sacrifices the lieutenant once he has talked, cuts him loose to the harbourmaster, and goes by the store to the loft', async () => {
    const w = await Ring.world('thorn', 'mountain');
    const { j } = w;
    await Ring.tolleth(w);
    // The company comes by another road: a leaf of the book is put in its hands, and the store is found from the quay.
    j.assert('knows', 'party', F('lieutenant_named'));
    j.give(F('leaf'));
    await GeneratedWorld.travel(w.s, T('shop'));
    await j.play('^Into the bonded store');
    const temper = j.measure(F('temper'), F('lieutenant'));
    j.roll('pass');
    if (temper === 1) { j.coin(40); await j.play('Offer .* twenty coin'); }
    if (temper === 2) { await j.play("Tell .* that a man of his rank"); }
    if (temper === 3) { await j.play("Lay the factor's day-book leaf before"); }
    j.roll(undefined);
    expect(j.holds(F('talkedLieutenant'), F('lieutenant'))).toBe(true);
    await j.play('^Wait › An hour');
    expect(j.holds('routed', F('lieutenant'))).toBe(true);
    expect(j.at(F('lieutenant'))).toBe(F('abroad'));
    await GeneratedWorld.travel(w.s, T('quay'));
    j.put('party', T('bonded_store'));
    await j.play('^Wait › A while');
    expect(seen(j)).toContain('The bonded store is swept');
    // The bill is on the harbourmaster's door, and the Principal's circuit leaves out the store.
    j.put('party', T('harbourmaster'));
    await j.play('^Wait › A while');
    expect(seen(j)).toContain('has absconded');
    const places = new Set<string>();
    for (let t = j.watch(); t < 1500; t += 36) { await j.play(`=${t + 36}`); places.add(String(j.at(F('principal')))); }
    expect(places.has(T('bonded_store'))).toBe(false);
    expect(places.has(T('ring_loft'))).toBe(true);
    // Routed is not recovered from: nobody rallies him at first light, for he has no refuge.
    expect(j.holds('routed', F('lieutenant'))).toBe(true);
    // And it keeps.
    const back = reload(w);
    expect(back.session.canonical()).toBe(w.s.canonical());
    expect(back.holds('routed', F('lieutenant'))).toBe(true);
  }, 900000);

  it('does not sacrifice a lieutenant who has been turned, and he is at the loft with the company\'s paper', async () => {
    const w = await Ring.world('thorn', 'mountain');
    const { j } = w;
    await Ring.tolleth(w);
    j.assert('knows', 'party', F('lieutenant_named'));
    j.give(F('leaf'));
    await GeneratedWorld.travel(w.s, T('shop'));
    await j.play('^Into the bonded store');
    const secret = j.measure(F('secret'), F('lieutenant'));
    await j.play('Put the margin of the leaf to');
    expect(j.holds(F('turned'), F('lieutenant'))).toBe(true);
    expect([1, 2, 3]).toContain(secret);
    await j.play('^Wait › An hour');
    expect(j.holds('routed', F('lieutenant'))).toBe(false);
  }, 600000);
});
