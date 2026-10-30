import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { Narrator } from '../src/presentation/narrator';
import { ScreenModel } from '../src/ui/screen-model';
import { ModuleWriter } from '../src/lang/module-writer';
import { GeneratedWorld } from './support/generated';

// Weariness come on is told after what came of the action, not in the middle of it (A Winter in Carth's friction 14:
// "It is a long time since you slept" landed in the middle of the Ash-reeve's visit).
describe('weariness', () => {
  it('is told after the rest of what came of the action', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    await GeneratedWorld.travel(s, 's1_shrine');
    // Awake as long as a company can be before weariness comes on.
    const watch = c.world.number(ModuleWriter.call('watch', 'clock'));
    const held = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    held.commit(held.world.apply([{ kind: 'set', call: ModuleWriter.call('lastSlept', 'party'),
      value: ModuleWriter.number(watch - 108) }]));
    const before = PlayerView.observe(c), name = 'Climb the tower and look out over Newmeet';
    const climb = PlayerView.choices(c).find(x => x.choice.name === name)!;
    const event = await s.perform(climb.choice.id), feedback = ActionFeedbackView.read(c, event, before);
    const lines = Narrator.leaf(c, ScreenModel.build(c), { event, feedback, said: name, moved: false })
      .exchange!.lines.map(l => l.text);
    expect(lines).toContain('The way down is the stair you came up.');
    expect(lines.at(-1)).toBe(Narrator.weary(true));
  }, 120000);
});
