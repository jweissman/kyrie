import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Liberty of the Ice's 9 (ICE-09): the Landing was five cases in watch-windows built by hand, as Low Water's
// Hearing, Tessary's Board, Wrayford's Remonstrance and Calamy's Parliament had been. An Occasion takes up its matters
// in order: each said as it opens, open until its own condition closes it or its time is up, then the next; then over.
describe('an occasion', () => {
  it('takes up its matters in order, each until it is decided or its time is up, and is over after the last', async () => {
    const j = await Journey.start('test/fixtures/probes/occasion/probe.campaign.json');
    expect(j.offers('Speak for the herring men')).toBe(false);
    expect(await j.play('=until matterOpen(herring)')).toContain('Master Harker brings the herring case');
    expect(await j.play('Speak for the herring men', 'Wait › A while')).toContain('The boat case is called');
    expect(j.holds('matterDone', 'p__herring')).toBe(true);
    expect(j.offers('Speak for the herring men')).toBe(false);
    expect(await j.play('=until occasionOver(landing)')).toContain('the Landing is over for the day');
    expect(j.watch()).toBe(j.measure('matterSince', 'p__boat') + 3);
  }, 30000);
});
