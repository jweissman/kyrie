import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PendingPlacements } from '../src/campaign/pending-placements';
import { Creation } from '../web/engine/creation';
import { DrawnWorld } from '../src/world/drawn-world';
import type { PlaySession } from '../src/session/play-session';
import { LazyProof } from './support/lazy-proof';

// s0 begun eagerly and lazily (PendingPlacements, lazy-provinces.md's proof on a world): the lazy life installs none of
// the first country's placements its scenarios let wait (the players, the tower, the disputation, the fellowship, all
// five hexes or more from the first inn), each of them fit to wait (PendingPlacements.unfit: no one of theirs acting
// on goals, no pressure, nothing said wherever the company is); a day and more in the first town is the same to the
// company in both lives, step by step; and each held back, taken up then, holds what the world installed whole holds,
// caught up through the watches it waited (CampaignTick.caughtUp). Two s0 starts and their walk: CI's, not the push
// lane's.
const seed = 's0', source = NodeBundleSource.shared, hours = 30;
class LazyS0 {
  static start(lazy: boolean): Promise<PlaySession> {
    const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior', rolled: Creation.rolled(seed, 'warrior') }];
    return DrawnWorld.start(seed, { party, origin: 'wanderer', ...lazy ? { lazy: true } : {} }, source);
  }
}
describe('s0, its far placements held back', () => {
  it('installs none of them, is the same to the company meanwhile, and each is, taken up, what it would have been', async () => {
    const eager = await LazyS0.start(false), lazy = await LazyS0.start(true);
    const held = PendingPlacements.held(lazy.campaign).map(p => p.id);
    expect(held).toEqual(['players', 'unquiettower', 'disputation', 'fellowship']);
    expect(lazy.campaign.installed.filter(id => LazyProof.pending(lazy.campaign).includes(id))).toEqual([]);
    for (const p of PendingPlacements.held(lazy.campaign)) {
      expect([p.id, PendingPlacements.unfit(eager.campaign, p.requests.map(r => r.id))]).toEqual([p.id, []]);
    }
    expect(LazyProof.seen(lazy)).toEqual(LazyProof.seen(eager));
    for (let h = 0; h < hours; h++) {
      const a = await eager.perform('wait_hour(party)'), b = await lazy.perform('wait_hour(party)');
      expect([h, LazyProof.seen(lazy, b)]).toEqual([h, LazyProof.seen(eager, a)]);
    }
    for (const p of [...PendingPlacements.held(lazy.campaign)]) {
      const ids = p.requests.map(r => r.id);
      await PendingPlacements.needed(lazy.campaign, ids, source);
      expect([p.id, LazyProof.owned(lazy.campaign, ids)]).toEqual([p.id, LazyProof.owned(eager.campaign, ids)]);
    }
    expect(PendingPlacements.held(lazy.campaign)).toEqual([]);
  }, 180000);
});
