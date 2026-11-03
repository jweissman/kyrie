import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import type { BundleSource } from '../src/campaign/bundle-source';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { City, Q, campaign } from './support/quittance';

// The Scuttled Barge (doc/adventures/quittance/quests/barge.md): the Prudent Margaret, a calm owner, an adjuster who
// has been paid, two salvor crews, a girl in a cellar; and the bell's hatch, the Reach's way down.
const person = (name: string, classId: string) => ({ name, raceId: 'human', classId });
const plain = {};
// A company with a tongue, a book and a pair of light fingers; and one with a back, a book and a tongue.
const smooth = { party: [person('Lys', 'bard'), person('Orrin', 'mage'), person('Pip', 'thief')] };
const lettered = { party: [person('Bran', 'warrior'), person('Orrin', 'mage'), person('Lys', 'bard')] };
const pious = { party: [person('Mara', 'cleric'), person('Lys', 'bard'), person('Pip', 'thief')] };
const water = ['^To the river towpath', '^Pay Tam Ridd'];
const hauled = ['^To the river towpath', 'Take a turn on the lighter'];

const start = (seed: string, party: object = plain, way: string[] = City.honest) =>
  City.start(seed, party).then(async j => { await j.play(...way); return j; });
const has = (j: Journey, relation: string, ...args: string[]) => City.has(j, relation, ...args);
const ruling = (j: Journey) => j.measure(Q('bg_ruling'), Q('lamprey'));
// What other authors' rewards would put in the company's hands (a forged writ, the Teague combination): until their files
// land, a stand-in for the Forger's file (q_forger.kyr is a stub) offers them in a pocket action, and nothing else changes.
const pocket = `Module quittance "Quittance" {
  Description "A stand-in for the rewards of other adventures.".
  Item test_writ "a writ of the Lamprey & River, not quite" is forged_writ at nowhere.
  Action test_pocket_writ(actor: group) "Pocket a writ" { Requires able(actor) and company(actor). Time 0. On success { Give test_writ to actor. } }
  Action test_pocket_combination(actor: group) "Recall the combination" { Requires able(actor) and company(actor). Time 0. On success { Assert teagueCombination(actor). } }
}`;
const standIn: BundleSource = { resolve: (r, f) => NodeBundleSource.shared.resolve(r, f),
  read: p => /q_forger\.kyr$/.test(p) ? Promise.resolve(pocket) : NodeBundleSource.shared.read(p) };
const startWith = (seed: string, party: object = plain) => Journey.start(campaign, seed, { source: standIn, ...party }).then(async j => { await j.play(...City.honest); return j; });
// The girl found: Cob Jessop vouches for a company that came by the Water-Stair, Kitty tells it, and is promised.
const kitty = ['>quittance__sluice_room', 'Search here', 'Tell Cob Jessop that Tam', 'Down to the Sluice-tap', 'Ask Kitty how she came',
  'Promise Kitty', '>quittance__sluice_room'];
const lowWater = ['=17:00'];
// A way that is open, not one the page only shows shut ("... — look at the bell's hatch").
const goes = (j: Journey, label: string) => j.choices().some(c => c.label === label);

describe('The Scuttled Barge: the Mere Wharf', () => {
  it('the Slate chalks the claim and the wharf has a tide: low water at five and five, and the bell only then', async () => {
    const j = await start('tide');
    expect(City.knows(j, 'bg_claim')).toBe(false);
    await j.play('>quittance__slip_room');
    expect(City.knows(j, 'bg_claim')).toBe(true);
    await j.play('>quittance__cradle');
    expect(j.offers('Crank the diving-bell')).toBe(false);
    expect(City.page(j)).toContain('dry');
    await j.play('=17:00');
    expect(j.offers('Crank the diving-bell')).toBe(true);
    await j.play('=20:00');
    expect(j.offers('Crank the diving-bell')).toBe(false);
  }, 120000);

  it('doing nothing: Orpwood signs a Total Loss at noon on the second day, the girl is shipped on the third night, the lamps are sold on the fourth', async () => {
    const j = await start('nothing', plain, water);
    await j.play(...kitty.slice(0, 5));
    expect(has(j, 'bg_girl_met', 'party')).toBe(true);
    await j.play('=day 3 11:50');
    expect(ruling(j)).toBe(0);
    await j.play('=day 3 12:10');
    expect(ruling(j)).toBe(1);
    expect(j.at(Q('bg_girl'))).toBe(Q('bg_cellar'));
    await j.play('=day 4 22:30');
    expect(has(j, 'bg_girl_gone', 'bg_girl')).toBe(true);
    expect(j.at(Q('bg_girl'))).toBeUndefined();
    expect(has(j, 'witness', 'bg_girl')).toBe(false);
    expect(has(j, 'keeper', 'reach')).toBe(false);
    await j.play('=day 5 12:30');
    expect(has(j, 'bg_auctioned', 'lamprey')).toBe(true);
    await j.play('>quittance__mere_wharf');
    expect(City.page(j)).toContain('SOLD');
    expect(City.regard(j, 'lamprey')).toBe(0);
    // Once it is called, a company that comes late can still lay a fraud before the bell, and not after.
    expect(j.offers('Lay the scuttling')).toBe(false);
  }, 240000);

  it('the Lamprey brigade will not take the sluice trap until it has been searched out: the cellar is a find', async () => {
    const j = await start('trap');
    await j.play('>quittance__sluice_room');
    expect(j.offers('Down to the Sluice-tap')).toBe(false);
    await j.play('Search here');
    expect(City.knows(j, 'bg_cellar_known')).toBe(true);
    expect(j.offers('Down to the Sluice-tap')).toBe(true);
  }, 120000);
});

describe('The Scuttled Barge: ways through', () => {
  it('brawn: the bell cranked down at low water shows the berth and the short count, and the fraud handed in costs the girl', async () => {
    const j = await start('brawn');
    await j.play('>quittance__cradle', ...lowWater, 'Crank the diving-bell');
    expect(j.at('party')).toBe(Q('margaret_hold'));
    await j.play('crates: Examine', 'berth in the straw: Examine', 'planking: Examine');
    expect(City.knows(j, 'bg_counted')).toBe(true);
    expect(City.knows(j, 'bg_holed')).toBe(true);
    expect(City.knows(j, 'bg_berth')).toBe(true);
    expect(City.knows(j, 'd_barge_girl')).toBe(false);
    // The bell was Lamprey property and the company took it without a chit: remembered by name.
    expect(has(j, 'bg_slighted_dree', 'party')).toBe(true);
    // The tide turns while they are down: the lightermen wind them up.
    await j.play('=20:10');
    expect(j.at('party')).toBe(Q('cradle'));
    const gold = City.gold(j);
    await j.play('>quittance__lamprey_floor', 'Lay the scuttling');
    expect(ruling(j)).toBe(4);
    expect(City.regard(j, 'lamprey')).toBe(2);
    expect(City.gold(j)).toBe(gold + 12);
    expect(has(j, 'bg_gave_up_girl', 'party')).toBe(true);
    expect(has(j, 'bg_girl_listed', 'bg_girl')).toBe(true);
    expect(j.at(Q('bg_girl'))).toBeUndefined();
    expect(has(j, 'witness', 'bg_girl')).toBe(false);
    expect(has(j, 'keeper', 'reach')).toBe(false);
    await j.play('>quittance__mere_wharf');
    expect(City.page(j)).toContain('Lamprey officer');
    // The fraud is the call: no salvage or average is offered after it.
    await j.play('>quittance__lamprey_floor');
    expect(j.offers('call her a Salvage')).toBe(false);
  }, 240000);

  it('coin: a company without a back pays the lightermen six coin to turn the crank, and takes no cranking check', async () => {
    const j = await start('hired', smooth);
    await j.play('>quittance__cradle', ...lowWater);
    expect(j.offers('Crank the diving-bell')).toBe(false);
    const gold = City.gold(j);
    await j.play('Pay the lightermen six coin');
    expect(City.gold(j)).toBe(gold - 6);
    expect(j.at('party')).toBe(Q('margaret_hold'));
    await j.play('Rap on the bell');
    expect(j.at('party')).toBe(Q('cradle'));
  }, 120000);

  it('stealth: after dark the tarpaulin gives up eighty-nine wet jars; Skell, shown them, gives up his claim and his sons', async () => {
    const j = await start('d', smooth);
    await j.play('>quittance__skell_yard', '=21:00', 'Slip into Skell');
    expect(City.knows(j, 'bg_skell_dived')).toBe(true);
    expect(j.offers('Pack › a wet cold-lamp jar')).toBe(true);
    await j.play('=day 2 06:00', 'Tell Skell you have seen');
    expect(has(j, 'bg_skell_out', 'bg_skell')).toBe(true);
    expect(j.holds('tolerates', Q('bg_sons'), 'party')).toBe(true);
  }, 240000);

  it('stealth, and then the call: a salvage, with the Yard paid, the owner ruined and the Lamprey a little obliged', async () => {
    const j = await start('d', smooth);
    await j.play('>quittance__skell_yard', '=21:00', 'Slip into Skell', '=day 2 06:00');
    const gold = City.gold(j);
    await j.play('>quittance__lamprey_floor', 'call her a Salvage');
    expect(ruling(j)).toBe(2);
    expect(City.regard(j, 'lamprey')).toBe(1);
    expect(City.gold(j)).toBe(gold + 12);
    expect(has(j, 'bg_veasey_ruined', 'party')).toBe(true);
    // The saviour is ruined, the girl is hidden but not safe, and nobody asked the child.
    expect(has(j, 'witness', 'bg_girl')).toBe(false);
    await j.play('>quittance__mere_wharf');
    expect(City.page(j)).toContain('Salvors’ Yard crew');
    // Tam Ridd, who was never paid by or carried for them, has come up to the Stairs to see the Margaret raised, and shrugs.
    expect(j.at(Q('ridd'))).toBe(Q('lighter_stairs'));
    await j.play('>quittance__lighter_stairs', 'Ask Tam Ridd how the Stair takes the Margaret');
    expect(City.page(j)).toContain('did not take to being asked');
  }, 240000);
});

describe('The Scuttled Barge: caught in Skell\'s yard', () => {
  const caught = ['>quittance__skell_yard', '=21:00', 'Slip into Skell'];
  const warriors = { party: [person('Bran', 'warrior'), { name: 'Bor', raceId: 'dwarf', classId: 'warrior' }, person('Pip', 'thief')] };

  it('caught, and fought, and lost: three men with boat-hooks are not a figure of speech', async () => {
    const j = await start('a', warriors);
    await j.play(...caught);
    expect(City.page(j)).toContain('private tarpaulin');
    expect(City.knows(j, 'bg_skell_dived')).toBe(false);
    await j.play('^Attack');
    expect(City.page(j)).toContain('The fight is lost');
  }, 240000);

  it('caught, and fought, and won: the sons fall, and Skell is a man without a crew', async () => {
    const j = await start('m', warriors);
    await j.play(...caught, '^Attack');
    expect(City.page(j)).toContain('The fight is won');
    expect(j.offers('Pay Skell')).toBe(false);
    expect(j.holds('dead', Q('bg_sons'))).toBe(true);
    // Killed in their own yard: the Reach does not forget, and the Captain has been slighted.
    expect(has(j, 'bg_killed_sons', 'party')).toBe(true);
    expect(has(j, 'bg_slighted_dree', 'party')).toBe(true);
    expect(has(j, 'bg_skell_out', 'bg_skell')).toBe(true);
    await j.play('Wait › A while');
    expect(City.pages(j)).toContain('three of Skell');
  }, 240000);

  it('caught, and bought: six coin to have been asleep, and no fight', async () => {
    const j = await start('a', warriors);
    await j.play(...caught);
    const gold = City.gold(j);
    await j.play('Pay Skell.s sons six coin');
    expect(City.gold(j)).toBe(gold - 6);
    expect(j.holds('tolerates', Q('bg_sons'), 'party')).toBe(true);
    expect(j.offers('Attack')).toBe(false);
    expect(City.page(j)).not.toContain('fight');
  }, 240000);

  it('caught, and shown the licence: premises named in a claim are open to its adjuster', async () => {
    const j = await City.start('a', smooth).then(async g => { await g.play(...City.slip); return g; });
    await j.play(...caught);
    expect(j.offers('Show Skell')).toBe(true);
    await j.play('Show Skell');
    expect(j.holds('tolerates', Q('bg_sons'), 'party')).toBe(true);
    expect(j.offers('Attack')).toBe(false);
  }, 240000);

  it('caught, and shown the licence, and not believed: it says adjuster, and it does not say at night', async () => {
    const j = await City.start('c', smooth).then(async g => { await g.play(...City.slip); return g; });
    await j.play(...caught, 'Show Skell');
    expect(j.holds('tolerates', Q('bg_sons'), 'party')).toBe(false);
    expect(j.offers('Show Skell')).toBe(false);
    expect(j.offers('Pay Skell')).toBe(true);
  }, 240000);

  it('caught, and a name that frightens them: Captain Dree, out-bargained, knows where the company is', async () => {
    const j = await start('a', smooth);
    await j.play('>quittance__salvor_yard', 'Examine', '>quittance__dree_room', 'Bargain Captain Dree down');
    expect(City.arc(j, 'dree')).toBe(1);
    await j.play(...caught);
    expect(j.offers('Captain Dree knows where you are')).toBe(true);
    await j.play('Captain Dree knows where you are');
    expect(j.holds('tolerates', Q('bg_sons'), 'party')).toBe(true);
    expect(j.offers('Attack')).toBe(false);
    expect(City.page(j)).toContain('Dree');
  }, 240000);

  it('a company that was never out-bargained is not frightened of Captain Dree\'s name', async () => {
    const j = await start('a', warriors);
    await j.play(...caught);
    expect(City.arc(j, 'dree')).toBe(0);
    expect(j.offers('Captain Dree knows where you are')).toBe(false);
  }, 240000);
});

describe('The Scuttled Barge: lore and a deal with the Captain', () => {
  const book = { party: [person('Bran', 'warrior'), person('Orrin', 'mage'), person('Lys', 'bard')] };
  it('the manifest against the tally: four hundred jars entered, three hundred and eleven chalked; the tariff board read as a clerk would; Dree out-bargained and the Margaret called as agreed', async () => {
    const j = await start('d', book);
    await j.play('>quittance__salvor_yard', 'Examine');
    expect(City.knows(j, 'bg_tariff_known')).toBe(true);
    await j.play('>quittance__lighter_stairs', 'tally-board: Examine');
    expect(City.knows(j, 'bg_tally_read')).toBe(true);
    await j.play('>quittance__lamprey_floor');
    expect(j.offers('Set the Margaret.s manifest')).toBe(false);
    await j.play('manifest: Examine', 'Set the Margaret.s manifest');
    expect(City.knows(j, 'bg_count_short')).toBe(true);
    await j.play('Read the Lamprey.s table');
    expect(City.knows(j, 'bg_average_known')).toBe(true);
    // The Captain is out-bargained: the sixpence a dive he offers is sixpence he has never offered.
    expect(j.offers('Strike a bargain')).toBe(false);
    await j.play('>quittance__dree_room');
    expect(j.offers('Strike a bargain')).toBe(false);
    await j.play('Bargain Captain Dree down');
    expect(City.arc(j, 'dree')).toBe(1);
    expect(has(j, 'dree_leave', 'party')).toBe(true);
    const gold = City.gold(j);
    await j.play('Strike a bargain');
    expect(ruling(j)).toBe(3);
    expect(City.gold(j)).toBe(gold + 8);
    // The Lamprey was not told; the girl, never asked, is safe in a cellar she was not found in.
    expect(City.regard(j, 'lamprey')).toBe(0);
    expect(has(j, 'bg_staying', 'bg_girl')).toBe(true);
    expect(has(j, 'witness', 'bg_girl')).toBe(false);
    expect(j.offers('Strike a bargain')).toBe(false);
    // Asked to be generous with what he took, Dree is named so, and is changed by it.
    await j.play('Tell Captain Dree the Slate would name him generous');
    expect(City.arc(j, 'dree')).toBe(1);
    await j.play('>quittance__slip_room', 'chalk Captain Dree');
    expect(City.arc(j, 'dree')).toBe(2);
    await j.play('>quittance__dree_room');
    expect(City.page(j)).toContain('porthole');
  }, 300000);

  it('a bargain that does not come off: a company that tries to out-bargain the Captain and fails pays his twelve, or goes without the bell', async () => {
    const j = await start('d', book);
    await j.play('>quittance__dree_room', 'Bargain Captain Dree down');
    expect(City.arc(j, 'dree')).toBe(0);
    expect(j.offers('Bargain Captain Dree down')).toBe(false);
    expect(has(j, 'dree_leave', 'party')).toBe(false);
    const gold = City.gold(j);
    await j.play('Pay Captain Dree the twelve coin');
    expect(City.gold(j)).toBe(gold - 12);
    expect(City.arc(j, 'dree')).toBe(0);
    // Paid for, the bell is a hire, and no slight: but the hatch to the Sunk City is not for hire.
    await j.play('>quittance__cradle', '=17:00', 'Crank the diving-bell');
    expect(has(j, 'bg_slighted_dree', 'party')).toBe(false);
  }, 300000);
});

describe('The Scuttled Barge: the Table read badly', () => {
  it('a misread table is not read again, and the average is found another way or not at all', async () => {
    const j = await start('a', { party: [person('Bran', 'warrior'), person('Orrin', 'mage'), person('Lys', 'bard')] });
    await j.play('>quittance__lamprey_floor', 'Read the Lamprey.s table');
    expect(City.knows(j, 'bg_average_known')).toBe(false);
    expect(j.offers('Read the Lamprey.s table')).toBe(false);
    expect(has(j, 'bg_table_read', 'party')).toBe(true);
  }, 120000);
});

describe('The Scuttled Barge: the girl, the owner and the average', () => {
  it('the whole of it: Cob Jessop lets a company that carried the Stair down to Kitty; Kitty is promised; Mistress Veasey, told she is dry, signs; Orpwood and Dree sign; the Reach keeps a fire', async () => {
    const j = await start('a', smooth, water);
    await j.play('>quittance__sluice_room', 'Search here', 'Tell Cob Jessop that Tam', 'Down to the Sluice-tap');
    expect(City.knows(j, 'd_barge_girl')).toBe(false);
    await j.play('Ask Kitty how she came');
    expect(City.knows(j, 'd_barge_girl')).toBe(true);
    expect(City.knows(j, 'd_list_exists')).toBe(true);
    expect(City.knows(j, 'bg_berth')).toBe(true);
    await j.play('Promise Kitty', '>quittance__sluice_room', 'Ask Cob Jessop to keep Kitty');
    expect(has(j, 'bg_staying', 'bg_girl')).toBe(true);
    // Evidence moves nobody: the owner is not moved by the count; she is moved by the child.
    await j.play('>quittance__mere_wharf');
    expect(j.offers('Lay the manifest and the count')).toBe(false);
    await j.play('Tell Mistress Veasey that Kitty');
    expect(has(j, 'bg_veasey_yielded', 'party')).toBe(true);
    expect(j.offers('Ask Mistress Veasey to let')).toBe(false);
    await j.play('>quittance__lamprey_floor');
    expect(j.offers('General Average')).toBe(false);
    await j.play('Ask Mr Orpwood, as a colleague', '>quittance__mere_wharf', 'Ask Mistress Veasey to let');
    expect(has(j, 'bg_veasey_consents', 'party')).toBe(true);
    await j.play('>quittance__lamprey_floor');
    // The Captain's name is the last that is wanted.
    expect(j.offers('General Average')).toBe(false);
    await j.play('>quittance__salvor_yard', 'Examine', '>quittance__dree_room', 'Bargain Captain Dree down', '>quittance__lamprey_floor');
    const gold = City.gold(j);
    await j.play('General Average');
    expect(ruling(j)).toBe(5);
    expect(City.regard(j, 'lamprey')).toBe(2);
    expect(City.gold(j)).toBe(gold + 10);
    // Where the girl ends: kept, and willing to stand at the Hearing.
    expect(has(j, 'witness', 'bg_girl')).toBe(true);
    expect(j.at(Q('bg_girl'))).toBe(Q('bg_cellar'));
    expect(j.holds('promiseKept', Q('bg_kitty'))).toBe(true);
    expect(has(j, 'bg_gave_up_girl', 'party')).toBe(false);
    // The Reach, which the company has not betrayed, will keep a fire.
    expect(has(j, 'keeper', 'reach')).toBe(false);
    await j.play('>quittance__sluice_room', 'Ask Cob Jessop whether the Sluice will keep a fire');
    expect(has(j, 'keeper', 'reach')).toBe(true);
    expect(City.page(j)).toContain('light');
    await j.play('=until true');
    // Dree, asked to be generous, is generous, and the Slate says so.
    await j.play('>quittance__dree_room', 'Tell Captain Dree the Slate would name him generous', '>quittance__slip_room', 'chalk Captain Dree');
    expect(City.arc(j, 'dree')).toBe(2);
    // The Water-Stair remembers: Tam Ridd, who dropped the rope for a coin, drops it for the company's passing now.
    await j.play('>quittance__lighter_stairs');
    expect(j.at(Q('ridd'))).toBe(Q('lighter_stairs'));
    await j.play('Ask Tam Ridd how the Stair takes the Margaret');
    expect(City.page(j)).toContain('No handling');
  }, 600000);

  it('the owner moved without the girl: her hands read, and the child kept out of every book', async () => {
    const j = await start('a', pious);
    await j.play('>quittance__mere_wharf', 'Watch Mistress Veasey.s needles');
    expect(has(j, 'bg_veasey_read', 'party')).toBe(true);
    expect(City.knows(j, 'bg_owner_afraid')).toBe(true);
    expect(City.knows(j, 'd_barge_girl')).toBe(false);
    await j.play('Tell Mistress Veasey you know whose child');
    expect(has(j, 'bg_veasey_yielded', 'party')).toBe(true);
    expect(City.knows(j, 'd_barge_girl')).toBe(true);
    expect(City.knows(j, 'd_list_exists')).toBe(true);
    expect(City.knows(j, 'bg_bought')).toBe(true);
    // Her word opens the Sluice-tap trap to a company Cob Jessop does not know.
    await j.play('>quittance__sluice_room', 'Search here', 'Show Cob Jessop Mistress Veasey');
    expect(has(j, 'bg_jessop_vouches', 'party')).toBe(true);
  }, 240000);

  it('the owner not moved: pressed too hard she goes cold, and stays cold', async () => {
    const j = await start('b', pious);
    await j.play('>quittance__mere_wharf', 'Watch Mistress Veasey.s needles', 'Tell Mistress Veasey you know whose child');
    expect(has(j, 'bg_veasey_read', 'party')).toBe(true);
    expect(has(j, 'bg_veasey_cold', 'party')).toBe(true);
    expect(has(j, 'bg_veasey_yielded', 'party')).toBe(false);
    expect(City.knows(j, 'd_barge_girl')).toBe(false);
    expect(j.offers('Tell Mistress Veasey you know whose child')).toBe(false);
  }, 240000);

  it('the owner not read: a hand that misses the stitch is a hand she sees', async () => {
    const j = await start('c', pious);
    await j.play('>quittance__mere_wharf', 'Watch Mistress Veasey.s needles');
    expect(has(j, 'bg_veasey_read', 'party')).toBe(false);
    expect(has(j, 'bg_veasey_cold', 'party')).toBe(true);
    expect(j.offers('Watch Mistress Veasey')).toBe(false);
    expect(j.offers('Tell Mistress Veasey you know whose child')).toBe(false);
  }, 240000);

  it('a promise to a girl is a promise: the company that promises Kitty and then lays the fraud before the Lamprey has broken it, and the Reach does not forget', async () => {
    const j = await start('a', smooth, water);
    await j.play(...kitty, '>quittance__lamprey_floor', 'Lay the scuttling');
    expect(ruling(j)).toBe(4);
    expect(j.holds('promiseBroken', Q('bg_kitty'))).toBe(true);
    expect(has(j, 'bg_broke_kitty', 'party')).toBe(true);
    expect(j.at(Q('bg_girl'))).toBeUndefined();
    await j.play('>quittance__lighter_stairs');
    expect(City.page(j)).toContain('spits');
    await j.play('>quittance__sluice_room');
    expect(has(j, 'keeper', 'reach')).toBe(false);
  }, 300000);

  it('a lighterman who does not know them can be asked: a company with a tongue is let down to the girl', async () => {
    const j = await start('a', smooth);
    await j.play('>quittance__sluice_room', 'Search here', 'Tell Cob Jessop you mean the child no harm');
    expect(has(j, 'bg_jessop_vouches', 'party')).toBe(true);
    await j.play('Down to the Sluice-tap');
    expect(j.at('party')).toBe(Q('bg_cellar'));
  }, 240000);

  it('a lighterman who does not know them can say no: and the refusal stays refused, for lack of a better door', async () => {
    const j = await start('d', smooth);
    await j.play('>quittance__sluice_room', 'Search here', 'Tell Cob Jessop you mean the child no harm');
    expect(has(j, 'bg_jessop_vouches', 'party')).toBe(false);
    expect(has(j, 'bg_jessop_cold', 'party')).toBe(true);
    expect(j.offers('Tell Cob Jessop you mean')).toBe(false);
    // The girl is under the trap, but he will not have her spoken to; the day-three boat will take her.
    expect(j.offers('Ask Kitty')).toBe(false);
    await j.play('=day 4 22:30');
    expect(has(j, 'bg_girl_gone', 'bg_girl')).toBe(true);
    expect(City.knows(j, 'd_barge_girl')).toBe(false);
  }, 300000);
});

describe('The Scuttled Barge: the bell\'s hatch', () => {
  const hatch = ['>quittance__cradle'];
  it('shut, to a company with nothing: no way down', async () => {
    const j = await start('hatch');
    await j.play(...hatch);
    expect(City.page(j)).toContain('dogged shut');
    expect(goes(j, 'To the foot of the diving shaft')).toBe(false);
  }, 120000);

  it('Dree\'s leave: out-bargained, the Captain\'s chit has the hatch dogged back, and the way down is bad air for twenty minutes', async () => {
    const j = await start('c', { party: [person('Lys', 'bard'), person('Orrin', 'mage'), person('Bran', 'warrior')] });
    await j.play('>quittance__salvor_yard', 'Examine', '>quittance__dree_room', 'Bargain Captain Dree down', ...hatch);
    expect(j.offers('Show the bellman Captain Dree')).toBe(true);
    await j.play('Show the bellman Captain Dree');
    expect(City.state(j, 'bg_hatch', 'open')).toBe(true);
    const before = j.minutes();
    await j.play('risk the bell.s hatch');
    expect(j.at('party')).toBe(Q('bell_foot'));
    expect(j.minutes() - before).toBeGreaterThanOrEqual(20);
    // The first of them down breathes the shaft for the rest: it hurts, once, and the shaft is aired.
    expect(City.page(j)).toContain('takes');
    expect(City.state(j, 'bg_hatch', 'aired')).toBe(true);
    await j.play('^To the diving-bell cradle$', 'To the foot of the diving shaft');
    expect(j.at('party')).toBe(Q('bell_foot'));
    expect(City.page(j)).not.toContain('takes');
    // The way is open both ways: the hatch is not wrecked.
    expect(goes(j, 'To the diving-bell cradle')).toBe(true);
  }, 240000);

  it('the Teague combination: six dials, and the plate comes up on its hinge', async () => {
    const j = await startWith('hatch');
    await j.play('Recall the combination');
    await j.play(...hatch, 'Set the six dials');
    expect(City.state(j, 'bg_hatch', 'open')).toBe(true);
  }, 120000);

  it('a writ of the Lamprey, not quite: the bellman takes it in his hat, and the hatch is opened or the Lamprey told', async () => {
    const j = await startWith('hatch', smooth);
    await j.play(...hatch);
    expect(j.offers('Show the bellman a writ')).toBe(false);
    await j.play('Pocket a writ');
    expect(j.offers('Show the bellman a writ')).toBe(true);
    expect(j.offers('Show the bellman a writ')).toBe(true);
    await j.play('Show the bellman a writ');
    expect(City.state(j, 'bg_hatch', 'open') || has(j, 'bg_writ_caught', 'party')).toBe(true);
  }, 120000);

  it('force: three hours of chain, and the bell is wrecked; the shaft is shut behind, the diving is over, the Captain has been slighted', async () => {
    const j = await start('a', { party: [person('Bran', 'warrior'), { name: 'Bor', raceId: 'dwarf', classId: 'warrior' }, person('Pip', 'thief')] });
    await j.play(...hatch);
    expect(j.offers('Break the hatch with the bell')).toBe(true);
    const before = j.minutes();
    await j.play('Break the hatch with the bell');
    expect(j.at('party')).toBe(Q('bell_foot'));
    expect(j.minutes() - before).toBeGreaterThanOrEqual(180);
    expect(City.state(j, 'bg_hatch', 'wrecked')).toBe(true);
    expect(has(j, 'bg_bell_wrecked', 'party')).toBe(true);
    expect(has(j, 'bg_slighted_dree', 'party')).toBe(true);
    // One way: nothing leads back up the shaft.
    expect(goes(j, 'To the diving-bell cradle')).toBe(false);
    expect(City.page(j)).toContain('choked');
  }, 240000);

  it('force, and a hand burned on the chain: the hatch holds, an hour is lost, and nothing else', async () => {
    const j = await start('b', { party: [person('Bran', 'warrior'), { name: 'Bor', raceId: 'dwarf', classId: 'warrior' }, person('Pip', 'thief')] });
    await j.play(...hatch, 'Break the hatch with the bell');
    expect(j.at('party')).toBe(Q('cradle'));
    expect(City.state(j, 'bg_hatch', 'shut')).toBe(true);
    expect(has(j, 'bg_slighted_dree', 'party')).toBe(false);
  }, 240000);

  it('a wrecked bell is no bell: the long way round, up the Exchange stair, the cradle has nothing to dive with', async () => {
    const j = await start('a', { party: [person('Bran', 'warrior'), { name: 'Bor', raceId: 'dwarf', classId: 'warrior' }, person('Pip', 'thief')] });
    await j.play(...hatch, 'Break the hatch with the bell', '>quittance__cradle');
    expect(City.page(j)).toContain('chain parted');
    await j.play('=day 2 17:00');
    expect(j.at('party')).toBe(Q('cradle'));
    expect(j.offers('Crank the diving-bell')).toBe(false);
    expect(j.offers('Pay the lightermen six coin')).toBe(false);
    expect(goes(j, 'To the foot of the diving shaft')).toBe(false);
  }, 300000);
});

describe('The Scuttled Barge: what a salvage does to a girl who is kept', () => {
  it('an honest salvage by a company that knows the child: the saviour is ruined and the Wards hear of it, but Kitty stays under Cob\'s trap and the Sluice keeps its fire; she will not stand for them', async () => {
    const j = await start('a', smooth, water);
    await j.play(...kitty, 'Ask Cob Jessop to keep Kitty', '>quittance__lamprey_floor', 'call her a Salvage');
    expect(ruling(j)).toBe(2);
    expect(City.regard(j, 'lamprey')).toBe(1);
    expect(has(j, 'bg_veasey_ruined', 'party')).toBe(true);
    // The washerwoman who sent the child out is turned off by the lady who saved her.
    expect(has(j, 'bg_pellow_told', 'party')).toBe(true);
    // Kitty is promised, and the promise holds: her name is in no book. But a woman ruined for her is not a woman she stands up for.
    expect(j.holds('promiseKept', Q('bg_kitty'))).toBe(true);
    expect(has(j, 'bg_staying', 'bg_girl')).toBe(true);
    expect(has(j, 'witness', 'bg_girl')).toBe(false);
    // The Reach keeps a fire all the same: the girl was kept, whatever the call.
    await j.play('>quittance__sluice_room', 'Ask Cob Jessop whether the Sluice will keep a fire');
    expect(has(j, 'keeper', 'reach')).toBe(true);
    // Tam Ridd, who dropped the rope for the company's coin, drops it for the company's passing now.
    await j.play('>quittance__lighter_stairs', 'Ask Tam Ridd how the Stair takes the Margaret');
    expect(City.page(j)).toContain('No handling');
  }, 400000);

  it('the honest salvage, unasked: Orpwood will not hear figures twice', async () => {
    const j = await start('b', smooth, water);
    await j.play(...kitty, 'Ask Cob Jessop to keep Kitty', '>quittance__lamprey_floor', 'call her a Salvage');
    expect(ruling(j)).toBe(0);
    expect(j.offers('call her a Salvage')).toBe(false);
    // He can still be moved as a colleague, and the fraud can still be handed in: both stay open until the bell.
    expect(j.offers('Lay the scuttling')).toBe(true);
    expect(j.offers('Ask Mr Orpwood, as a colleague')).toBe(true);
  }, 400000);
});

describe('The Scuttled Barge: the others on the Reach', () => {
  it('the owner is not moved by evidence: the count and the manifest laid before her change nothing', async () => {
    const j = await start('d', { party: [person('Bran', 'warrior'), person('Orrin', 'mage'), person('Lys', 'bard')] });
    await j.play('>quittance__lighter_stairs', 'tally-board: Examine', '>quittance__lamprey_floor', 'manifest: Examine', 'Set the Margaret.s manifest');
    expect(City.knows(j, 'bg_count_short')).toBe(true);
    await j.play('>quittance__mere_wharf', 'Lay the manifest and the count');
    expect(City.page(j)).toContain('weather');
    expect(has(j, 'bg_veasey_yielded', 'party')).toBe(false);
    expect(City.knows(j, 'd_barge_girl')).toBe(false);
    // The count is good for a salvage, and for the Captain; it is not a key to the cellar.
    await j.play('>quittance__sluice_room');
    expect(j.offers('Down to the Sluice-tap')).toBe(false);
  }, 300000);

  it('Hester Grindle and Josiah Skell talk of their claims', async () => {
    const j = await start('d', plain);
    await j.play('>quittance__salvor_yard', 'Talk to Hester', 'Ask Hester Grindle for the Yard', 'Ask Grindle why Skell');
    expect(City.said(j)).toContain('pump');
    expect(j.offers('how the Yard is faring')).toBe(false);
    await j.play('>quittance__skell_yard', 'Talk to Josiah', 'Ask Josiah Skell about his claim', 'Ask Skell what is under');
    expect(City.said(j)).toContain('Rain');
    expect(j.offers('how Skell and Sons are faring')).toBe(false);
  }, 300000);

  it('and, once the Margaret is called as agreed, of how they fare; the Stairs, which were not asked, have an opinion', async () => {
    const j = await start('d', { party: [person('Bran', 'warrior'), person('Orrin', 'mage'), person('Lys', 'bard')] });
    await j.play('>quittance__salvor_yard', 'Examine', '>quittance__lighter_stairs', 'tally-board: Examine', '>quittance__lamprey_floor', 'manifest: Examine', 'Set the Margaret.s manifest',
      '>quittance__dree_room', 'Bargain Captain Dree down', 'Strike a bargain');
    expect(ruling(j)).toBe(3);
    await j.play('>quittance__salvor_yard', 'Ask Hester Grindle how the Yard is faring');
    expect(City.said(j)).toContain('lightermen');
    await j.play('>quittance__skell_yard', 'Ask Skell how Skell and Sons are faring');
    expect(City.said(j)).toContain('complain');
    await j.play('>quittance__lamprey_floor', 'Ask Mr Orpwood how the Margaret stands');
    expect(City.said(j)).toContain('right size');
    await j.play('>quittance__lighter_stairs');
    expect(City.page(j)).toContain('nods to you');
  }, 400000);

  it('Orpwood, asked what he will call it, says; asked about the Margaret after she is called, he says that too', async () => {
    const j = await start('d', plain);
    await j.play('>quittance__lamprey_floor', 'Talk to Mr Orpwood', 'Ask Mr Orpwood how he will call');
    expect(City.said(j)).toContain('second day');
    expect(j.offers('as a colleague')).toBe(false);
    await j.play('=day 3 12:10');
    expect(ruling(j)).toBe(1);
    await j.play('>quittance__lamprey_floor');
    expect(j.offers('Ask Mr Orpwood how the Margaret stands')).toBe(false);
  }, 300000);
});
