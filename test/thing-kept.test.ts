import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { SceneModel } from '../src/ui/scene';
import { Attending } from '../src/ui/attention';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';

// What is looked at stays in view when nothing more can be done with it. Found by the follow-up independent review:
// reading a dead camp's notebook took the page away from it, the notebook having nothing left to do. It is still
// there to look at, until it is turned away from (cov11's wardens' store).
describe('a thing looked at', () => {
  it('stays in view when nothing is left to do with it', async () => {
    const w = await WorldAssembler.assemble('cov11', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'cleric' }] });
    const s = await PlaySession.start(w.path, 'cov11', w.source), room = 'region__w8_gatehouse_store';
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', room) },
      { kind: 'retract', call: ModuleWriter.call('unlit', room) }]));
    const scene = () => SceneModel.build(ScreenModel.build(s.campaign));
    const notebook = scene().subjects.find(x => /notebook/.test(x.name))!;
    const read = PlayerView.choices(s.campaign).find(x => /^Unstrap the notebook/.test(x.choice.name))!;
    await s.perform(read.choice.id);
    expect(scene().subjects.some(x => x.id === notebook.id)).toBe(false);
    expect(Attending.thing(scene(), notebook.id)?.subject.name).toBe(notebook.name);
  }, 60000);
});
