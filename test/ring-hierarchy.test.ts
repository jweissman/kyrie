import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Ring } from './support/ring';
import { GeneratedWorld } from './support/generated';
import { Kept } from './support/kept';
import { Frontier } from '../src/world/frontier';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

// The Ring (doc/imbar/17-the-ring.md): a Deem-cast ring of cellar-men, a fence, a lieutenant and a Principal, rolled up
// by evidence across the largest town and Tolleth, with each rank's way past it other than a fight.
type World = Awaited<ReturnType<typeof Ring.world>>;
const F = (id: string) => `factors__${id}`;
const T = (id: string) => `ptolleth__${id}`;
// Each stage of the roll-up in thorn (the country, Tolleth come into, the book read, the lieutenant turned) is played
// once in the file and resumed for each case after it (see Kept.of): every case had assembled thorn and played the
// stages before its own again.
const thorn: { w?: World['w']; town?: string } = {};
const stage = async (name: string, from?: string, make?: (w: World) => Promise<void>): Promise<World> => {
  const j = await Kept.of(`ring thorn ${name}`, async () => {
    const w = from ? await stage(from) : await Ring.world('thorn', 'mountain');
    if (!from) { thorn.w = w.w; thorn.town = w.town; }
    await make?.(w);
    return w.j;
  });
  return { w: thorn.w!, s: j.session, j, frontier: new Frontier('thorn', NodeBundleSource.shared), town: thorn.town! };
};
const inTolleth = () => stage('tolleth', 'country', w => Ring.tolleth(w));
const booked = () => stage('book', 'country', w => Town.book(w));
const turned = () => stage('lieutenant', 'book', async w => { await Ring.tolleth(w); await Town.lieutenant(w); });

// The town's three ranks, played as a player would: the hatch, the cellar-men, the waybill, the fence, the book.
class Town {
  static async cellar(w: World) {
    await GeneratedWorld.travel(w.s, `${w.town}_taproom`);
    await w.j.play('Search');
    w.j.coin(80);
    await w.j.play("To the Exchange's cellar", 'Pay the cellar-men six', 'Look through the cellar', 'Pack › A cellar waybill › Read');
  }
  static async book(w: World) {
    await this.cellar(w);
    await w.j.play('^To the taproom');
    w.j.roll('pass');
    await w.j.play('Put the cellar waybill to', '^To the counting-room', 'Open the strongbox', "Take a leaf of the Exchange's day-book from the factor's strongbox",
      "Pack › A leaf of the Exchange's day-book › Read");
    w.j.roll(undefined);
  }
  // The lieutenant, by the way his own temper allows.
  static async lieutenant(w: World) {
    const j = w.j, temper = j.measure(F('temper'), F('lieutenant'));
    await GeneratedWorld.travel(w.s, T('shop'));
    await j.play('^Into the bonded store');
    j.roll('pass');
    if (temper === 1) { await j.play('Offer .* twenty coin to say where the Principal is'); }
    if (temper === 2) { await j.play("Tell .* that a man of his rank should not be sitting at a chandler's table"); }
    if (temper === 3) { await j.play("Lay the factor's day-book leaf before"); }
    j.roll(undefined);
    // Not to wait in his store: the Principal comes there on his rounds.
    await GeneratedWorld.travel(w.s, T('quay'));
  }
}

describe('the ring, rolled up', () => {
  it('is cast by Deem from the terrain, with its own table for the lieutenant and a Principal at the top', async () => {
    const a = await stage('country'), b = await Ring.world('ash', 'frost');
    for (const w of [a, b]) {
      for (const id of ['lieutenant', 'principal', 'cell', 'bravos', 'factor']) {
        expect(w.s.campaign.module.entities.some(e => e.id === F(id))).toBe(true);
      }
      expect(w.j.measure(F('temper'), F('lieutenant'))).toBeGreaterThanOrEqual(1);
      expect(w.j.measure(F('secret'), F('lieutenant'))).toBeLessThanOrEqual(3);
      expect(w.j.measure(F('nerve'), F('principal'))).toBeGreaterThanOrEqual(1);
      expect(w.j.measure(F('stay'), F('principal'))).toBeGreaterThanOrEqual(288);
    }
    const name = (w: World, id: string) => w.s.campaign.module.entities.find(e => e.id === F(id))!.name;
    expect(name(a, 'lieutenant')).not.toBe(name(b, 'lieutenant'));
    expect(name(a, 'principal')).not.toBe(name(a, 'lieutenant'));
  }, 300000);

  it('hides the next rank until the last is read: no store door before the leaf, no loft ladder before the lieutenant', async () => {
    const w = await inTolleth();
    await GeneratedWorld.travel(w.s, T('shop'));
    expect(w.j.matches('bonded store').length).toBe(0);
    w.j.put('party', T('ness_row'));
    expect(w.j.matches('boiling-house loft').length).toBe(0);
    expect(w.j.holds('knows', 'party', F('lieutenant_named'))).toBe(false);
  }, 300000);

  it('reads the cellar, the fence and the book in the town, which names a lieutenant in Tolleth', async () => {
    const w = await booked();
    const { j } = w;
    expect(j.holds('knows', 'party', F('waybill_read'))).toBe(true);
    expect(j.holds('knows', 'party', F('ledger_read'))).toBe(true);
    expect(j.holds('knows', 'party', F('lieutenant_named'))).toBe(true);
    // The next rank is a place in another country, and it is on the map because of a leaf read here.
    await Ring.tolleth(w);
    await GeneratedWorld.travel(w.s, T('shop'));
    expect(j.matches('bonded store').length).toBe(1);
    await j.play('^Into the bonded store');
    expect(j.at(F('lieutenant'))).toBe(T('bonded_store'));
    expect(j.page).toContain('bonded store');
  }, 600000);

  it('has the lieutenant give up the Principal by his temper, and the Principal\'s ladder appears at Port Ness', async () => {
    const w = await turned();
    const { j } = w;
    expect(j.holds('knows', 'party', F('principal_traced'))).toBe(true);
    expect(j.holds(F('toldPrincipal'), F('lieutenant'))).toBe(true);
    j.put('party', T('ness_row'));
    expect(j.matches('boiling-house loft').length).toBeGreaterThanOrEqual(1);
  }, 600000);
});

// Waits, a night at a time, until a condition holds of the world.
const until = async (j: Journey, held: () => boolean, limit = 4000) => {
  for (let t = j.watch(); !held() && t < limit; t += 24) { await j.play(`==${t + 24}`); }
  expect(held()).toBe(true);
};
const branch = (w: World) => Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(w.s.checkpoint()))));

describe('the Principal, at the top', () => {
  it('goes round the town, the store, the loft and home on a circuit of his own, whether or not anyone is there', async () => {
    const w = await inTolleth();
    const { j } = w;
    const seen = new Set<string>();
    // Where he is is read after each wait, never what its hours said: told only as each ends (==).
    for (let t = j.watch(); t < 2200; t += 36) { await j.play(`==${t + 36}`); seen.add(String(j.at(F('principal')))); }
    for (const place of [F('counting_room'), T('bonded_store'), T('ring_loft'), F('abroad')]) { expect(seen.has(place)).toBe(true); }
  }, 600000);

  it('can be exposed at the loft with all three ranks read, and what he does is his nerve, drawn by Deem', async () => {
    const w = await turned();
    const { j } = w;
    await until(j, () => j.at(F('principal')) === T('ring_loft'));
    expect(j.matches('Into the Lamp Below').length).toBe(0);
    const base = w.s.checkpoint();
    const fresh = (nerve: number) => {
      const b = Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(base))));
      Ring.set(b, 'nerve', F('principal'), nerve);
      return b;
    };
    // nerve 1: he leaves the country, for good. The ring has no head.
    const flees = fresh(1);
    flees.put('party', T('ring_loft'));
    await flees.play('Lay the waybill, the leaf and the lieutenant');
    expect(flees.holds('routed', F('principal'))).toBe(true);
    expect(flees.at(F('principal'))).toBe(F('abroad'));
    // And it stays so: three days on he has not come back to his round, and the Lamp Below is open.
    await flees.play(`==${flees.watch() + 450}`);
    expect(flees.holds('routed', F('principal'))).toBe(true);
    expect(flees.at(F('principal'))).toBe(F('abroad'));
    expect(flees.holds(T('ringFallen'), 'party')).toBe(true);
    // nerve 3: he buys; taken, the company has his silver and he has its face.
    const buys = fresh(3);
    buys.put('party', T('ring_loft'));
    const before = buys.measure('quantity', 'party', 'gold');
    await buys.play('Lay the waybill, the leaf and the lieutenant', 'Take the Principal.s sixty crowns');
    expect(buys.measure('quantity', 'party', 'gold')).toBe(before + 60);
    expect(buys.holds('routed', F('principal'))).toBe(false);
    // nerve 2: he will not go. He gives the company an hour to be gone, and then the warn stands: a fight or a way out.
    const stands = fresh(2);
    stands.put('party', T('ring_loft'));
    await stands.play('Lay the waybill, the leaf and the lieutenant');
    expect(stands.holds('routed', F('principal'))).toBe(false);
    expect(stands.holds(F('stood'), F('principal'))).toBe(true);
    expect(stands.holds('tolerates', F('principal'), 'party')).toBe(true);
    expect(stands.at(F('principal'))).toBe(T('ring_loft'));
    await stands.play('^Wait › An hour');
    expect(stands.holds('tolerates', F('principal'), 'party')).toBe(false);
  }, 900000);

  it('opens the Lamp Below when the Principal flees, and not before, in the world the ring was drawn into', async () => {
    const w = await inTolleth();
    const { j } = w;
    j.put('party', T('oil_store'));
    await j.play('^Wait › A while');
    expect(j.holds(T('ringFallen'), 'party')).toBe(false);
    expect(j.matches('Into the Lamp Below').length).toBe(0);
    j.assert('routed', F('principal'));
    await j.play('^Wait › A while');
    expect(j.holds(T('ringFallen'), 'party')).toBe(true);
    await j.play('Into the Lamp Below');
    expect(j.at('party')).toBe(T('lb_head'));
    // And it is still so after a reload.
    const back = branch(w);
    expect(back.session.canonical()).toBe(w.s.canonical());
    expect(back.holds(T('ringFallen'), 'party')).toBe(true);
  }, 600000);
});
