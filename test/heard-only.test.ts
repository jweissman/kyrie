import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

// An effect everywhere and its words only where heard (QTC-A18, BOF-07; the Grand Tour's 22): a surveyor's verdict at
// the landing is given whether or not anyone is on the landing, and told only to a company there. Each such beat had
// been two rules and a latch (an unanchored change, an anchored telling), since the lint advised on the one rule that
// did both. Written `heard at`, only its words are anchored: the lint leaves it alone, and one heard within an area
// does not wait for the company to come into it.
const probe = 'test/fixtures/probes/heard-only/probe.campaign.json';

describe('a rule heard only at a place', () => {
  it('is done though the company is elsewhere, and not told to it', async () => {
    const j = await Journey.start(probe);
    const told = await j.play('=3');
    expect([j.holds('condemned', 'party'), j.holds('risen', 'party')]).toEqual([true, true]);
    expect(told).not.toContain('Condemned');
    expect(told).not.toContain('sexton');
  }, 30000);

  it('is told to a company there', async () => {
    const j = await Journey.start(probe);
    j.put('party', 'landing');
    const told = await j.play('=3');
    expect(told).toContain("'Condemned,' says the surveyor.");
    expect(told).toContain('The sexton has gone back up the tower.');
  }, 30000);

  it('draws no advice from the lint', async () => {
    const found = await KyrLint.campaign(probe, new NodeBundleSource());
    expect(found.filter(f => f.check === 'anchor')).toEqual([]);
  }, 60000);
});
