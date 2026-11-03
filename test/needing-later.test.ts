import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// What one file of a module uses may be declared in a file loaded after it: a skill a way needs (the Grand Tour's
// friction 16: its author moved `Entity breath` into the first file to make it load), and a kind of thing an Item is
// of and someone sells (Half the Hive's 8, Quittance's A29: kinds had to come in a file before the one that used
// them), and a relation a rule asserts.
describe('a module whose files use what a later file declares', () => {
  it('loads: the way held back from a company without the skill, the thing of its kind, and sold', async () => {
    const j = await Journey.start('test/fixtures/probes/needing-later/probe.campaign.json');
    expect(j.holds('needs', 'down', 'breath')).toBe(true);
    expect(j.takes('the drowned stair')).toBe(false);
    expect(j.campaign.world.one('itemKind', 'p__basket')).toBe('creel');
    await j.play('Talk to Ferrel');
    expect(j.offers('creel')).toBe(true);
    // And a rule of the first file asserting a relation the last declares.
    expect(j.holds('netted', 'party')).toBe(true);
  }, 60000);
});
