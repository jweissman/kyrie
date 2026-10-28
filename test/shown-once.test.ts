import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// A line that teaches what its own condition says the company does not know yet (a word chalked on a gate, read on
// coming into the yard) is told with the place that once: it had been gone before the page was drawn, so that what
// it taught arrived unsaid (the Banns at Hessel's friction 4, the register's HSL-04; its author latched it by hand).
describe('a line seen once', () => {
  it('is told on coming to it, though seeing it taught what it says', async () => {
    const j = await Journey.start('test/fixtures/probes/shown-once/probe.campaign.json', 'k');
    await j.play('^To the yard');
    expect(j.taken.at(-1)!.page).toContain('A word is chalked on the yard gate');
    expect(j.holds('knows', 'party', 'p__word')).toBe(true);
    await j.play('^To the lane');
    await j.play('^To the yard');
    expect(j.taken.at(-1)!.page).not.toContain('A word is chalked');
  }, 60000);
});
