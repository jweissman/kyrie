import { describe, expect, it } from 'bun:test';
import { ForecastTool } from '../src/cli/forecast-tool';

// An author's forecast of lethality at level one (BTW-09, SYS-05, HTH-18): each band a campaign can set against the
// company, reckoned as the page reckons a fight, against novices of each calling, not against the campaign's
// own company (a lint that did so called forty-five foes beyond it, footpads a warrior beats among them).
describe('a forecast', () => {
  it('weighs each band against novices of each calling', async () => {
    const forecasts = await ForecastTool.forecast('test/fixtures/ford-road/campaign.json', 'forecast',
      ['warrior', 'mage']);
    const of = (band: string) => forecasts.find(f => f.band === band)!;
    // Beyond a novice mage; a novice warrior beats one about two times in five, and twelve fights reckoned of it can
    // come out "hard" (M19-122: the reckoning's few trials, open).
    expect(ForecastTool.beyond.has(of('world__owlbear').by.mage!)).toBe(true);
    expect(['hard', ...ForecastTool.beyond] as string[]).toContain(of('world__owlbear').by.warrior!);
    // An easy fight, if not always unhurt: "no match" only where no fight played went badly (Mission 20, round 6).
    expect(Object.values(of('world__brock').by).every(d => ['slight', 'fair'].includes(d!))).toBe(true);
    expect(of('world__owlbear').temperament).toBe('territorial');
  }, 60000);
});
