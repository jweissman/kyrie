import { describe, expect, it } from 'bun:test';
import { Glanced } from './support/glanced';
import { TalkLines } from '../src/frame/talk-lines';
import { Tiny } from './support/tiny';

// A discovery an author marks as deserving the page to itself (`as revelation`) is told as one, set apart from the run
// of what happened (NAR-14: a body found, a betrayal, a revelation had been told in the ordinary register). The probe's
// mirror shows who drowned the miller, a revelation; its drawer's unpaid bills, ordinary, are not.
describe('a revelation', () => {
  it('is told apart from the run of what happened, and an ordinary discovery is not', async () => {
    const kyr = await Bun.file('test/fixtures/probes/revelation/site.kyr').text();
    const g = Glanced.of((await Tiny.start(kyr, { seed: 'r', horizon: ['probing'] })).session);
    await g.choose(/mirror_wiped/);
    const lines = g.leaf.exchange!.lines;
    expect(lines.filter(l => l.kind === 'revelation').map(l => l.text)).toEqual([expect.stringMatching(
      /^In the clean glass the parlour is as it was on the night of the flood/)]);
    // What the act did besides is told as before.
    expect(lines.find(l => /mirror.s glass is clean/.test(l.text))?.kind).toBe('change');
    // And the conversation keeps it as one, as the page draws it (a line of its own kind).
    const frame = { ...g.frame(), leaf: g.leaf }, wipe = { id: 'x', label: 'Wipe the glass of the mirror' };
    expect(TalkLines.lines(frame, wipe as never, 'Wipe the glass of the mirror').map(l => l.kind))
      .toContain('revelation');
    await g.choose(/drawer_open/);
    expect(g.leaf.exchange!.lines.map(l => l.kind)).not.toContain('revelation');
  }, 60000);
});
