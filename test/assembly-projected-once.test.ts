import { describe, expect, it, spyOn } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { CreatureFacts } from '../src/campaign/creature-facts';
import type { Campaign } from '../src/campaign/campaign';
import { PlaySession } from '../src/session/play-session';

// A campaign assembled from many modules projects its people's facts once, when the last is in, through its own
// projection (Campaign.install): it had projected each module's newcomers as they came in, then everyone twice over
// (0.5 s of a new life's start). The facts it begins with are what projecting everyone afresh would give: projected
// again from nothing kept, nothing changes. A fixture of three modules, two of them kits (a drawn world of forty was
// compared by hand on 25 November: five starts' facts, sorted, the same as before, and the golden walk's first twenty
// answers).
const fresh = (c: Campaign) => {
  const { definition, creatures } = c.tickState;
  return CreatureFacts.saved(c.world, definition.actors, creatures);
};
describe('a campaign assembled from many modules', () => {
  it('begins with its people\'s facts as projecting them afresh gives them', async () => {
    const projected = spyOn(CreatureFacts, 'project');
    const fells = await PlaySession.start('test/fixtures/fells/campaign.json', 'projected-once',
      NodeBundleSource.shared);
    // Once as the first module is taken in, and once as the last is: not once for each.
    expect(fells.campaign.installed.length).toBeGreaterThan(2);
    expect(projected.mock.calls.length).toBeLessThanOrEqual(2);
    projected.mockRestore();
    expect(fresh(fells.campaign)).toBe('same');
  }, 30000);
});
