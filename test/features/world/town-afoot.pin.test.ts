import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner } from '../../../src/cli/runner';

// Something going on in every generated town that moves on by the days, whether or not the company acts (the owner's
// first-hour beat sheet, checkpoint 10; data/generation/town/afoot.kyrt; doc/design/situations-census.md). Iscoed's
// Wrackham has two neighbours at odds over a garden wall: seen on three returns days apart, shouting, then silent and
// building the wall higher, and at the last, because the company carried a word over it, sharing a jug on it.
// Porthalen's barn, left alone, goes up all the same.
const text = (r: Runner) => r.said('look').scene.lines.join(' ').replace(/[‘’]/g, "'");
describe('a town\'s own goings-on, moved on by the days', () => {
  it('is seen at three stages on three returns to Wrackham, and remembers the word carried over the wall', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session);
    await journey.play('>s2_green');
    expect(text(r)).toContain('Two neighbours are shouting at each other across a garden wall');
    await journey.play('>s1_green', '==day 3 07:00', '>s2_green');
    const second = text(r);
    expect(second).toContain('each is laying stones on his own side of the garden wall');
    expect(second).not.toContain('are shouting at each other');
    journey.roll('pass');
    await journey.play('Carry a word over the garden wall');
    expect(journey.latest).toContain('the pears were never worth it');
    journey.roll();
    await journey.play('>s1_green', '==day 5 09:00');
    // Porthalen's barn, where the company did nothing, is thatched all the same.
    expect(text(r)).toContain('The new barn has its thatch on now');
    await journey.play('>s2_green');
    expect(text(r)).toContain('sit on their garden wall sharing a jug');
  }, 300000);
});
