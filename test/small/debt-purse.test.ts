import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A debt is not advanced by whatever some rule pays a coin for (M21's playability list, PL-21): at the Stormy Horn
// the debt's gold had gone to "Ask Osmund Pyle to come with you", the old man with a bad hip, because a rule pays a
// coin for bringing anyone home, and every rule touching the purse had made its condition the debt's. The purse is
// waited on by selling (AimAdvances.short), never by every reward. An inn, an old man who would be walked home, a road.
const inn = `
  Place vale "the vale" is settlement.
  Place inn "the taproom" is room within vale at 0, 0 indoors.
  Place lane "the lane" is room within vale at 1, 0 outdoors.
  Passage door "the inn door" is door between inn and lane.
  Company party "You" of 1 at inn.
  Person old "Osmund" at inn { Role "an old man with a stick". Ancestry human. Peaceable. Pronouns he. }
  Initially Assert acceptsEscort(old, party). Initially Assert home(old, lane).
  Rule walked when following(old, party) and at(old, lane) { Increase quantity(party, gold) by 1. }
  Objective debt when quantity(party, gold) < 50 toward lane "You owe fifty coin by market day.".
  Goal false.`;

// A den cleared, with the coin among the bones (data/situations/den): the search is the dead beasts' act.
const den = `
  Place howe "Marsh Howe" is room at 0, 0 outdoors.
  Company party "You" of 1 at howe.
  Relation looted(group).
  Person beasts "the rats" at howe { Role "rats, fat and bold". Species rat. Numbers 1. Level 1. Lair howe. }
  Action plunder(actor: group, spot: place) "Search {spot} for what was dragged in" {
    Requires able(actor) and at(actor, spot) and not able(beasts) and not looted(actor).
    On success { Increase quantity(actor, gold) by 5. Assert looted(actor). }
  }
  Objective debt when quantity(party, gold) < 50 toward howe "You owe fifty coin by market day.".
  Goal false.`;

// A store that buys gear and valuables, a debtor carrying a calling's kit (a torch, a pole, a candle), and a gold
// ring come to lie there later, to be taken up (OR-1504).
const store = `
  Place vale "the vale" is settlement.
  Place shop "the store" is room within vale at 0, 0 indoors.
  Company party "You" of 1 at shop.
  Person levan "Levan" at shop { Role "a storekeeper". Ancestry human. Peaceable. Pronouns she. Sells torch for 1 coin from 6. }
  Initially Assert buysValuables(levan). Initially Set purse(levan) to 600. Initially Set quantity(levan, gold) to 600.
  Initially Assert dealsIn(levan, trade_gear).
  Place elsewhere "somewhere else" is room.
  Item ring "a gold ring" is grave_rings at elsewhere.
  Objective debt when quantity(party, gold) < 50 toward levan "You owe Levan fifty coin by market day.".
  Goal false.`;

describe('a debt\'s gold', () => {
  it('is not on asking along someone a rule pays a coin to see home', async () => {
    const t = await Tiny.start(inn);
    t.follow('debt');
    expect(t.journey.choices().some(c => /come with you/.test(c.label))).toBe(true);
    expect(t.gold.map(a => a.subject ?? a.label)).not.toContain('t__old');
  });
  // But an act that itself puts coin in the purse is the debt's step (PL-25): Marsh Howe's den cleared, its search
  // for what was dragged in had been only under `all`, the foreground only the way out.
  it('is on searching a cleared den for the coin dragged into it', async () => {
    const t = await Tiny.start(den);
    t.follow('debt');
    await t.perform('attack(t__beasts)');
    expect(t.journey.choices().some(c => c.command === 't__plunder(t__howe)')).toBe(true);
    expect(t.gold.map(a => a.command ?? a.for ?? a.choice)).toContain('t__plunder(t__howe)');
  });
  // Nor is it on selling what is not worth the selling (the debt's own worthSelling: worth five coin or more): s0's
  // debtor, led to sell the torch, the pole and the candle for a coin each, then to buy a torch for the dark and sell
  // it again sixteen times over, had gone up to the stones in the old woods with no light (OR-1504). The ring is.
  it('is not on selling a torch for a coin, and is on the gold ring once it is carried', async () => {
    const t = await Tiny.start(store, { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' } as never] });
    t.follow('debt');
    // Led to, or led for within a talk (the store's keeper, talked to for the sale).
    const led = () => t.gold.flatMap(a => [a.command, a.for]);
    expect(t.journey.choices().some(c => c.command === 'sell_ware(t__party_1__torch,t__levan)')).toBe(true);
    expect(led().filter(c => /^sell_/.test(c ?? ''))).toEqual([]);
    const at = (place: string) => ({ kind: 'call' as const, name: 'at', args: ['t__ring', place] });
    t.campaign.commitWorld(t.world.apply([{ kind: 'retract', call: at('t__elsewhere') },
      { kind: 'assert', call: at('t__shop') }]));
    await t.perform('take_item(t__ring,t__member_party_1)');
    expect(led().some(c => /^sell_\w+\(t__ring\b/.test(c ?? ''))).toBe(true);
  });
});
