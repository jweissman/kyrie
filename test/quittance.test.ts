import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/quittance/journey.json';

// Quittance, played by the labels a player sees: the first hour, from the road to a licence at the Bell & Slip.
describe('Quittance', () => {
  const campaign = 'data/campaigns/quittance.campaign.json';
  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 120000);
  it('is played from the road, through the Arch, to a licence', async () => {
    const j = await Journey.start(campaign, 'quittance');
    await j.play(...steps.arrive);
    expect(j.at('party')).toBe('quittance__gate_plaza');
    await j.play(...steps.licence);
    expect(j.at('party')).toBe('quittance__slip_room');
    expect(j.holds('carries', 'party', 'quittance__licence_card')).toBe(true);
  }, 120000);
});
