import { describe, expect, it } from 'bun:test';
import { Pellam } from './support/pellam';
import { ScreenModel } from '../src/ui/screen-model';
import { AuthoredLand } from '../src/world/authored-land';

// An authored region drawn as land (the owner's review of Mission 18: Pellam's map was five icons joined by dashed
// lines, and no river under a fair held on one). Its author set its places on a grid and said which are river; the
// Lisk runs under the bridge, the Fair and the Reach, a band of water across the land, with the city on its north bank
// and Bankside on its south; and the map at the Glove Post knows the Fair's stretch of the ice and the roads walked.
describe('an authored region, as land', () => {
  it('draws Pellam with the Lisk under the Fair, the city above it, and the roads walked', async () => {
    const g = await Pellam.start();
    const chart = AuthoredLand.of(g.j.campaign.world.module, 'pellam__lisk');
    expect(chart).toBeDefined();
    const W = chart!.width, row = (id: string) => Math.floor(chart!.places[id]! / W);
    const water = (id: string) => chart!.cover[chart!.places[id]!];
    expect([water('pellam__the_ice'), water('pellam__reach'), water('pellam__pellam_city')]).toEqual(['o', 'o', '.']);
    expect(row('pellam__pellam_city') < row('pellam__the_ice') && row('pellam__the_ice') < row('pellam__bankside')).toBe(true);
    await g.play('go:swan_lane', 'Shake on a penny a stair', 'go:freezeland');
    const land = ScreenModel.build(g.j.campaign).region!.land!;
    expect(land.blocks?.pellam__the_ice?.length).toBeGreaterThan(0);
    expect(land.known).toEqual(expect.arrayContaining(land.blocks!.pellam__the_ice!));
    expect(Object.keys(land.roads)).toEqual(expect.arrayContaining(['pellam__north_way']));
  }, 120000);
});
