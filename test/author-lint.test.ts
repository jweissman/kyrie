import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { CampaignLint } from '../src/cli/campaign-lint';

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
  // A line near a thing that stands on a way is never told (the Book of Faces' cisterns 5, BOF-26).
  it('says a line near a thing on a way is never told', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'nw/site.kyr': `Module nw "Near a way" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Place lane "the lane" is room within field at 1, 0.
        Passage gate "the gate" is gate between yard and lane. Company party "You" of 1 at yard.
        Thing bar "the bar" on gate { State down blocking "A bar is down across the gate.". State up "The bar is up.".
          Change lift "Lift the bar" from down to up. }
        Observe bar_rust near bar when true "Rust has run down the gate from the bar.". }`,
      'nw/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'nw.campaign.json': JSON.stringify({ version: 1, name: 'nw', modules: [{ id: 'p', bundle: 'nw/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const found = await KyrLint.campaign(source.resolve('nw.campaign.json'), source);
    expect(found.filter(f => f.check === 'near-way').map(f => f.level)).toEqual(['advice']);
  }, 60000);
});

// The Book of Faces' BOF-20: the prose lint had taken a flagstone's "flag" and a siege engine for the implementation's
// words. Only what the implementation alone says is taken.
describe('the prose lint\'s implementation words', () => {
  it('passes a flag of stone and the engine of a siege, and takes a state flag and the game engine', () => {
    const words = CampaignLint.implementationWords;
    expect(['A worn flag of the floor lifts.', 'The engine throws its stone.'].map(t => words.test(t))).toEqual([false, false]);
    expect(['It sets a state flag.', 'The game engine moves them.'].map(t => words.test(t))).toEqual([true, true]);
  });
});
