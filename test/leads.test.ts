import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';

// The map is faithful to what the company knows (Mission 15's brief, Priority III): a place it has been told of (a
// fact it knows that leads there, leadsTo) is on its map, as not yet visited, before it has been there or knows the
// way; and not before it is told. Old Wyn names the Grey Barrow, east in the heather; the track to it is hidden.
describe('a place heard of', () => {
  it('is on the company\'s map once it is told of, and not before', async () => {
    const j = await Journey.start('test/fixtures/probes/leads/probe.campaign.json', 'leads');
    const seen = () => {
      const screen = ScreenModel.build(j.campaign);
      return { chart: (screen.region?.areas ?? []).map(a => [a.name, a.visited]),
        map: screen.map.map(p => [p.name, p.visited]) };
    };
    expect(seen().chart).not.toContainEqual(['the Grey Barrow', false]);
    expect(seen().map).not.toContainEqual(['the Grey Barrow', false]);
    await j.play('Talk to Old Wyn', 'about the Grey Barrow');
    expect(seen().chart).toContainEqual(['the Grey Barrow', false]);
    expect(seen().map).toContainEqual(['the Grey Barrow', false]);
    // Told of it, the company still does not know the way there.
    expect(j.offers('old track')).toBe(false);
  }, 60000);
});
