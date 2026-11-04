import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList } from '../src/ui/choice-list';
import { ModuleWriter } from '../src/lang/module-writer';
import { WaysPane } from '../web/reader/stage/ways-pane';

// The product-design review's PD-04: from outside Lunalac the way in was "Lunalac", the place's own name, and named
// the site before it was known; a door's act said "toward Out to Lunalac". The way in is said by its own name, and an
// act on a way says the place the way goes to.
describe('the way into a site from its outside', () => {
  it('is said by its own name, not the site\'s, and an act on it says where it goes', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'kin', party: [{ name: 'Nan', raceId: 'human', classId: 'mage' }] });
    const c = (await PlaySession.start(w.path, 'kite', w.source)).campaign;
    const k = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    k.commit(k.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__w3') }]));
    const screen = ScreenModel.build(c), inward = screen.exits.find(e => e.transition === 'enter')!;
    expect(inward.scope).toBeUndefined();
    expect(ChoiceList.wayLabel(inward)).not.toMatch(/Paliduslac/);
    expect(WaysPane.tile('Out to Lunalac — look at the speaking door', 'Lunalac').r).toBe('toward Lunalac');
  }, 120000);
});
