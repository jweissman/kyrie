import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/quittance/journey.json';

// Quittance, played by the labels a player sees (see Journey for the steps it takes).
describe("Quittance", () => {
  const campaign = 'data/campaigns/quittance.campaign.json';
  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);
  it('is played from the road into the square', async () => {
    const j = await Journey.start(campaign, "quittance");
    await j.play(...steps.arrive);
    expect(j.at('party')).toBe("quittance__square");
  }, 60000);
});
