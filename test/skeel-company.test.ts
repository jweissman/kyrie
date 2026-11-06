import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Fair Weather, what the company is for (doc/imbar/adventures/skeel.md): the shipped ranger, Tamar, alone, played by the
// labels a player sees. Nothing is given, put or asserted.
const home = 'data/campaigns/skeel.campaign.json';
const toPulpit = ['>cliff_road', '>clifftop', '^To the Pulpit'];

describe('Fair Weather, the ranger reads the Pulpit', () => {
  it('names the Reeve from the clay and his boot, without the boy on the Skerry, and lets the Reeve be confronted', async () => {
    const j = await Journey.start(home, 'prints');
    await j.play(...toPulpit);
    expect(j.offers('Read the clay in the lee')).toBe(false);
    await j.play('the iron in the Pulpit wall: .*Look');
    expect(j.holds('knows', 'party', 'skeel__hook_found')).toBe(true);
    expect(j.offers('Read the clay in the lee')).toBe(true);
    await j.play('Read the clay in the lee');
    expect(j.holds('knows', 'party', 'skeel__boot_prints')).toBe(true);
    expect(j.holds('knows', 'party', 'skeel__hender_did')).toBe(false);
    await j.play('^To the climbers', '>reeve_parlour');
    expect(j.holds('knows', 'party', 'skeel__boots_match')).toBe(true);
    expect(j.holds('knows', 'party', 'skeel__hender_did')).toBe(true);
    // The boy has not been found, and the dog has not been won: this is the ground's account and nobody else's.
    expect(j.holds('knows', 'party', 'skeel__nye_saw')).toBe(false);
    expect(j.holds('knows', 'party', 'skeel__nye_known')).toBe(false);
    await j.play('>wreck_house', 'Tell Hender Brask you know who hung the light', 'row out to the Holm and tell Loveday himself');
    expect(j.holds('toldToConfess', 'party')).toBe(true);
  }, 300000);
  it('shows the boots to a company that never read the clay as boots and nothing more', async () => {
    const j = await Journey.start(home, 'noprints');
    await j.play('>reeve_parlour');
    expect(j.holds('knows', 'party', 'skeel__boots_match')).toBe(false);
    expect(j.page).not.toMatch(/third one is gone/);
  }, 120000);
  it('does not offer the reading to a company without a ranger', async () => {
    const j = await Journey.start('test/fixtures/skeel/thief.campaign.json', 'thief-clay');
    await j.play(...toPulpit, 'the iron in the Pulpit wall: .*Look');
    expect(j.holds('knows', 'party', 'skeel__hook_found')).toBe(true);
    expect(j.offers('Read the clay in the lee')).toBe(false);
  }, 120000);
});
