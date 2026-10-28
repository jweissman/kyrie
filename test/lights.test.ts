import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { ModuleWriter } from '../src/lang/module-writer';

// No one sets out without a light (a candle, which weighs nothing), and a light can be had where travellers are
// kept: the cold evaluation's ranger went down into a pitch-dark barrow with none, then asked an herb-wife, an
// innkeeper, a clothier, a boatwright, a shrine-keeper and a carpenter for a candle, and none sold one.
describe('a light', () => {
  it('is carried from the start, and sold at the inn', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'order',
      party: [{ name: 'Maud', raceId: 'elf', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    const carried = ScreenModel.build(c).items.map(i => i.name.toLowerCase());
    expect(carried.some(n => /candle/.test(n))).toBe(true);
    const town = w.report.region.settlements[0]!.id;
    const held = c as unknown as { world: { apply(c: unknown[]): unknown; one(r: string, a: string): string };
      commit(x: unknown): void };
    held.commit(held.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', held.world.one('at', 'party')) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', `region__${town}_taproom`) }]));
    const sold = ScreenModel.build(c).trade.find(t => t.id === `region__${town}_innkeeper`);
    const wares = JSON.stringify(sold ?? {}).toLowerCase();
    expect(wares).toContain('torch');
    expect(wares).toContain('candle');
  }, 120000);
});
