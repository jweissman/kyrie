import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { KyrLint } from '../src/cli/kyr-lint';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';

// Generated worlds are held to what an author's adventure is: they lint without an error. Linting them as the
// architecture review asked of hazards found that a1's and wren's arcane symbols, an Orsino wonder, applied a focus
// the game cannot yet run (it gives spell slots too), and would have failed when touched. Such a wonder is met, and
// gives nothing.
describe('a generated world', () => {
  it('lints without an error', async () => {
    for (const seed of ['a1', 'thorn', 'd4', 'wren', 'cov2']) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
        { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
      const errors = (await KyrLint.campaign(w.path, w.source)).filter(f => f.level === 'error');
      expect([seed, errors.map(f => f.message)]).toEqual([seed, []]);
    }
  }, 240000);
  it('has a wonder whose power cannot be run met without failing', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'a1', w.source);
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__w2_hall') },
      { kind: 'retract', call: ModuleWriter.call('unlit', 'region__w2_hall') }]));
    const meet = PlayerView.choices(s.campaign).find(x => /the glowing symbols$/.test(x.choice.name))!;
    expect((await s.perform(meet.choice.id)).result).toBe('success');
  }, 60000);
});
