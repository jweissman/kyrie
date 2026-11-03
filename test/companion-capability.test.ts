import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Let One Remember's F7 (LOR-12): a companion who reads link-script took eight bespoke actions ("Ask Teshen to read
// …"). What she brings is a capability, by what she carries; every change that needs it is the company's while she
// is with it, and not before.
describe("a companion's capability", () => {
  it('is the company\'s while she is with it', async () => {
    const j = await Journey.start('test/fixtures/probes/reader/probe.campaign.json');
    expect(j.offers('Read what is cut')).toBe(false);
    await j.play('Ask Teshen to join');
    await j.play('Read what is cut');
    expect(j.holds('state', 'p__carving', 'p__read')).toBe(true);
  }, 60000);
});
