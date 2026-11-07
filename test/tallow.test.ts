import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import { PlaySession } from '../src/session/play-session';
import steps from './fixtures/tallow/journey.json';

// Tallow Deep, played by the labels a player sees. One continuous session of two expeditions:
//   the first, from the village by the Tallymen's adit and back with what was found, sold, and slept on;
//   the second, by another way in (the Rising), up the Conduit past the spiders, across the Cistern Hall by
//   what the slump eats, down the Bore past the custodians and the stalkers, and home by a road that had been shut.
// Fights are not in these steps: every danger has a way round it, and the specs for a fight's own sake are elsewhere.
describe('Tallow Deep', () => {
  const campaign = 'data/campaigns/tallow.campaign.json';
  const kinds = (j: Journey, ...ks: string[]) => ks.map(k => j.holds('holding', 'party', k));

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('is prepared for, entered, explored, left, sold from and slept on, and the first expedition stays done', async () => {
    const j = await Journey.start(campaign, 'tallow');
    await j.play(...steps.lore);
    for (const f of ['breakthrough_known', 'calx_known', 'gate_known']) { expect(j.holds('knows', 'party', f)).toBe(true); }
    await j.play(...steps.shop, ...steps.descend);
    // Paying the toll makes the Tallymen let the company be.
    expect(j.holds('tolerates', 'bend_watch', 'party')).toBe(true);
    await j.play(...steps.stores);
    expect(j.holds('baited', 'rats')).toBe(true);
    expect(j.holds('dead', 'rats')).toBe(false);
    await j.play(...steps.counting);
    expect(j.holds('knows', 'party', 'counting_known')).toBe(true);
    await j.play(...steps.shaft);
    expect(j.at('party')).toBe('tallow__foremans_office');
    expect(j.holds('knows', 'party', 'letter_read')).toBe(true);
    expect(kinds(j, 'ironglass_dagger', 'dowsing_rod', 'rose_quartz', 'zoological_manual')).toEqual([true, true, true, true]);
    // Home by the way it came: up the shaft by rope, past the Tallymen, out of the portal.
    await j.play(...steps.home);
    expect(j.at('party')).toBe('tallow__green');
    const gold = j.measure('quantity', 'party', 'gold');
    await j.play(...steps.sell);
    expect(j.measure('quantity', 'party', 'gold')).toBeGreaterThan(gold + 60);
    // The consequence of the night: the rats are dead, whatever the company did meanwhile.
    expect(j.holds('dead', 'rats')).toBe(true);
    // Saved and taken up again, the company stands where it did and the world is as it was left.
    const again = PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true });
    expect(Journey.of(again).holds('dead', 'rats')).toBe(true);
    expect(Journey.of(again).at('party')).toBe('tallow__taproom');
  }, 280000);

  it('is entered a second time by another way, crossed from top to bottom, and left by a road that had been shut', async () => {
    const j = await Journey.start(campaign, 'tallow');
    await j.play(...steps.lore, ...steps.shop, ...steps.descend, ...steps.stores, ...steps.counting, ...steps.shaft, ...steps.home,
      ...steps.sell, ...steps.second_shop);
    // By the Rising this time: the bat chimney's guano is what the slump eats; the Settling Cistern's rats are poisoned,
    // the spiders' webs burned; the sluice shut, the causeway to the Cap is dry for four hours.
    j.roll('pass');
    await j.play(...steps.rising);
    expect(j.holds('baited', 'settling_rats')).toBe(true);
    expect(j.at('tallow__spiders')).toBe('tallow__spider_vault');
    await j.play(...steps.conduit);
    expect(j.holds('tolerates', 'slump', 'party')).toBe(true);
    expect(j.holds('knows', 'party', 'period_known')).toBe(true);
    expect(j.at('party')).toBe('tallow__the_cap');
    await j.play(...steps.bore);
    expect(j.holds('tolerates', 'custodians', 'party')).toBe(true);
    expect(j.at('party')).toBe('tallow__dial_room');
    await j.play(...steps.dial);
    expect(kinds(j, 'celestial_chart', 'ancient_orrery', 'lensing_crystal', 'antique_compass')).toEqual([true, true, true, true]);
    await j.play(...steps.back, ...steps.out);
    expect(j.at('party')).toBe('tallow__lane');
    // The shut road is open now, to everyone who comes after: from either end.
    expect(j.holds('state', 'calx_gate', 'raised')).toBe(true);
    expect(j.holds('state', 'portal_inside', 'cleared')).toBe(true);
    expect(j.holds('laid', 'party')).toBe(true);
  }, 290000);

  it('has its dead counted: the ledger gives Dunstan his name back and lays the ghouls without a roll', async () => {
    const j = await Journey.start(campaign, 'tallow');
    j.give('ledger_item');
    await j.play('To Swallet lane', 'To Swallet green', "Into the Chandler's Arms", 'Read Dunstan the names from the Foreman\'s ledger');
    expect(j.holds('namesRead', 'party')).toBe(true);
    j.put('party', 'ossuary');
    await j.step('Read the fourteen names aloud over the stacked dead');
    expect(j.holds('dead', 'ghouls')).toBe(true);
  }, 120000);

  it('lets the beat be had from a living man, the toll lapse, and the Cap hold the river back', async () => {
    const j = await Journey.start(campaign, 'tallow');
    await j.play('To Swallet lane', 'To Swallet green', "Into the Chandler's Arms", 'Ask Dunstan about the ticking under the pipe');
    expect(j.holds('knows', 'party', 'period_known')).toBe(true);
    j.put('party', 'the_cap');
    j.assert('state', 'sluice', 'wound');
    const before = j.measure('shutAt', 'sluice');
    await j.step('Wait › An hour');
    await j.step('Turn the Cap\'s bronze ring to hold the river back another four hours');
    expect(j.measure('shutAt', 'sluice')).toBeGreaterThan(before);
  }, 120000);

  it('puts questions to the asker, and what is answered is remembered', async () => {
    const j = await Journey.start(campaign, 'tallow');
    await j.play('To Swallet lane', 'To Swallet green', "Into the Chandler's Arms", 'Say why you are going up the hill', 'For the men who did not come out');
    expect(j.holds('motiveDead', 'party')).toBe(true);
    await j.play("Tell Dunstan you came for the men who did not come out");
    j.put('party', 'tally_room');
    j.give('excise_item');
    await j.play('Ask Sib what a woman does on the bend of a smugglers\' adit', 'Open it. A lock is an opinion');
    expect(j.holds('willing', 'sib', 'party')).toBe(true);
    await j.play('Show Sib the letter from the drowned man', 'Burn it where she can see');
    expect(j.holds('sibBurned', 'party')).toBe(true);
    j.put('party', 'adit_mouth');
    j.give('vault_collar');
    await j.play('Ask Nib why he watches the portal so hard', 'Give Nib the cat\'s collar', 'No. It was not quick');
    expect(j.holds('nibTold', 'party')).toBe(true);
  }, 120000);

  it('lets companions be hired, keep a vow, and go home', async () => {
    const j = await Journey.start(campaign, 'tallow');
    j.put('party', 'tally_room');
    await j.play('Ask Sib what a woman does on the bend of a smugglers\' adit', 'Open it. A lock is an opinion', 'Ask Sib Wray to join the company');
    expect(j.holds('travelsWith', 'sib', 'party')).toBe(true);
    j.put('party', 'shop');
    j.assert('knows', 'party', 'cap_known');
    await j.play('Ask Osk to come and look at the Cap', 'Yes. If it asks to be left alone', 'Ask Osk to join the company');
    expect(j.holds('travelsWith', 'osk', 'party')).toBe(true);
    j.put('party', 'gear_hall');
    expect(j.find('Let Osk cut one sample from the grey wall')).toBeUndefined();
    await j.play('Ask Osk to leave the wall alone');
    expect(j.holds('oskLeft', 'party')).toBe(true);
    j.put('party', 'green');
    await j.step('Wait › A while');
    expect(j.holds('travelsWith', 'osk', 'party')).toBe(false);
  }, 120000);
});
