import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Glanced } from './support/glanced';
import { Conversation } from '../web/reader/conversation';

// A discovery an author marks as deserving the page to itself (`as revelation`) is told as one, set apart from the run
// of what happened (NAR-14: a body found, a betrayal, a revelation had been told in the ordinary register). The probe's
// mirror shows who drowned the miller, a revelation; its drawer's unpaid bills, ordinary, are not.
describe('a revelation', () => {
  it('is told apart from the run of what happened, and an ordinary discovery is not', async () => {
    const g = Glanced.of(await PlaySession.start('test/fixtures/probes/revelation/probe.campaign.json', 'r',
      NodeBundleSource.shared));
    await g.choose(/mirror_wiped/);
    const lines = g.leaf.exchange!.lines;
    expect(lines.filter(l => l.kind === 'revelation').map(l => l.text)).toEqual([expect.stringMatching(
      /^In the clean glass the parlour is as it was on the night of the flood/)]);
    // What the act did besides is told as before.
    expect(lines.find(l => /mirror.s glass is clean/.test(l.text))?.kind).toBe('change');
    // And the conversation keeps it as one, as the page draws it (a line of its own kind).
    const frame = { ...g.frame(), leaf: g.leaf }, wipe = { id: 'x', label: 'Wipe the glass of the mirror' };
    expect(Conversation.lines(frame, wipe as never, 'Wipe the glass of the mirror').map(l => l.kind))
      .toContain('revelation');
    await g.choose(/drawer_open/);
    expect(g.leaf.exchange!.lines.map(l => l.kind)).not.toContain('revelation');
  }, 60000);
});
