import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList } from '../src/ui/choice-list';

// What a way says of where it goes, in the place's own words. A place whose name says where it is had been gone to
// "To among the trees of …" (the navigation review's march-stone, NVR-05); and a way into an enclosure named for it
// had named it twice, "Into the Duelling Stair by the first flight of the Stair" (the Book of Faces' BOF-36).
describe('the words of a way', () => {
  it('go to a place named for where it is without a "to", and into an enclosure without naming it twice', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'wl/site.kyr': `Module wl "Ways" { Place hill "the Hill" is settlement.
        Place foot "the foot of the Duelling Stair" is room within hill at 0, 3 outdoors.
        Place reeds "among the reeds" is room within hill at 1, 3 outdoors.
        Place yard "the Seconds' yard" is room within hill at 2, 3 outdoors.
        Place duelling_stair "the Duelling Stair" is site within hill.
        Place landing "the landing of the Open Hand" is room within duelling_stair at 0, 2 outdoors.
        Place top "the head of the Duelling Stair" is room within duelling_stair at 0, 0 outdoors.
        Passage f1 "the first flight of the Stair" is steps between foot and landing.
        Passage back "the private stair" is steps between yard and top.
        Passage rushes "the path through the rushes" is path between foot and reeds.
        Passage lane "the lane" is path between foot and yard.
        Place undercroft "under the Hill" is building within hill. Place vault "the vault" is room within undercroft at 0, 0.
        Passage hatch "the hatch" is ladder between foot and vault.
        Company party "You" of 1 at foot. }`,
      'wl/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'wl.campaign.json': JSON.stringify({ version: 1, name: 'wl', modules: [{ id: 'p', bundle: 'wl/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const s = await PlaySession.start(source.resolve('wl.campaign.json'), 'wl', source);
    expect(ChoiceList.ways(ScreenModel.build(s.campaign).exits).choices.map(c => c.label).sort())
      .toEqual(['Among the reeds', 'Into the Duelling Stair by the first flight', "To the Seconds' yard", 'Under the Hill']);
  }, 60000);
});
