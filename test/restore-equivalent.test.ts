import { describe, expect, it } from 'bun:test';
import { PlaySession, type SessionCheckpoint } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { DrawnWorld } from '../src/world/drawn-world';
import { Frontier } from '../src/world/frontier';

// A game opened from its save is the game played on, in every order a rule or a receipt can read (the architecture
// review's A11, from its probe persist-world-diverge): a relation or measure the world had emptied kept its place,
// where the world opened from the save put it last, and from the next command the two told their changes in another
// order.
class Lockstep {
  // The probe's walk: out to a march-stone first, then about.
  static pick(s: PlaySession, i: number): string {
    const choices = PlayerView.choices(s.campaign).map(c => c.choice.id).filter(id => !/^(rest|camp)/.test(id));
    const edge = choices.find(id => /__edge_/.test(id) && id.startsWith('go('));
    if (edge && i < 20) { return edge; }
    const go = choices.filter(id => id.startsWith('go('));
    return (i % 3 === 0 && go.length ? go[(i * 5) % go.length] : choices[(i * 7) % choices.length])!;
  }
}
describe('a game opened from its save', () => {
  it('is the game played on, step for step', async () => {
    const drawn = { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] as never, origin: 'wanderer' };
    const live = await DrawnWorld.start('thorn', drawn, NodeBundleSource.shared);
    for (let i = 0; i < 10; i++) { await live.perform(Lockstep.pick(live, i), PlaySession.auto); }
    const opened = PlaySession.resume(JSON.parse(JSON.stringify(live.checkpoint())) as SessionCheckpoint,
      { trusted: false }).extend(new Frontier('thorn', NodeBundleSource.shared));
    for (let i = 10; i < 16; i++) {
      const c = Lockstep.pick(live, i);
      await live.perform(c, PlaySession.auto); await opened.perform(c, PlaySession.auto);
      expect(opened.canonical()).toBe(live.canonical());
    }
  }, 240000);
});
