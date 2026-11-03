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
    expect(Object.values(of('world__owlbear').by).every(d => ForecastTool.beyond.has(d))).toBe(true);
    expect(Object.values(of('world__brock').by)).toEqual(['slight', 'slight']);
    expect(of('world__owlbear').temperament).toBe('territorial');
  }, 60000);
});
