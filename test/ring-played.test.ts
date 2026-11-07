import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Ring } from './support/ring';
import { GeneratedWorld } from './support/generated';

// The Ring as a player meets it in a drawn world (the play-through in doc/imbar/playtests/ring-and-lamp-player.md): the
// signposts that send a company to the next country, the lieutenant who is still in his store long enough to be asked,
// the Principal met by walking up his ladder (a warning running, as no `put` makes it), and each nerve's answer to
// being shown the three ranks: he runs, he buys, he stands for an hour, or his own lieutenant has gone over.
type World = Awaited<ReturnType<typeof Ring.world>>;
const F = (id: string) => `factors__${id}`;
const T = (id: string) => `ptolleth__${id}`;
const branch = (j: Journey) => Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint()))));
const journal = (j: Journey) => (PlayerView.observe(j.campaign).knowledge as { id: string; text: string }[]).map(k => `${k.id} ${k.text}`).join('\n');

// The town's three ranks, as a player does them: the hatch, the cellar, the waybill, the fence, the book.
const book = async (w: World) => {
  const { j } = w;
  await GeneratedWorld.travel(w.s, `${w.town}_taproom`);
  await j.play('Search');
  j.coin(80);
  await j.play("To the Exchange's cellar", 'Pay the cellar-men six', 'Look through the cellar', 'Pack › A cellar waybill › Read', '^To the taproom');
  j.roll('pass');
  await j.play('Put the cellar waybill to', '^To the counting-room', 'Open the strongbox', "Take from the factor's strongbox",
    "Pack › A leaf of the Exchange's day-book › Read");
  j.roll(undefined);
};
// Into the lieutenant's store by the door the leaf names.
const store = async (w: World) => {
  await Ring.tolleth(w);
  await GeneratedWorld.travel(w.s, T('shop'));
  await w.j.play('^Into the bonded store');
};
const talk = async (j: Journey) => {
  const temper = j.measure(F('temper'), F('lieutenant'));
  j.roll('pass');
  if (temper === 1) { await j.play('Offer .* twenty coin'); }
  if (temper === 2) { await j.play('Tell .* that a man of his rank'); }
  if (temper === 3) { await j.play("Lay the factor's day-book leaf before"); }
  j.roll(undefined);
};
// To the loft by the ladder, with the Principal in it and his warning running.
const loft = async (j: Journey) => {
  j.put('party', T('ness_row'));
  for (let t = j.watch(); j.at(F('principal')) !== T('ring_loft') && t < 4000; t += 18) { await j.play(`=${t + 18}`); }
  expect(j.at(F('principal'))).toBe(T('ring_loft'));
  await j.play('ladder to the boiling-house loft');
};

describe('the Ring, signposted for a company that does not know the country', () => {
  it('says in the cellar, the book and the journal which way the next rank lies, and that the Principal goes round', async () => {
    const w = await Ring.world('thorn', 'mountain');
    await book(w);
    const text = journal(w.j);
    expect(text).toMatch(/Tolleth is the harbour at the east end of the coast road/);
    expect(text).toMatch(/round of dates and places, never twice the same night/);
    expect(w.j.page).toMatch(/where the road ends at the water, behind a chandler/);
    // Once she has been pressed the fence stops saying what she says to customers, and says what she will do.
    expect(w.j.matches('Ask .* whom the Exchange answers to').length).toBe(0);
    await w.j.play('^To the taproom', 'Ask .* what she will do now');
    expect(w.j.latest).toMatch(/goes round/);
  }, 600000);

  it('keeps the lieutenant in his store for half an hour after he has talked, long enough to ask where the Principal is, and then takes him out of it', async () => {
    const w = await Ring.world('thorn', 'mountain');
    const { j } = w;
    await book(w);
    await store(w);
    await talk(j);
    expect(j.holds(F('talkedLieutenant'), F('lieutenant'))).toBe(true);
    expect(j.latest).toMatch(/Dorothea/);
    expect(j.latest).toMatch(/lamp in the gable/);
    expect(j.holds('routed', F('lieutenant'))).toBe(false);
    expect(j.at(F('lieutenant'))).toBe(T('bonded_store'));
    await j.play('Ask .* where the Principal is tonight');
    expect(j.holds('knows', 'party', F('principal_traced'))).toBe(true);
    expect(journal(j)).toMatch(/lamp lit in the gable by day means he is in/);
    await j.play('^Wait › An hour');
    expect(j.holds('routed', F('lieutenant'))).toBe(true);
    expect(j.at(F('lieutenant'))).toBe(F('abroad'));
  }, 900000);
});

describe('the Principal, met at the loft with the warning running', () => {
  it('runs at nerve 1, offers silver without a blow at nerve 3, and stands for an hour at nerve 2 before the door closes', async () => {
    const w = await Ring.world('thorn', 'mountain');
    const { j } = w;
    await book(w);
    await store(w);
    await talk(j);
    await loft(j);
    expect(j.page).toContain('closes the black book');
    const fresh = (nerve: number) => { const b = branch(j); Ring.set(b, 'nerve', F('principal'), nerve); return b; };
    const hp = (b: Journey) => (PlayerView.observe(b.campaign).party as { hp: number }[]).map(m => m.hp);
    const runs = fresh(1);
    await runs.play('Lay the waybill, the leaf and the lieutenant');
    expect(runs.holds('routed', F('principal'))).toBe(true);
    expect(hp(runs).every(h => h > 0)).toBe(true);
    await runs.play('^Wait › A while');
    expect(runs.holds(T('ringFallen'), 'party')).toBe(true);
    // He buys, and no blow was struck while he was making his offer.
    const buys = fresh(3);
    await buys.play('Lay the waybill, the leaf and the lieutenant');
    expect(buys.holds(F('offered'), F('principal'))).toBe(true);
    expect(hp(buys).every(h => h > 0)).toBe(true);
    expect(buys.holds('routed', F('principal'))).toBe(false);
    await buys.play('Take the Principal.s sixty crowns');
    expect(hp(buys).every(h => h > 0)).toBe(true);
    // Refused, the courtesy is spent: he is warning again.
    const refused = fresh(3);
    await refused.play('Lay the waybill, the leaf and the lieutenant', 'Refuse the Principal.s sixty crowns');
    expect(refused.holds('tolerates', F('principal'), 'party')).toBe(false);
    // He stands: an hour in which the company can walk down the ladder, and the company is alive at the end of it.
    const stands = fresh(2);
    await stands.play('Lay the waybill, the leaf and the lieutenant');
    expect(stands.holds(F('stood'), F('principal'))).toBe(true);
    expect(stands.holds('tolerates', F('principal'), 'party')).toBe(true);
    expect(stands.matches('Lay the waybill, the leaf').length).toBe(0);
    expect(hp(stands).every(h => h > 0)).toBe(true);
    await stands.play('^Wait › An hour');
    expect(stands.holds('tolerates', F('principal'), 'party')).toBe(false);
    expect(stands.page).toMatch(/An hour\. After that I shall not be able to help/);
    // A company that took the hour walked out of it, down the ladder, and the Principal is still at his loft.
    const leaves = fresh(2);
    await leaves.play('Lay the waybill, the leaf and the lieutenant', 'Out to Salt Row');
    await leaves.play('^Wait › An hour', '^Wait › An hour');
    expect(hp(leaves).every(h => h > 0)).toBe(true);
    expect(leaves.holds('routed', F('principal'))).toBe(false);
  }, 1800000);

  it('breaks at nerve 2 or 3 when his own lieutenant has gone over to the company, and the Lamp Below opens', async () => {
    const w = await Ring.world('thorn', 'mountain');
    const { j } = w;
    await book(w);
    await store(w);
    await j.play('Put the margin of the leaf to');
    expect(j.holds(F('turned'), F('lieutenant'))).toBe(true);
    // The turned lieutenant gives up the Principal as an ordinary one does, and is not taken out of his store.
    expect(j.holds('knows', 'party', F('principal_traced'))).toBe(true);
    await j.play('Ask .* where the Principal is tonight');
    await j.play('^Wait › An hour');
    expect(j.holds('routed', F('lieutenant'))).toBe(false);
    await loft(j);
    for (const nerve of [2, 3]) {
      const b = branch(j);
      Ring.set(b, 'nerve', F('principal'), nerve);
      await b.play('Lay the waybill, the leaf and the lieutenant');
      expect(b.page).toMatch(/My man signed/);
      expect(b.holds('routed', F('principal'))).toBe(true);
      await b.play('^Wait › A while');
      expect(b.holds(T('ringFallen'), 'party')).toBe(true);
    }
  }, 1800000);
});

describe('the Lamp Below in a drawn world', () => {
  it('speaks to the company by what its members bring, not by a calling no member of a drawn world is given', async () => {
    const w = await Ring.world('thorn', 'mountain');
    const { j } = w;
    await Ring.tolleth(w);
    const brings = (cap: string) => j.campaign.world.related('brings').some(f => f.args[1] === cap && /member_party/.test(f.args[0]!));
    expect(brings('woodcraft')).toBe(true);
    j.put('party', T('lb_stair'));
    await j.play('=+1');
    expect(j.holds(T('vStair'), 'party')).toBe(true);
    expect(j.page).toMatch(/steps are worn on the inside edge/);
  }, 600000);
});
