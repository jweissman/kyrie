import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

// The lint says of a role that names its person again that the page will say it once (the Banns at Hessel's friction
// 10), and of a stair that does not change level that it is no stair; a climb from one area to another is a ladder,
// whatever the levels are called (the Liberty of the Ice's friction 17).
describe('the lint, of roles and climbs', () => {
  it('points out a role that names its person again, and a stair within a level, and lets a ladder between areas be', async () => {
    const found = await KyrLint.campaign('test/fixtures/probes/lint-roles-climbs/probe.campaign.json', new NodeBundleSource());
    expect(found.filter(f => ['role', 'passage'].includes(f.check)).map(f => f.message).sort()).toEqual([
      'p__inner_stair is a stair but does not change level',
      'p__wenlock: the role "Lady Wenlock of the quay" names Wenlock again; say who they are instead']);
  }, 60000);
});
