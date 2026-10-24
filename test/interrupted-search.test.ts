import { describe, expect, it, spyOn } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Items } from '../src/campaign/items';
import { ModuleWriter } from '../src/lang/module-writer';
import { CreatureFacts } from '../src/campaign/creature-facts';
import { CreatureStore } from '../src/creature-store';
import { World } from '../src/lang/world';
import type { Change } from '../src/lang/module';

// What a search turns up comes when it has run its course, not before it is known whether it happened. Found by an
// architecture review: the search's finds were handed over as it began, and kept though the light gave out in the
// middle of it and it failed. Here the torch has one watch left of the search's two.
class Search {
  static async begin(left?: number) {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    let s = await PlaySession.start(w.path, 'a1', w.source);
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__w8_barrow_passage') }]));
    await s.perform(PlayerView.choices(s.campaign).find(x => x.choice.name === 'Light a torch')!.choice.id);
    if (left !== undefined) {
      const checkpoint = s.checkpoint();
      for (const m of checkpoint.save.creatures.filter(x => checkpoint.save.state.partyIds.includes(x.id))) {
        for (const lit of m.state.conditions.filter(x => x.id === 'torchlit')) { lit.remaining = left; }
      }
      const save = checkpoint.save;
      save.state.world = CreatureFacts.project(new World(save.module, save.state.world), save.definition!.actors,
        new CreatureStore(save.creatures)).snapshot;
      s = PlaySession.resume(checkpoint);
    }
    return s;
  }
  static async search(s: PlaySession) {
    const rummage = spyOn(Items, 'rummage');
    try {
      const search = PlayerView.choices(s.campaign).find(x => /^Search /.test(x.choice.name))!;
      const event = await s.perform(search.choice.id);
      return { event, rummaged: rummage.mock.calls.length };
    } finally { rummage.mockRestore(); }
  }
}

describe('a search', () => {
  it('turns up nothing when the light gives out in the middle of it', async () => {
    const { event, rummaged } = await Search.search(await Search.begin(1));
    expect(event.result).toBe('failure');
    expect(rummaged).toBe(0);
  }, 60000);
  it('turns up what it finds when it runs its course', async () => {
    const { event, rummaged } = await Search.search(await Search.begin());
    expect(event.result).toBe('success');
    expect(rummaged).toBe(1);
  }, 60000);
});
