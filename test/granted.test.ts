import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Liberty of the Ice's 23 (ICE-22): what a creature fears had to be a capability, which only an item's condition
// gave, so a brand lit at the ox fire could not be what the wolves feared. A company may be granted a capability for a
// while by what it does: it has it, as it would by a lit torch, until the watch it was granted until.
describe('a capability granted for a while', () => {
  it('is had until its time is up, and what fears it gives way', async () => {
    const j = await Journey.start('test/fixtures/probes/brand/probe.campaign.json');
    expect(j.holds('capable', 'party', 'flame')).toBe(false);
    await j.play('Hold the brand');
    expect(j.holds('capable', 'party', 'flame')).toBe(true);
    expect(j.page).toMatch(/go away down the sledge road at a long easy lope/);
    expect(j.at('p__wolves')).toBe('p__downs');
    await j.play('=+13');
    expect(j.holds('capable', 'party', 'flame')).toBe(false);
  }, 30000);
});
