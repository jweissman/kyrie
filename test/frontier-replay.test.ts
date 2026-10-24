import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Frontier } from '../src/world/frontier';

// The same commands give the same world, past the march too. Found by an architecture review: the country beyond a
// march-stone was drawn by the browser after each command, outside the record of it, so the same transcript replayed
// drew none of it (16 modules where the game had 25). It is drawn as part of the command now (PlaySession.extend).
class March {
  static async start(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return (await PlaySession.start(w.path, seed, w.source)).extend(new Frontier(seed, NodeBundleSource.shared));
  }
  // The ways from here to the nearest march-stone, taken one at a time by the choices offered.
  static async walk(s: PlaySession) {
    for (let step = 0; step < 30 && !/__edge_/.test(s.campaign.world.one('at', 'party') ?? ''); step++) {
      const way = this.next(s);
      const go = PlayerView.choices(s.campaign).find(c => c.choice.id === `go(${way[0]},${way[1]})`);
      if (!go) { throw new Error(`No way on to ${way[1]}`); }
      await s.perform(go.choice.id);
    }
  }
  private static next(s: PlaySession): [string, string] {
    const world = s.campaign.world, start = world.one('at', 'party')!, links = world.related('connects');
    const from = new Map<string, [string, string] | undefined>([[start, undefined]]);
    for (const queue = [start]; queue.length;) {
      const here = queue.shift()!;
      if (here !== start && /__edge_/.test(here)) {
        let at = here;
        while (from.get(at)![1] !== start) { at = from.get(at)![1]; }
        return [from.get(at)![0], at];
      }
      for (const [way, , b] of links.map(r => r.args as [string, string, string]).filter(([, a]) => a === here)) {
        if (!from.has(b)) { from.set(b, [way, here]); queue.push(b); }
      }
    }
    throw new Error('No march-stone in reach');
  }
}

describe('the country beyond the march', () => {
  it('is drawn again when the same commands are replayed', async () => {
    const played = await March.start('thorn');
    const before = played.campaign.installed.length;
    await March.walk(played);
    // One more command, at the march-stone, draws the country beyond it.
    await played.perform('wait');
    expect(played.campaign.installed.length).toBeGreaterThan(before);
    const replayed = await March.start('thorn');
    await replayed.replay(played.transcript.steps);
    expect(replayed.campaign.installed).toEqual(played.campaign.installed);
    expect(replayed.canonical()).toBe(played.canonical());
  }, 300000);
});
