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

// A matter decided by a rule as its time runs out is told before the next is called: "No living thing came ashore of
// her" had come after "The second matter" (Fair Weather's friction 7, FWR-07).
describe('a matter its time runs out on', () => {
  it('is decided, and told so, before the next is taken up', async () => {
    const j = await Journey.start('test/fixtures/probes/matter-lapses/probe.campaign.json');
    await j.play('=until occasionOver(court)');
    const page = j.page;
    expect(page.indexOf('No living thing came ashore')).toBeGreaterThan(-1);
    expect(page.indexOf('No living thing came ashore')).toBeLessThan(page.indexOf('The second matter'));
    expect(j.holds('matterOpen', 'p__dog')).toBe(false);
    expect(j.holds('matterDone', 'p__dog')).toBe(true);
  }, 30000);
});
