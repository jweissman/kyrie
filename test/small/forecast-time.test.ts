import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../../src/session/play-session';
import { ForecastTool } from '../../src/cli/forecast-tool';
import { DangerSense } from '../../src/presentation/danger-sense';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';

// What the company makes of a fight before it is joined is a dozen or more fights played out (DangerSense), and the
// owner felt it, 18 November: "a fight takes a long time to start, and finishing a quest is expensive" (OR-114: taking
// up the undertown's job had reckoned its band for a second and a half). Reckoned afresh, the ford road's four bands
// for a pair of novices took 500–600 ms before the forecast's trials were made cheap (19 November), 250–290 ms after.
// The bound leaves room for a loaded machine and CI's shared runners, and still catches a forecast grown slow again.
describe('a fight reckoned before it is joined', () => {
  it('plays its trials out in a few hundred milliseconds', async () => {
    const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior' },
      { name: 'Wenna 2', raceId: 'human', classId: 'warrior' }];
    const campaign = (await PlaySession.start('test/fixtures/ford-road/campaign.json', 'forecast',
      NodeBundleSource.shared, party)).campaign;
    const bands = ForecastTool.bands(campaign), began = performance.now();
    const said = bands.map(band => DangerSense.reckon(campaign, band)?.text);
    const spent = performance.now() - began;
    expect(said.filter(Boolean)).toHaveLength(4);
    expect(spent).toBeLessThan(process.env.CI ? 4000 : 1200);
  }, 60000);
});
