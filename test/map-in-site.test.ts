import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ScreenModel } from '../src/ui/screen-model';
import { MapView } from '../web/reader/map-view';
import { PlayerView } from '../src/presentation/player-view';
import { GeneratedWorld } from './support/generated';

// Inside a site in wild country the company is on the map at the site's hex, and the site is where it is. Underground
// in Lapisrecs's long gallery the map had put the company nowhere and offered "Journey to Lapisrecs, 22 minutes", which
// a cold player took to mean the way out (round 8, N).
describe('the map from inside a site', () => {
  it('puts the company at the site\'s hex, and sets out for nowhere it already is', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'order', party: [{ name: 'R', raceId: 'human', classId: 'warrior' }] },
      NodeBundleSource.shared);
    // The brothers' letter read: the priestess tells the way to the barrow.
    await s.leg(PlayerView.choices(s.campaign).find(c => /the brothers' letter/.test(c.choice.name))!.choice.id);
    GeneratedWorld.put(s, 'w9');
    const outside = ScreenModel.build(s.campaign).region!.land!.here;
    expect(outside).toBeDefined();
    await GeneratedWorld.travel(s, 'w9_halls_gallery');
    const screen = ScreenModel.build(s.campaign);
    expect(screen.region!.land!.here).toBe(outside);
    const site = MapView.way(screen, 'region__w9_site'), hex = MapView.way(screen, `hex:${outside}`);
    expect(site.here).toBe(true);
    expect(site.go).toBeUndefined();
    expect(hex.here).toBe(true);
    // Its own hex is left for, if at all: the way out, not a journey to where the company is.
    expect(hex.go === undefined || /^Leave /.test(hex.go.label)).toBe(true);
  }, 120000);
});
