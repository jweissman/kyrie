import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import { PlaySession } from '../src/session/play-session';
import steps from './fixtures/tallow/journey.json';

// Tallow Deep, played by the labels a player sees, from the true start of each: nothing here is put, given or asserted
// to get the company somewhere, and no check is forced to come out. Fights are not in these steps (every danger has a
// way round it, and `bin/kyrie arena` and test/fixtures hold the rest); where a die has to fall a certain way the spec
// plays another seed's dice, not the dice.
//   The first expedition goes in by the Tallymen's adit and comes home with what was found, sold and slept on.
//   The second goes in by the Rising, up the Conduit past the spiders, across the Cistern Hall by what the slump eats,
//   down the Bore past the custodians and the stalkers, restores one grey thing to the Dial, and comes home by a road
//   that had been shut, with a mason who has been promised something.
//   The rest play what the module owes its players: the toll lapsing and being paid again, the cage, hunger, the spate,
//   the river returning into the Hall, the Cap's ring, the way out of the Bore, the informer's letter.
const campaign = 'data/campaigns/tallow.campaign.json';
const kinds = (j: Journey, ...ks: string[]) => ks.map(k => j.holds('holding', 'party', k));
type Readout = { readout: { creatures: { id: string; state: { hp: number } }[] }; current: { partyIds: string[] } };
const hp = (j: Journey) => {
  const c = j.campaign as unknown as Readout;
  return c.readout.creatures.filter(x => c.current.partyIds.includes(x.id)).reduce((sum, x) => sum + x.state.hp, 0);
};
const rations = (j: Journey) => j.measure('quantity', 'party', 'rations');

describe('Tallow Deep: two expeditions', () => {
  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);
  it('is prepared for, entered, explored, left, sold from and slept on, and the first expedition stays done', async () => {
    const j = await Journey.start(campaign, 'tallow');
    await j.play(...steps.lore);
    for (const f of ['breakthrough_known', 'calx_known', 'gate_known']) { expect(j.holds('knows', 'party', f)).toBe(true); }
    await j.play(...steps.shop, ...steps.to_adit);
    // The Tallymen stand across the way in; nothing slips past them; paying makes them let the company be.
    expect(j.takes('To the long drift')).toBe(false);
    expect(j.offers('slip past')).toBe(false);
    expect(j.offers('Attack')).toBe(true);
    await j.play('Pay the Tallymen six coin for the lantern\'s loan', 'Bran: light a torch');
    expect(j.holds('tolerates', 'bend_watch', 'party')).toBe(true);
    expect(j.takes('To the long drift')).toBe(true);
    await j.play('To the long drift', 'To the Tally-Room', ...steps.stores);
    expect(j.holds('baited', 'rats')).toBe(true);
    expect(j.holds('dead', 'rats')).toBe(false);
    await j.play(...steps.counting);
    expect(j.holds('knows', 'party', 'counting_known')).toBe(true);
    await j.play(...steps.shaft);
    expect(j.at('party')).toBe('tallow__foremans_office');
    expect(j.holds('knows', 'party', 'letter_read')).toBe(true);
    expect(j.holds('knows', 'party', 'ledger_read')).toBe(true);
    expect(kinds(j, 'ironglass_dagger', 'dowsing_rod', 'rose_quartz', 'zoological_manual')).toEqual([true, true, true, true]);
    // Home by the way it came: up the shaft by rope, past the Tallymen, out of the portal.
    await j.play(...steps.home);
    expect(j.at('party')).toBe('tallow__green');
    const gold = j.measure('quantity', 'party', 'gold');
    await j.play(...steps.sell);
    expect(j.measure('quantity', 'party', 'gold')).toBeGreaterThan(gold + 60);
    // The ledger read aloud to the one who lived gives him his name back, and the page pinned to the beam says so.
    await j.play('Read Barrick the names from the Foreman\'s ledger');
    expect(j.holds('namesRead', 'party')).toBe(true);
    // The consequence of the night: the rats are dead, whatever the company did meanwhile.
    expect(j.holds('dead', 'rats')).toBe(true);
    // Saved and taken up again, the company stands where it did and the world is as it was left.
    const again = PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true });
    expect(Journey.of(again).holds('dead', 'rats')).toBe(true);
    expect(Journey.of(again).at('party')).toBe('tallow__taproom');
  }, 280000);
  it('is entered a second time by another way, crossed from top to bottom, and left by a road that had been shut', async () => {
    const j = await Journey.start(campaign, 'tallow');
    await j.play(...steps.lore, 'Into the Chandler\'s Arms', 'Say why you are going up the hill', 'For the men who did not come out',
      'Tell Barrick you came for the men who did not come out', 'Out to Swallet green', ...steps.shop,
      'To the Day-Level portal', 'To the adit', 'Pay the Tallymen six coin for the lantern\'s loan',
      'Bran: light a torch', 'To the long drift', 'To the Tally-Room', ...steps.stores, ...steps.counting, ...steps.shaft, ...steps.home,
      ...steps.sell, ...steps.second_shop, ...steps.osk, 'Out to Swallet green');
    expect(j.holds('travelsWith', 'osk', 'party')).toBe(true);
    // By the Rising this time: the bat chimney's guano is what the slump eats; the Settling Cistern's rats are
    // poisoned, the spiders' webs burned; the sluice shut, the causeway to the Cap is dry for four hours.
    await j.play(...steps.rising);
    expect(j.holds('baited', 'settling_rats')).toBe(true);
    expect(j.at('tallow__spiders')).toBe('tallow__spider_vault');
    await j.play(...steps.conduit);
    expect(j.holds('tolerates', 'slump', 'party')).toBe(true);
    await j.play(...steps.wall);
    expect(j.holds('knows', 'party', 'period_known')).toBe(true);
    expect(j.at('party')).toBe('tallow__the_cap');
    // The ring is the only way to hold the river longer, and it costs a day's food and an hour.
    const food = rations(j), watch = j.watch();
    await j.play(...steps.ring);
    expect(rations(j)).toBe(food - 1);
    expect(j.watch()).toBeGreaterThanOrEqual(watch + 6);
    expect(j.measure('ringTurns', 'sluice')).toBe(1);
    await j.play(...steps.bore, 'Ask Usk to leave the wall alone');
    expect(j.holds('oskLeft', 'party')).toBe(true);
    await j.play(...steps.gear);
    expect(j.holds('tolerates', 'custodians', 'party')).toBe(true);
    expect(j.at('party')).toBe('tallow__dial_room');
    await j.play(...steps.dial);
    expect(kinds(j, 'celestial_chart', 'ancient_orrery', 'lensing_crystal', 'antique_compass')).toEqual([true, true, true, true]);
    expect(j.holds('orreryOut')).toBe(true);
    // Setting one thing back spends it and is counted; what stays in the pack is still owed to the shelf.
    await j.play('Set the orrery back on the shelf of grey metal');
    expect(kinds(j, 'celestial_chart', 'ancient_orrery', 'lensing_crystal', 'antique_compass')).toEqual([true, false, true, true]);
    expect(j.measure('shelfRestored', 'party')).toBe(1);
    expect(j.holds('orreryOut')).toBe(false);
    expect(j.holds('shelfShort')).toBe(true);
    await j.play(...steps.back, 'To the Ossuary');
    // What Barrick said of how the Foreman laid the dead is a way to say the words; the ledger is another, with no die.
    expect(j.holds('knows', 'party', 'vault_laid')).toBe(true);
    expect(j.offers('Say the burial words in the order Barrick says Carr laid the dead')).toBe(true);
    expect(j.offers('Say the Company\'s burial words')).toBe(false);
    await j.play(...steps.out.slice(1));
    expect(j.at('party')).toBe('tallow__lane');
    // The shut road is open now, to everyone who comes after: from either end.
    expect(j.holds('state', 'calx_gate', 'raised')).toBe(true);
    expect(j.holds('state', 'portal_inside', 'cleared')).toBe(true);
    expect(j.holds('laid', 'party')).toBe(true);
    // At the green the tick under the pipe is late (three things are still off the shelf), and the mason who was
    // asked to leave the wall alone goes home to cut his stone.
    await j.play('To Swallet green');
    expect(j.page).toContain('the tick has changed');
    expect(j.holds('travelsWith', 'osk', 'party')).toBe(false);
    // Told the old road is open, the landlady sells the Tallymen out: their adit is empty, and so is the Tally-Room,
    // with nobody left in it to be talked to.
    await j.play('Into the Chandler\'s Arms', 'Tell Lowen the old road is open');
    expect(j.holds('sold_out', 'party')).toBe(true);
    await j.play('Out to Swallet green', 'To the Brasiers\' garden', ...steps.to_adit);
    expect(j.takes('To the long drift')).toBe(true);
    await j.play('?Bran: light a torch', 'To the long drift', 'To the Tally-Room');
    expect(j.offers('Talk to Sib Wray')).toBe(false);
    expect(j.offers('Talk to Cador Tarbet')).toBe(false);
    expect(j.page).toContain('The Tally-Room is empty');
  }, 290000);
});

describe('Tallow Deep: the hill\'s own clocks', () => {
  it('lets a lapsed toll be paid again at the bend, and never keeps anyone in', async () => {
    const j = await Journey.start(campaign, 'tallow');
    await j.play('To Swallet lane', 'To Swallet green', 'To the Brasiers\' garden', ...steps.to_adit,
      'Pay the Tallymen six coin for the lantern\'s loan', 'Bran: light a torch', 'To the long drift', 'To the Tally-Room');
    // A day and more inside: the lantern's loan runs out, and the way out is still open.
    await j.step('=+150');
    expect(j.holds('lapsed', 'party')).toBe(true);
    expect(j.holds('tolerates', 'bend_watch', 'party')).toBe(false);
    await j.play('To the long drift', 'To the adit');
    expect(j.at('party')).toBe('tallow__adit');
    expect(j.takes('To the long drift')).toBe(false);
    expect(j.offers('slip past')).toBe(false);
    expect(j.offers('six coin for the lantern')).toBe(false);
    await j.play('Pay the Tallymen six coin again');
    expect(j.holds('tolerates', 'bend_watch', 'party')).toBe(true);
    expect(j.holds('lapsed', 'party')).toBe(false);
    await j.play('To the long drift', 'To the Tally-Room');
    expect(j.at('party')).toBe('tallow__tally_room');
  }, 120000);
  it('has a cage that goes down once and may not hold, and one history for the man who went up the walk after a cat', async () => {
    const j = await Journey.start(campaign, 'tallow');
    await j.play(...steps.lore, 'Into Usk\'s store', 'Buy › A torch', 'Out to Swallet green', 'To the Brasiers\' garden', 'To the Day-Level portal');
    const nib = await j.step('Ask Nib what happened to Treve');
    const nibCat = await j.step('Ask Nib why he watches the portal so hard');
    await j.play('To the adit', 'Pay the Tallymen six coin for the lantern\'s loan', 'Bran: light a torch', 'To the long drift', 'To the Tally-Room');
    const cador = await j.step('Ask Cador about Treve');
    const spiders = await j.step('Ask Cador about the spiders');
    // One history, told by three people: three weeks ago, on a Tuesday, up the Aenean service walk after the boy's cat.
    for (const told of [nib, nibCat, cador]) { expect(told).toContain('Tuesday'); }
    for (const told of [nib, cador, spiders]) { expect(told).toMatch(/three weeks/); }
    for (const told of [nib, cador]) { expect(told).toMatch(/stair|walk/); }
    await j.play('To the winding-house');
    expect(j.offers('risk the Blind Shaft\'s cage')).toBe(true);
    const before = hp(j);
    await j.step('To the sump of the Blind Shaft — risk the Blind Shaft\'s cage › Bran goes first');
    // It carried them or it did not, and either way the chain is spent and the cage is gone.
    expect(j.holds('state', 'cage', 'fallen')).toBe(true);
    expect(j.offers('risk the Blind Shaft\'s cage')).toBe(false);
    expect(hp(j)).toBeLessThanOrEqual(before);
    expect(['tallow__sump', 'tallow__winding']).toContain(j.at('party')!);
  }, 120000);
  it('is hungry when the food is gone, and hunger bites', async () => {
    const j = await Journey.start(campaign, 'tallow');
    await j.play('To Swallet lane', 'To Swallet green');
    const before = hp(j);
    await j.step('=+700');
    expect(rations(j)).toBe(0);
    expect(j.holds('hungry', 'party')).toBe(true);
    expect(j.page).toContain('Hunger gnaws');
    expect(hp(j)).toBeLessThan(before);
  }, 120000);
  it('lets an owlbear be baited and the way to the Swallow be taken, and nothing be slipped past her', async () => {
    const j = await Journey.start(campaign, 'tallow');
    await j.play('To Swallet lane', 'To Swallet green', 'To the upland track', 'To the heather scrub');
    expect(j.takes('To the rim of the Swallow')).toBe(false);
    expect(j.offers('slip past')).toBe(false);
    expect(j.page).toContain('does not intend to be passed');
    await j.play('Leave a ration of meat in the heather and back away');
    expect(j.takes('To the rim of the Swallow')).toBe(true);
    expect(j.latest).toContain('head down in what you left');
    expect(j.latest).not.toContain('does not intend to be passed');
    await j.play('To the rim of the Swallow', 'To the foot of the Swallow');
    expect(j.at('party')).toBe('tallow__swallow_foot');
  }, 120000);

  it('has a river that comes down in spate: the ford is shut, the gallery is hit, and it goes down again', async () => {
    const j = await Journey.start(campaign, 'a');
    await j.play('To Swallet lane', 'To Swallet green', 'To the bank below the Rising', 'To the mouth of the Rising', 'To the Rising Gallery');
    expect(j.holds('state', 'wend', 'low')).toBe(true);
    // Wait in the gallery, an hour at a time, for rain on the downs.
    for (let hours = 0; hours < 24 * 3 && !j.holds('surged', 'party'); hours++) { await j.step('=+6'); }
    expect(j.holds('state', 'wend', 'spate')).toBe(true);
    expect(j.page).toContain('a long, even roar');
    expect(j.page).toContain('A noise like a cart on a bridge');
    expect(j.holds('state', 'gallery_spate', 'flooding')).toBe(true);
    // The way out is shut by the water until it goes down.
    expect(j.takes('To the mouth of the Rising')).toBe(true);
    await j.play('To the mouth of the Rising');
    expect(j.takes('To the bank below the Rising')).toBe(false);
    await j.step('=until state(wend, low)');
    expect(j.takes('To the bank below the Rising')).toBe(true);
  }, 200000);
  it('tells of the river before it comes back into the Hall, and then it comes; the Cap seals nobody in', async () => {
    const j = await Journey.start(campaign, 'tallow');
    await j.play(...steps.lore, ...steps.hall_shop, ...steps.rising.slice(0, 11));
    // The webs bar the way on, and nothing slips past them; nor past the slump with the causeway dry and no guano fed.
    expect(j.at('party')).toBe('tallow__spider_gallery');
    expect(j.takes('To the Upper Conduit')).toBe(false);
    expect(j.offers('slip past')).toBe(false);
    await j.play('?Bran: light a torch');
    expect(j.page).toContain('Tier on tier of web');
    await j.play(...steps.rising.slice(11), ...steps.conduit.slice(0, 6));
    expect(j.at('party')).toBe('tallow__cistern_hall');
    expect(j.takes('To the Cap')).toBe(false);
    expect(j.offers('slip past')).toBe(false);
    await j.play(...steps.conduit.slice(6));
    expect(j.takes('To the Cap')).toBe(true);
    expect(j.holds('state', 'sluice', 'wound')).toBe(true);
    // Waiting in the Hall with a light: the river is heard before it is seen, twice, and then it comes.
    const heard: string[] = [];
    for (let i = 0; i < 12 && j.holds('state', 'sluice', 'wound'); i++) {
      await j.play('?Bran: light a torch', 'Wait › An hour');
      heard.push(j.latest);
    }
    const heardHall = heard.join(' ');
    expect(heardHall).toContain('a groaning, a long way off');
    expect(heardHall).toContain('creep toward each other');
    expect(heardHall.indexOf('a groaning, a long way off')).toBeLessThan(heardHall.indexOf('A boom comes down the stair'));
    expect(heardHall).toMatch(/resists? \(strength\)/);
    expect(j.holds('state', 'sluice', 'open')).toBe(true);
    // Nobody who has not stood on the Cap can cross the causeway while the river runs.
    expect(j.takes('To the Cap')).toBe(false);
    expect(j.offers('risk the causeway')).toBe(false);
    // Back up to the wheel, and shut it again; this time cross to the Cap, and do not leave.
    await j.play('To the Upper Conduit', ...steps.conduit.slice(0, 3), 'To the Upper Conduit', 'To the Cistern Hall', ...steps.wall.slice(1));
    expect(j.at('party')).toBe('tallow__the_cap');
    // Three turns of the ring, and the Legion's grease is gone: the fourth is not offered.
    const food = rations(j);
    await j.play('?Bran: light a torch', ...steps.ring, ...steps.ring, ...steps.ring);
    expect(rations(j)).toBeLessThanOrEqual(food - 3);
    expect(j.offers('Turn the Cap\'s bronze ring')).toBe(false);
    // Let it come: the Cap tells of it, and the causeway is shut under the water.
    let said = '';
    for (let i = 0; i < 12 && j.holds('state', 'sluice', 'wound'); i++) { said += await j.step('Wait › An hour'); }
    expect(said).toContain('groaning');
    expect(j.holds('state', 'sluice', 'open')).toBe(true);
    expect(j.takes('To the Cistern Hall')).toBe(false);
    // The way out is the river itself, at a risk to whoever goes first.
    expect(j.offers('To the Cistern Hall — risk the causeway')).toBe(true);
    await j.step('To the Cistern Hall — risk the causeway › Bran goes first');
    expect(j.at('party')).toBe('tallow__cistern_hall');
  }, 290000);
});

describe('Tallow Deep: people', () => {
  it('lets a hired Tallywoman be shown the drowned man\'s letter at the weir, and be gone when she goes', async () => {
    const j = await Journey.start(campaign, 'tallow');
    await j.play(...steps.lore, ...steps.sib_shop, ...steps.to_adit, 'Pay the Tallymen six coin for the lantern\'s loan',
      'Bran: light a torch', 'To the long drift', 'To the Tally-Room', ...steps.sib_hire);
    expect(j.holds('travelsWith', 'sib', 'party')).toBe(true);
    await j.play(...steps.to_settling);
    expect(j.page).toContain('I know that coat');
    await j.play('a letter on the Board\'s paper: Take', 'a letter on the Board\'s paper: Read', 'Show Sib the letter from the drowned man');
    const gold = j.measure('quantity', 'party', 'gold');
    await j.play('Take it to the Board yourself, for the reward');
    expect(j.measure('quantity', 'party', 'gold')).toBe(gold + 8);
    // She has gone, and gone from here: not offered, not talked to, not heard close by in the dark.
    expect(j.holds('travelsWith', 'sib', 'party')).toBe(false);
    expect(j.offers('Talk to Sib Wray')).toBe(false);
    expect(j.offers('Sib Wray')).toBe(false);
    await j.step('Wait › A while');
    expect(j.at('sib')).toBeUndefined();
    expect(j.latest).not.toContain('Sib Wray close by');
  }, 200000);
});
