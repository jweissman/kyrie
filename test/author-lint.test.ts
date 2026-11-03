import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';

// What the Grand Tour's author was not told (its friction X06, X15, X17): a tame one's Greets said on arrival, and, of
// a whole adventure (one with an ending), a first place with nothing said of it and no milestone.
describe('the author lint', () => {
  it('says a tame greeting is said on arrival, a measure lowered unasked, a bare first place, and nothing to grow by', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'al/site.kyr': `Module al "Bare" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard.
        Person tib "Tib" at yard { Species cat. Temperament tame. Greets "Tib winds round your legs.". }
        Relation over(place). Ending done "Done" when over(yard) "It is over.". Measure regard(group).
        Action sulk(actor: group, site: place) "Sulk" { Requires at(actor, site). On success { Decrease regard(tib) by 1. } } }`,
      'al/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'al.campaign.json': JSON.stringify({ version: 1, name: 'al', modules: [{ id: 'p', bundle: 'al/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const found = await KyrLint.campaign(source.resolve('al.campaign.json'), source);
    expect(found.filter(f => ['greeting', 'lowered', 'opening', 'growth'].includes(f.check)).map(f => [f.check, f.level]))
      .toEqual([['greeting', 'advice'], ['lowered', 'advice'], ['opening', 'warning'], ['growth', 'advice']]);
  }, 60000);
});
