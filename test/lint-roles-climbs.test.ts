import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

// The lint says of a role that names its person again that the page will say it once (the Banns at Hessel's friction
// 10), and of a stair that does not change level that it is no stair; a climb from one area to another is a ladder,
// whatever the levels are called (the Liberty of the Ice's friction 17). Not of one who says whose they are, nor of
// the engine-house; and of a pursuit for one who cannot go, and of a place asked to be at another (Quittance's 5, 6,
// 15, 16).
describe('the lint, of roles and climbs', () => {
  it('points out a role that names its person again, and a stair within a level, and lets a ladder between areas be', async () => {
    const found = await KyrLint.campaign('test/fixtures/probes/lint-roles-climbs/probe.campaign.json', new NodeBundleSource());
    expect(found.filter(f => ['role', 'passage', 'prose', 'pursuit', 'at', 'unbound', 'scenery', 'tried'].includes(f.check)).map(f => f.message).sort())
      .toEqual([
      'Action p__count_crates: nothing in its condition names site, so it is offered once for every place in the world; '
        + 'ask it (at(actor, site), …)',
      'p__engine_house is what p__quay\'s first sentence is about, and cannot be looked at: give it `Tries looking.`',
      'p__floor_creaks asks at(p__floor, …), which is never so: a place is not at anything; ask at(actor, p__floor)',
      'p__inner_stair is a stair but does not change level',
      'p__pried waits on tried(p__engine_house, prying), a try p__engine_house is never offered: give it `Tries prying.`',
      'p__wenlock: the role "Lady Wenlock of the quay" names Wenlock again; say who they are instead',
      'to_loft seeks somewhere for p__pim, who cannot go there: give them `Uses go.`']);
  }, 60000);
});
