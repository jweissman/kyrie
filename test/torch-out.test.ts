import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import type { CreatureStore } from '../src/creature-store';

// A light that runs out in the middle of something done is told (round 7: searching the nest "killed the torch
// partway through", silently): it had been taken for a blow of the fight the search ran into, and condensed away.
describe('a torch running out', () => {
  it('is told, as what happened, even in the middle of a fight', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const c = s.campaign;
    c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__s1_u_nest') }]));
    await s.perform(PlayerView.choices(c).find(x => /^light_item\(.*torch/.test(x.choice.id))!.choice.id);
    const store = (c as unknown as { creatures: CreatureStore }).creatures, id = c.readout.partyIds[0]!;
    const lease = store.acquire([id]);
    lease.creatures[0]!.state.conditions.find(k => k.id === 'torchlit')!.remaining = 1;
    lease.commit(lease.creatures); lease.release();
    const before = PlayerView.observe(c), event = await s.leg('search(region__s1_u_nest)');
    const lines = Narrator.leaf(c, ScreenModel.build(c), { event, feedback: ActionFeedbackView.read(c, event, before),
      said: 'Search the nest', moved: false }).exchange!.lines;
    expect(lines).toContainEqual({ kind: 'event', text: 'Ralf’s torch gutters out.' });
  }, 120000);
});
