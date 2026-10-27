import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

// A rule anchored at a place is heard there, but happens wherever the company is, whenever its condition holds: two
// authors met it apart (a purse lifted at Pellam's fair from a company a mile off on the road; a chair at Hessel run
// and crashed while the company crossed the river: ICE-01, HSL-01). The lint says so of one that changes something of
// the company's own and asks nothing of where it is; one that asks, and one said within an area (which waits for the
// company to be there), it leaves alone.
describe('a rule heard at a place', () => {
  it('is said by the lint to happen wherever the company is, when it does something to the company', async () => {
    const found = await KyrLint.campaign('test/fixtures/probes/heard-there/probe.campaign.json', new NodeBundleSource());
    expect(found.filter(f => f.check === 'anchor').map(f => f.message)).toEqual([
      'p__lifted is heard at p__market, but what it does to the company happens wherever the company is: put at(party,'
      + ' p__market) in its condition, or anchor it within an area']);
  }, 60000);
});
