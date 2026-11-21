import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { MapRows } from '../src/presentation/map-rows';
import { ScreenModel } from '../src/ui/screen-model';

// A journey from indoors begins by going out of doors (OR-151, the lead's page walk of 20 November: at Porthalen's
// customs-house the map drew the whole country and set out for none of it; at the green it did). A house of a town,
// on the ground, is left by its door: a journey from it is one act, the door its first leg and its minutes in the
// whole, set out on from the map as from the green. (What is deep in a site or under the ground still walks out first:
// CN-02.)
describe('a journey from a house of the town', () => {
  it('goes out of doors first, as one act, from Porthalen\'s customs-house to Reedbridge', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const s = journey.session;
    await s.leg('travel:drove__customs');
    expect(s.campaign.world.one('at', 'party')).toBe('drove__customs');
    const screen = ScreenModel.build(s.campaign), runner = new Runner(s);
    runner.said();
    const road = screen.roads?.find(d => d.id === 'region__s5');
    expect([road?.legs[0]?.way, road?.stops?.[0]]).toEqual(['the customs-house door', 'region__s1_green']);
    expect(MapRows.of(runner.leaf!.glance!, screen).map(r => r.place)).toContain('region__s5');
    await s.leg('travel:region__s5');
    expect(s.campaign.world.one('at', 'party')).toBe('region__s5_green');
  }, 120000);
});
