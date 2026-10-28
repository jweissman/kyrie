import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

// A role is what someone is wherever they are: A Winter in Carth's clerk "at a high desk, doing sums" stood barefoot
// in the Minster porch (its friction 13). The lint advises one who is moved to say where the role is true; one who
// says so already is left alone.
describe('a role on someone who moves', () => {
  it('is advice to say where it is true', async () => {
    const found = await KyrLint.campaign('test/fixtures/probes/roles/probe.campaign.json', new NodeBundleSource());
    expect(found.filter(f => f.check === 'role').map(f => [f.level, f.message])).toEqual([['advice',
      'p__dinsdale is "a clerk at a high desk, doing sums" wherever they are, and p__to_the_porch moves them: say where it'
      + ' is true (Role "…" when at(p__dinsdale, …))']]);
  }, 60000);
});
