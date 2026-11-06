import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// "Outbid the House with the Pharos oil": Skerrow's keeper, told what the other lights are, gives three kegs; two of
// them light Port Ness and the Holm. Also the Holm itself: a tide-gated causeway, a widow, a stump with the device.
const campaign = 'data/campaigns/the-dorothea.campaign.json';
const k = (id: string) => `dorothea__${id}`;
const party = (j: Journey) => j.campaign.world.one('at', 'party');

const toHolm = async (j: Journey) => {
  await j.play('=until at(hull, ness_quay)', '^To Port Ness pier', '^To Salt Row', '^To the salt pans', '^To the Ness strand');
};

describe('The Holm', () => {
  it('is reached by a causeway that is dry for five hours in twelve, and shuts behind a company that lingers', async () => {
    const j = await Journey.start(campaign, 's1');
    j.assert(k('seaQuiet'), k('hull'));
    await j.play('^To Tolleth quay', 'Ask Captain Bascom for passage', 'Ask Captain Bascom where else', 'Ask Captain Bascom to put in at Port Ness',
      'Pay Captain Bascom four', "^To the Dorothea's waist");
    await toHolm(j);
    const phase = () => j.measure(k('phase'), k('tide'));
    if (phase() < 30 || phase() >= 60) { expect(j.matches("^To the Holm").length).toBe(0); }
    await j.play('=until phase(tide) >= 30 and phase(tide) < 60');
    expect(j.matches("^To the Holm").length).toBe(1);
    await j.play("^To the Holm.s beach", 'Ask Marit Oake what the House pays', '^To the lamp-stump');
    expect(party(j)).toBe(k('holm_stump'));
    expect(j.page).toContain('fish with a flame');
    await j.play('Ask Odile Quint to read the device');
    expect(j.page).toContain('KEPT, FOR THEM THAT COME HOME');
    // The tide turns; the way back is shut until the next low water.
    await j.play('=until phase(tide) >= 60');
    await j.play('^To the Holm.s beach|^Out to');
    expect(j.matches('^To the Ness strand').length).toBe(0);
    await j.play('=until phase(tide) >= 30 and phase(tide) < 60');
    expect(j.matches('^To the Ness strand').length).toBe(1);
  }, 600000);

  it('lights the stump for six coin, a word and the raft\'s lantern (the lantern fixture stands for the random draw)', async () => {
    const j = await Journey.start(campaign, 's1');
    j.assert(k('seaQuiet'), k('hull'));
    await j.play('^To Tolleth quay', 'Ask Captain Bascom for passage', 'Ask Captain Bascom where else', 'Ask Captain Bascom to put in at Port Ness',
      'Pay Captain Bascom four', "^To the Dorothea's waist");
    await toHolm(j);
    await j.play('=until phase(tide) >= 30 and phase(tide) < 60', "^To the Holm.s beach", '^To the lamp-stump');
    j.give('lantern');
    j.assert(k('raftLantern'), 'party');
    await j.play('Show Marit Oake the lantern');
    expect(j.holds(k('maritWilling'), 'party')).toBe(true);
    await j.play('Set the raft.s lantern on the stand');
    expect(j.holds(k('lampLit'), k('lamp_holm'))).toBe(true);
    expect(j.page).toContain('as if it had never been off');
  }, 600000);
});

describe('The Pharos oil', () => {
  it('is given by Marren Kestle to a company that has read two ledgers and tells her of the other lights; it lights Port Ness and the Holm', async () => {
    const j = await Journey.start(campaign, 's1');
    j.assert(k('seaQuiet'), k('hull'));
    await j.play('^To Tolleth quay', 'Ask Captain Bascom for passage', 'Pay Captain Bascom six', "^To the Dorothea's waist",
      '^To the quarterdeck', "^To the captain's cabin");
    j.roll('pass');
    await j.play("Read the ledgers on Bascom's cabin shelf");
    j.roll();
    expect(j.measure(k('leaves'), 'party')).toBe(1);
    await j.play('=180', '^To the quarterdeck', 'lie off', '=215', "^To the Dorothea's waist", '^To Skerrow jetty', '^To Skerrow green', '^Into the Gull');
    j.roll('pass');
    await j.play('Read Silas Quillon.s open ledger');
    j.roll();
    expect(j.measure(k('leaves'), 'party')).toBe(2);
    await j.play('Ask Silas Quillon whom he answers to', '^Out to', '^To the path up Pharos Hill', '^To the foot of the Pharos', '^To the lamp room',
      'Tell Marren Kestle what the House');
    expect(j.holds('holding', 'party', k('dorothea_oil_keg')) || j.holds('holding', 'party', 'dorothea_oil_keg')).toBe(true);
    await j.play('^To the foot of the Pharos', '^To the path up Pharos Hill', '^To Skerrow green', '^To the jetty road|^To Skerrow jetty', '^To the Dorothea');
    await j.play('=800', '^To Tolleth quay', '=+40');
    expect(j.measure(k('voyages'), k('hull'))).toBe(1);
    await j.play('Ask Captain Bascom to put in at Port Ness', 'Pay Captain Bascom four', "^To the Dorothea's waist");
    await j.play('=until at(hull, ness_quay)', '^To Port Ness pier', '^To Salt Row', '^To the foot of the Ness Light', "^To the Ness Light.s lantern", 'Fill the Ness Light');
    expect(j.holds(k('lampLit'), k('lamp_ness'))).toBe(true);
    await j.play('^To the foot of the Ness Light', '^To Salt Row', '^To the salt pans', '^To the Ness strand');
    await j.play('=until phase(tide) >= 30 and phase(tide) < 60', "^To the Holm.s beach", '^To the lamp-stump', 'Pay Marit Oake six coin');
    await j.play('Fill the stump.s lamp-stand');
    expect(j.holds(k('lampLit'), k('lamp_holm'))).toBe(true);
    expect(j.measure(k('freed'), 'party')).toBe(2);
  }, 900000);
});
