import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';

// How long the light will last, where it matters. Found by an independent review of the deployed game: the only
// torch went out in the middle of a search, and nothing on the page had said how long it had, nor that there was no
// other. Somewhere unlit, or while a light burns, the company's light is told under the company; a flame of its own
// out where it is not wanted, as put out.
describe('the company\'s light', () => {
  it('is told somewhere unlit: what burns, how long it has, and what there is to spare', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'a1', w.source);
    expect(ScreenModel.build(s.campaign).expedition.light).toBeUndefined();
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__w8_barrow_chamber') }]));
    // What is carried to spare is counted by its kind: the follow-up review found a torch in the pack and "nothing
    // to spare" beside it, the pack's kinds being counted by their names. (Everyone sets out with a torch and a
    // candle: the cold evaluation.)
    expect(ScreenModel.build(s.campaign).expedition.light).toBe('Nothing lit · 1 torch, 1 candle to spare');
    await s.perform(PlayerView.choices(s.campaign).find(x => x.choice.name === 'Light a torch')!.choice.id);
    expect(ScreenModel.build(s.campaign).expedition.light)
      .toMatch(/^Wenna's torch, (an hour|\d+ minutes) left · 1 candle to spare$/);
    // Out in the day the torch is put out, and keeps what is left of it: said as burning, it read as burning on
    // (play 7).
    c.commit(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', 'region__w8_barrow_chamber') },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__w8') }]));
    expect(ScreenModel.build(s.campaign).expedition.light)
      .toMatch(/^Wenna's torch, put out with (an hour|\d+ minutes) left · 1 candle to spare$/);
  }, 60000);
});
