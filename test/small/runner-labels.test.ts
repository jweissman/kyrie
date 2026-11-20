import { describe, expect, it } from 'bun:test';
import { Runner, type Said } from '../../src/cli/runner';
import { Tiny } from '../support/tiny';

// A row says what it does (cold play 2, CL-05: "Talk to the factor" had sold the crown): a talk is offered only by an
// act that talks, and what an opener is led for is called by its own words. A buyer of what the company carries, and
// someone to talk to beside him: whatever the offer leads with, no "Talk to …" does anything but talk. The factor
// buys the crown lying in the yard, and an aim leads to the sale once it is carried: the yard had no buyer and nothing
// to sell, so no row could ever have been a sale (the sprint audit, 19 November: the sale half vacuous).
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Kind crown_kind "a bronze crown" is gear worth 30 weighing 1 described "A dented crown of bronze.".
  Item crown "the bronze crown" is crown_kind at yard.
  Person factor "the factor" at yard { Role "the company's factor". Ancestry human. Peaceable. Pronouns he.
    Buys crown_kind for 20 coin. }
  Person wat "Wat" at yard { Role "a carter". Ancestry human. Peaceable. Pronouns he. }
  Topic weather with wat "Ask Wat about the weather" when true { Says "'Rain by noon,' says Wat.". }
  Objective selling when carries(party, crown) toward factor "The factor buys crowns. Sell him this one.".
  Goal false.`;
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const rows = (s: Said) => [...s.offer.primary, ...s.offer.rest, ...s.offer.primary.flatMap(o => o.opens ?? [])];
const sale = 'sell(t__crown,t__factor)';
// The crown taken, talking with the factor or not yet met with him: the row that sells, and what it is called.
async function sold(talk: boolean): Promise<{ r: Runner; row: { id: string; label: string } }> {
  const r = new Runner((await Tiny.start(yard)).session);
  const by = async (id: string) => { const o = rows(r.said()).find(x => x.id.startsWith(id)); expect(o).toBeDefined();
    return said(await r.ask(JSON.stringify({ act: o!.id }))); };
  // Met first, and the talk begun again with the crown carried: a stranger's row leads with the sale (as below).
  if (talk) { await by('talk_to(t__factor)'); await by('take_leave(t__factor)'); }
  await by('take_item(t__crown,');
  if (talk) { await by('talk_to(t__factor)'); }
  const row = (talk ? rows(r.said()) : r.said().offer.primary).find(o => o.id === sale);
  expect(row).toBeDefined();
  return { r, row: row! };
}

describe('a row says what it does', () => {
  it('offers a talk only by an act that talks', async () => {
    const t = await Tiny.start(yard), r = new Runner(t.session);
    for (let i = 0; i < 4; i++) {
      const turn = r.said(), all = [...turn.offer.primary, ...turn.offer.rest];
      // Or opens onto what can be said to them, doing nothing of its own (TB-12).
      expect(all.filter(o => /^Talk to /.test(o.label) && !/^talk_to\(/.test(o.id) && !o.opens)
        .map(o => `${o.label} = ${o.id}`)).toEqual([]);
      const next = all.find(o => o.type === 'talk') ?? all[0];
      if (!next) { break; }
      said(await r.ask(JSON.stringify({ act: next.id })));
    }
  });
  // The aim toward a stranger leads with talking to him, the sale after it (Doable.called); talking with him, the
  // sale is its own row by its own words. Either way the row says the sale, and doing it sells: the purse up by the
  // factor's price, the crown gone. Called by the opener's words alone ("Talk to the factor"), it would fail here.
  it('calls a sale by the sale\'s words, led or talked into', async () => {
    const led = await sold(false), talked = await sold(true);
    expect(led.row.label).toBe('Talk to the factor — sell the bronze crown');
    expect(talked.row.label).toBe('Sell the bronze crown to the factor');
    const before = talked.r.said().purse!.coin, after = said(await talked.r.ask(JSON.stringify({ act: sale })));
    expect(after.purse!.coin - before).toBe(20);
    expect(rows(after).some(o => o.id.includes('t__crown'))).toBe(false);
  });
});
