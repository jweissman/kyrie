import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ModuleWriter } from '../src/lang/module-writer';
import { CreatureFacts } from '../src/campaign/creature-facts';
import { CreatureStore } from '../src/creature-store';
import { World } from '../src/lang/world';
import type { Change } from '../src/lang/module';

// What a place says is what is so. Found by an independent review of the deployed game, in a tin-miners' galleries
// (data/generation/works/galleries.kyrt): the crowbar taken still lay where a miner left it, and winding the
// lift-cage up told of it going down. cov2's first galleries are the same work. And the deserters who keep a road in
// ash went off up the road when their sergeant fell, by what the page said, and went on leaning on their pikes by
// the fire.
class Galleries {
  static async start() {
    const w = await WorldAssembler.assemble('cov2', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return PlaySession.start(w.path, 'cov2', w.source);
  }
  static put(s: PlaySession, room: string) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', room) },
      { kind: 'retract', call: ModuleWriter.call('unlit', room) }]));
  }
  static seen(s: PlaySession) { return PlayerView.observe(s.campaign).observations.map(o => o.text).join(' '); }
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No ${pattern}: ${PlayerView.choices(s.campaign).map(x => x.choice.name).join(' | ')}`); }
    const before = PlayerView.observe(s.campaign), event = await s.perform(c.choice.id);
    const f = ActionFeedbackView.read(s.campaign, event, before);
    return [f.result, ...f.observations, ...f.events].join(' ');
  }
}

describe('a place says what is so', () => {
  it('has no crowbar lying where one was taken from', async () => {
    const s = await Galleries.start();
    Galleries.put(s, 'region__w1_adit');
    expect(Galleries.seen(s)).toContain('A crowbar lies where one of them left it');
    await Galleries.take(s, /^Collect a miner's crowbar for Wenna/);
    expect(Galleries.seen(s)).not.toContain('A crowbar lies');
    expect(Galleries.seen(s)).toContain('rough pit-props stand among the Delvers\' oak');
  }, 60000);
  it('has no deserters by the fire once their sergeant is dead and they have gone off up the road', async () => {
    const w = await WorldAssembler.assemble('ash', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'ash', w.source), post = s.campaign.world.one('at', 'tollKeepers__keepers')!;
    const checkpoint = s.checkpoint();
    for (const id of s.campaign.readout.inhabitants['tollKeepers__chief']!) {
      checkpoint.save.creatures.find(c => c.id === id)!.state.hp = 0;
    }
    checkpoint.save.state.world = CreatureFacts.project(new World(checkpoint.save.module, checkpoint.save.state.world),
      checkpoint.save.definition!.actors, new CreatureStore(checkpoint.save.creatures)).snapshot;
    const after = PlaySession.resume(checkpoint);
    Galleries.put(after, post);
    await after.perform('wait');
    expect(after.campaign.world.test(ModuleWriter.call('at', 'tollKeepers__keepers', post))).toBe(false);
    expect(Galleries.seen(after)).not.toContain('lean on pikes by a fire');
  }, 60000);
  it('winds the lift-cage up when it is wound up', async () => {
    const s = await Galleries.start();
    Galleries.put(s, 'region__w1_head');
    const told = await Galleries.take(s, /^Break the rust off the wheel and wind the lift-cage up$/);
    expect(told).toContain('the lift-cage comes up the shaft');
    expect(told).not.toContain('as it goes down');
  }, 60000);
});
