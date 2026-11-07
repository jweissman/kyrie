import { describe, expect, it } from 'bun:test';
import { Reach } from './support/skeel';

// Fair Weather's keeper (doc/imbar): the bench in the hermit's cell is the Light's tally, three notations deep, and
// "neither man nor dog nor cat" is the keeper's column. Played by the labels a player sees.
describe('Fair Weather, the keeper\'s bench', () => {
  it('has the Parson read the tally that the Parson took for a hermit\'s, and the Court decline to relieve a keeper it did not appoint', async () => {
    const g = await Reach.start('data/campaigns/skeel.campaign.json', 's1');
    await g.fixture('keeper', 'cell');
    expect(g.knows('tally_seen')).toBe(true);
    await g.fixture('keeper', 'parson');
    expect(g.knows('tally_read')).toBe(true);
    expect(g.page).toMatch(/A hermit does not count ships/);
    await g.fixture('keeper', 'court');
    expect(g.holds('tallyRead', 'reach')).toBe(true);
    expect(g.holds('lovedayKept', 'reach')).toBe(true);
    expect(g.holds('lovedayOff', 'reach')).toBe(false);
    expect(g.page).toMatch(/does not relieve what it did not appoint/);
  }, 600000);
});
