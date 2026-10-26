import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList } from '../src/ui/choice-list';

// A way into a place that more than one way leads into is told by its own name, so that the page says which way it
// is: What Tessary Owes' two ways into the Strongrooms, through the black wall and up the drowned city's drain, were
// both "Into the Strongrooms" (W16; the Road's F6, Low Water's 18, The Patient Star's 30 and 36).
describe('a place with two ways in', () => {
  it('is entered by each way\'s own name, and a place with one by its name alone', async () => {
    const s = await PlaySession.start('test/fixtures/probes/two-ways-in/probe.campaign.json', 'two', NodeBundleSource.shared);
    const ways = () => ChoiceList.ways(ScreenModel.build(s.campaign).exits).choices.map(c => c.label).sort();
    expect(ways()).toEqual(['Into the hut', 'Into the tower by the door', 'To the garden']);
    await s.perform('go(p__walk,p__garden)');
    expect(ways()).toEqual(['Into the tower by the old well-shaft', 'To the yard']);
  }, 60000);
});
