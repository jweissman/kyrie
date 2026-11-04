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
      + ' p__market) in its condition, anchor it within an area, or write it heard at p__market if that is meant']);
  }, 60000);
  // The Book of Faces' cisterns 10 (BOF-27): the falcon's stoop, once, taught nothing to a company down at the pool.
  it('is said to lose what it teaches when it is once, and the company may be away', async () => {
    const found = await KyrLint.campaign('test/fixtures/probes/latched/probe.campaign.json', new NodeBundleSource());
    expect(found.filter(f => f.check === 'latched').map(f => f.message)).toEqual([
      'p__stoop teaches p__hawk_known heard at p__roof, once, wherever the company is: away, what it teaches is lost;'
      + ' latch it on not knows(party, p__hawk_known) instead, or ask at(party, p__roof)']);
  }, 60000);
});
