import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

// Low Water's 17 and 21 (AUT-11): a way down that goes one way only, with a way back of its own, was reported as a
// duplicate of it; and of seventeen endings ordered by hand, nothing said that a later one asked all an earlier one
// asked and could never be reached. Here a drop and a cut stair join a ledge and still water, and the Ballad asks what
// the Drowning asks, and more.
describe('the lint', () => {
  it('takes a one-way way and its own way back as two ways, and says which endings are never reached', async () => {
    const found = await KyrLint.campaign('test/fixtures/probes/endings-ways/probe.campaign.json', new NodeBundleSource());
    expect(found.filter(f => f.check === 'passage').map(f => f.message)).toEqual([]);
    expect(found.filter(f => f.check === 'ending').map(f => f.message))
      .toEqual(['p__ballad is never reached: p__drowning comes first, and holds whenever it does']);
  }, 60000);
  // Thrume's F7 (AUT-23): a rule that drops the company into the oubliette was not a way in, and the lint said the
  // oubliette could not be reached; a one-way drop was written for the lint alone.
  it('counts a room the company is put in by a rule as reached', async () => {
    const found = await KyrLint.campaign('test/fixtures/probes/rule-move/probe.campaign.json', new NodeBundleSource());
    expect(found.filter(f => f.check === 'geography').map(f => f.message)).toEqual([]);
  }, 60000);
});
