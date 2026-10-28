import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';
import { PassageModel } from '../src/ui/passage-model';

// In the pitch dark who is there is heard, not seen: not their kind, nor the role their author gave them, nor what
// they are doing (play 8's crypt read "The risen dead · Revenant" and "The knitted hound · the necromancer's
// watchdog" by no light at all: A Winter in Carth's friction 11, the register's CTH-11). Lit, they are seen. A thing
// in the dark is not seen at all.
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
  // What bars a way out of the dark is heard, too; lit, it is told in its own words, not in another place's that
  // only mentions it (the crypt's way up to the hall, where the risen stand, was told by the bailey's footprints).
  it('says what bars a way as heard, and in its own words once there is light', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    const held = c as unknown as { world: { apply(c: unknown[]): unknown; one(r: string, a: string): string };
      commit(x: unknown): void };
    held.commit(held.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', held.world.one('at', 'party')) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 'tower__crypt') }]));
    const up = () => ScreenModel.build(c).exits.find(e => e.destination.id === 'tower__hall')?.blocked;
    expect(up()).toBe('In the dark you can hear the risen dead there.');
    held.commit(held.world.apply([{ kind: 'retract', call: ModuleWriter.call('unlit', 'tower__crypt') }]));
    expect(up()).toMatch(/^Dead folk in grave-clothes stand swaying/);
  }, 120000);
  // "the webs is in the way" (play 9): what is in the way agrees with itself, and is felt in the dark.
  it('says what is in the way as it is, felt in the dark', () => {
    expect(PassageModel.inTheWay('the webs', false)).toBe('The webs are in the way.');
    expect(PassageModel.inTheWay('the portcullis', false)).toBe('The portcullis is in the way.');
    expect(PassageModel.inTheWay('the webs', true)).toBe('In the dark, the webs are in the way.');
  });
});
