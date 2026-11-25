import { describe, expect, it } from 'bun:test';
import { FirstQuarter } from '../scripts/first-quarter';

// The old press key's chain (OR-172), on the first quarter hour's walk (iscoed, the kin life, a mage, who has the lore
// the road-grant wants): the press-door to the Hall's muniment room is locked, and the need had named only a
// crowbar's seller. Orla Pennick, the cook, knows where the key hangs, once she is told her cellar's rats are seen to:
// the lead goes to the rats, then to her, then to the key, then back to the press-door, and the grant is read there
// (Shut.found, Waits, AimMeans.unshut). And the walker never waits about with the way on offered (no idling).
// The rats are beyond the mage and the hand together, so the page leads first to someone to take along (OR-417, the
// owner's call on OR-411: help to be had leads): Carlin is hired in the taproom, and the chain goes on; four steps
// more than it took before, when the gold had led the two of them straight down to the rats.
describe('the old press key, by the gold', () => {
  it('is fetched by its chain, the rats, the cook, the key, and opens the press-door to the grant', async () => {
    const q = await FirstQuarter.walk('iscoed', 'kin', 'mage', 56);
    const done = q.steps.map(x => x.command), at = (c: string) => done.indexOf(c);
    const chain = ['attack(region__s1_manor_rats)', 'region__s1_manor_cook_ratsdone', 'region__s1_manor_cook_key',
      'take_item(region__s1_manor_key,region__member_party_1)', 'change_thing(region__s1_manor_press_key)',
      'change_thing(region__s1_manor_deed_read)'].map(at);
    expect(chain.every(i => i >= 0)).toBe(true);
    expect([...chain].sort((a, b) => a - b)).toEqual(chain);
    expect(done.filter(c => /^(wait|put_item)/.test(c))).toEqual([]);
  }, 600000);
});
