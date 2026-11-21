import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';

// A telling rule with no anchor is heard wherever the company is (AU-36, The Warm Wall's friction: the form passed its
// tests silently, and was found only by reading the page): each of a module's own said, as advice, and verify counts
// them beside lint's; one anchored (at a place) is not, nor a closing line, nor the shared rules' own news.
describe('a telling rule heard everywhere', () => {
  it('is said, by name, where it has no anchor, and not where it is at a place', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'ev/site.kyr': `Module ev "Everywhere" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard.
        Relation rung(place). Relation heardOnce(place). Relation saidOnce(place).
        Action ring(actor: group, site: place) "Ring" { Requires at(actor, site). On success { Assert rung(yard). } }
        Rule toll when rung(yard) and not heardOnce(yard) says "The bell tolls over the fields." { Assert heardOnce(yard). }
        Rule echo at yard when rung(yard) and not saidOnce(yard) says "It echoes in the yard." { Assert saidOnce(yard). }
        Goal false. }`,
      'ev/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'ev.campaign.json': JSON.stringify({ version: 1, name: 'ev', modules: [{ id: 'p', bundle: 'ev/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const found = await KyrLint.campaign(source.resolve('ev.campaign.json'), source);
    expect(found.filter(f => f.check === 'everywhere').map(f => [f.level, f.message.split(' ')[0]]))
      .toEqual([['advice', 'p__toll']]);
  }, 60000);
});
