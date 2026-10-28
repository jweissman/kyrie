import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// A Winter in Carth's 3 (CTH-03, severe): rules that spoke in one watch of a wait were told out of the order they are
// written, the morning before the night it ended, the company's tally before Carth's account. What stopped the wait
// (the last rule to speak) was told first as its result, and again in its place. It is told once, in its place.
describe('what rules say as a wait is cut short', () => {
  it('is told in the order the rules are written', async () => {
    const j = await Journey.start('test/fixtures/probes/cut-order/probe.campaign.json');
    await j.play('Wait › An hour');
    expect(j.taken.at(-1)!.page).toBe('The long night ends at last. Your second morning at the farm comes grey over the byre.');
  }, 30000);
  // The Banns at Hessel's 24 (HSL-22): a sentence about a thing came where the engine put it. Written as a line of the
  // place, it is told where it is written: after the scene it follows, before the font, and the smell of wax last.
  it("tells a place's lines in the order they are written, by their kind", async () => {
    const j = await Journey.start('test/fixtures/probes/place-lines/probe.campaign.json');
    await j.play('the nave');
    expect(j.taken.at(-1)!.page).toBe('Tablets line the nave. One tablet only says, HE CAME TOO LATE. Under the west window'
      + ' one tablet is newer and whiter than the rest. The font is dry. It smells of wax.');
  }, 30000);
});
