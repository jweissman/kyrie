import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { CreatureFacts } from '../src/campaign/creature-facts';
import { CreatureStore } from '../src/creature-store';
import { World } from '../src/lang/world';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';

// Nobody dead says goodbye. Found by an independent review of the deployed game: the company was talking to Sergeant
// Mawr at his toll when it attacked him, and with him dead the road still offered to talk to him and to take its leave,
// and he answered with a caring farewell. A conversation now ends when whoever it was with falls, or turns on the
// company. Here it is a1's toll-reeve at the bridge over the Deepwater.
class Bar {
  static async start() {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'a1', w.source);
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__s2_s3_way') }]));
    const reeve = s.campaign.module.entities.find(e => e.id.endsWith('__chief')
      && s.campaign.world.test(ModuleWriter.call('at', e.id, 'region__s2_s3_way')))!.id;
    const talk = PlayerView.choices(s.campaign).find(x => x.choice.id === `talk_to(${reeve})`)!;
    await s.perform(talk.choice.id);
    return { s, reeve };
  }
  static leaving(s: PlaySession, reeve: string) {
    return PlayerView.choices(s.campaign).filter(x => x.choice.id.startsWith(`take_leave(${reeve}`));
  }
}

describe('the dead', () => {
  it('end the conversation they were in, and take no leave', async () => {
    const { s, reeve } = await Bar.start();
    expect(Bar.leaving(s, reeve).length).toBe(1);
    const checkpoint = s.checkpoint(), members = s.campaign.readout.inhabitants[reeve]!;
    for (const id of members) { checkpoint.save.creatures.find(c => c.id === id)!.state.hp = 0; }
    checkpoint.save.state.world = CreatureFacts.project(new World(checkpoint.save.module, checkpoint.save.state.world),
      checkpoint.save.definition!.actors, new CreatureStore(checkpoint.save.creatures)).snapshot;
    const after = PlaySession.resume(checkpoint);
    await after.perform('wait');
    expect(Bar.leaving(after, reeve)).toEqual([]);
    expect(after.campaign.world.test(ModuleWriter.call('addressed', reeve, 'party'))).toBe(false);
  }, 60000);
  it('nor does anyone who has turned on the company', async () => {
    const { s, reeve } = await Bar.start();
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('hostile', reeve, 'party') }]));
    await s.perform('wait');
    expect(s.campaign.world.test(ModuleWriter.call('addressed', reeve, 'party'))).toBe(false);
  }, 60000);
});
