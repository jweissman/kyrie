import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PendingPlacements } from '../src/campaign/pending-placements';
import { PlaySession } from '../src/session/play-session';
import { LazyProof } from './support/lazy-proof';

// A placement held back until the company nears it reaches, as it is first neared, the state the same world installed
// whole has there (PendingPlacements; lazy-provinces.md's proof, on its cheapest rung). Lowmouth and Farholm, ten hexes
// apart on one land: the drover's story on Lowmouth green (near where the company begins, so never held back) and the
// fever on Farholm green (held back). The same commands played in both worlds: at every step the company is where it
// was, offered the same rows, told the same words and the same itself; and on Farholm green, where the lazy world takes
// the fever up, it holds what the eager world's fever holds, its people and its facts. A game kept on the road, before
// the fever is taken up, takes it up on coming in as the game never kept does; and its transcript replays to the same
// digests. Taken up late, the fever is caught up: its rules run through the watches it was held back for
// (CampaignTick.caughtUp).
const root = 'test/fixtures/lazy-placements', seed = 'lazy', source = NodeBundleSource.shared;
// Two days and more on Lowmouth green first: the fever has taken the child on Farholm green at the second dawn (its
// lost_child, at the fortieth hour, an hour before first light) by the time the company comes in, in both worlds.
const waits = Array<string>(64).fill('wait_hour(party)');
const walk = [...waits, 'go(party,home__green_road,home__green,home__road)', 'wait_hour(party)',
  'go(party,home__road_far,home__road,home__far_green)', 'wait_hour(party)'];
class Lazily {
  static async start(lazy: boolean): Promise<PlaySession> {
    const s = await PlaySession.start(`${root}/world.campaign.json`, seed, source, lazy ? { lazy: true } : {});
    return this.extended(s);
  }
  static extended(s: PlaySession): PlaySession {
    return s.extend({ expand: c => PendingPlacements.nearing(c, source) });
  }
}
describe('a placement held back until it is neared', () => {
  it('is, when first neared, what the world installed whole holds there, and nothing else differs', async () => {
    const eager = await Lazily.start(false), lazy = await Lazily.start(true);
    expect([LazyProof.pending(eager.campaign), LazyProof.pending(lazy.campaign)]).toEqual([[], ['fever']]);
    expect(lazy.campaign.installed).not.toContain('fever');
    expect(LazyProof.seen(lazy)).toEqual(LazyProof.seen(eager));
    const held: string[][] = [];
    for (const command of walk) {
      const a = await eager.perform(command), b = await lazy.perform(command);
      expect([command, LazyProof.seen(lazy, b)]).toEqual([command, LazyProof.seen(eager, a)]);
      held.push(LazyProof.pending(lazy.campaign));
      if (!held.at(-1)!.length) { expect(LazyProof.owned(lazy.campaign, ['fever'])).toEqual(LazyProof.owned(eager.campaign, ['fever'])); }
    }
    // Held back until the company came in to Farholm green, and taken up there, the watch recorded.
    expect(held).toEqual([...waits.map(() => ['fever']), ['fever'], ['fever'], [], []]);
    expect(LazyProof.owned(lazy.campaign, ['fever']).entities.length).toBeGreaterThan(2);
    expect(LazyProof.owned(lazy.campaign, ['fever']).facts).toContain('fever__lost(fever__mother)');
    expect(PendingPlacements.neared(lazy.campaign)).toEqual([{ id: 'fever', at: lazy.campaign.history.at(-2)!.elapsed }]);
  }, 30000);
  it('is held back in a game kept, and taken up on coming in, as in the game never kept; its record replays', async () => {
    const lazy = await Lazily.start(true);
    for (const command of walk.slice(0, -2)) { await lazy.perform(command); }
    const kept = Lazily.extended(PlaySession.resume(lazy.checkpoint()));
    expect(LazyProof.pending(kept.campaign)).toEqual(['fever']);
    for (const command of walk.slice(-2)) { await lazy.perform(command); await kept.perform(command); }
    expect(LazyProof.owned(kept.campaign, ['fever'])).toEqual(LazyProof.owned(lazy.campaign, ['fever']));
    expect(kept.transcript.steps.map(s => s.digest)).toEqual(lazy.transcript.steps.map(s => s.digest));
    const again = await Lazily.start(true);
    await again.replay(lazy.transcript.steps);
    expect(again.transcript.steps.map(s => s.digest)).toEqual(lazy.transcript.steps.map(s => s.digest));
  }, 30000);
});
