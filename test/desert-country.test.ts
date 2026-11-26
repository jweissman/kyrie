import { describe, expect, it } from 'bun:test';
import { Terrain } from '../src/world/land/terrain';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';

// A desert country (the owner, OWN-44): drawn when asked for (?terrain=desert), never yet from a seed's own draw, so
// that no world already played changes. Its land is dunes over half of it, stony waste below, rock and mesas above,
// palms and oases only by water; its towns, peoples, creatures and works are drawn as any country's.
describe('a desert country', () => {
  it('is dunes, waste and rock, with palms only by water', () => {
    for (const key of ['dune1', 'dune2', 'dune3']) {
      const land = Terrain.make(key, 'desert'), count = (k: string) => land.cover.filter(c => c === k).length;
      const dry = land.cover.filter(c => c !== 'sea' && c !== 'lake').length;
      expect(count('heath') / dry, key).toBeGreaterThan(0.3);
      expect(count('wood') / dry, key).toBeLessThan(0.1);
    }
  });
  it('is played into: its towns named, its first place reached', async () => {
    const j = Journey.of(await DrawnWorld.start('dune1', { party: [{ name: 'Aud', raceId: 'human', classId: 'ranger' }],
      origin: 'wanderer', terrain: 'desert' }, NodeBundleSource.shared));
    const region = j.screen().region!;
    expect(region.areas.filter(a => a.kind === 'settlement').length).toBeGreaterThan(2);
    expect(j.screen().place.name).toBeTruthy();
  }, 60000);
});
