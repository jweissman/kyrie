import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import { Flame } from '../web/reader/stage/flame';

// The flame you carry: somewhere unlit, the stage is lit from its foot by the flame the company goes by, and draws
// in as it runs down (the cold review's best moment, a torch expiring at the casket, felt in every descent and not
// only read in the footer). None in the light of day, nor where nothing burns.
describe('the flame the company carries', () => {
  it('is the torch lit somewhere unlit, and none on the surface, in the unlit dark, or put out', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'a1', w.source);
    expect(ScreenModel.build(s.campaign).expedition.flame).toBeUndefined();
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__w8_barrow_chamber') }]));
    expect(ScreenModel.build(s.campaign).expedition.flame).toBeUndefined();
    await s.perform(PlayerView.choices(s.campaign).find(x => x.choice.name === 'Light a torch')!.choice.id);
    const lit = ScreenModel.build(s.campaign).expedition.flame;
    expect(lit).toMatchObject({ kind: 'torch', who: 'Wenna' });
    expect(lit!.left).toBeGreaterThan(Flame.low);
    expect(Flame.classes(lit)).toBe('flame on flame-torch');
    c.commit(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', 'region__w8_barrow_chamber') },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__w8') }]));
    expect(ScreenModel.build(s.campaign).expedition.flame).toBeUndefined();
  }, 60000);
  it('draws in with ten minutes or less, and is drawn faded where none burns', () => {
    const glow = (flame?: Parameters<typeof Flame.classes>[0]) => renderToStaticMarkup(createElement(Flame.Glow,
      { flame }));
    expect(glow({ kind: 'torch', who: 'Wenna', left: 10 })).toContain('class="flame on flame-torch low"');
    expect(glow({ kind: 'torch', who: 'Wenna', left: 20 })).toContain('class="flame on flame-torch"');
    expect(glow({ kind: 'conjured', who: 'Hild' })).toContain('class="flame on flame-conjured"');
    expect(glow()).toContain('class="flame"');
    expect(glow()).toContain('aria-hidden="true"');
  });
});
