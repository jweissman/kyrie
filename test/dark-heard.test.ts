import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';

// In the pitch dark who is there is heard, not seen: not their kind, nor the role their author gave them, nor what
// they are doing (play 8's crypt read "The risen dead · Revenant" and "The knitted hound · the necromancer's
// watchdog" by no light at all: A Winter in Carth's friction 11, the register's CTH-11). Lit, they are seen.
describe('who is there in the dark', () => {
  it('is said as heard, and as seen once there is light', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    const held = c as unknown as { world: { apply(c: unknown[]): unknown; one(r: string, a: string): string };
      commit(x: unknown): void };
    // The tower's hall, where its risen dead stand, with no light in it.
    held.commit(held.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', held.world.one('at', 'party')) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 'tower__hall') },
      { kind: 'assert', call: ModuleWriter.call('unlit', 'tower__hall') }]));
    const risen = () => ScreenModel.build(c).people.find(p => p.id === 'tower__risen');
    expect([risen()?.name, risen()?.note, risen()?.activity]).toEqual(['the risen dead', undefined, undefined]);
    held.commit(held.world.apply([{ kind: 'retract', call: ModuleWriter.call('unlit', 'tower__hall') }]));
    expect(risen()?.note).toBe('Revenant');
  }, 120000);
});
