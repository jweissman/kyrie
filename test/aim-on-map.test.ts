import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';

// Whatever an aim names is somewhere on the map, heard of (the owner's evidence sessions of 7 November): "Your father
// went out by the bridge over the Nûrrant" named a bridge neither the map nor Go… showed, found only by guessing which
// road it was on; "Bring the crown out of Nocsrecs" named a barrow the map did not show. A stretch of road is marked
// half way along its road; a site by itself, never its rooms.
describe('a place an aim names', () => {
  it('is on the map from the moment the aim is held', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'kin',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), screen = ScreenModel.build(s.campaign);
    const said = /^Your father went out by (the bridge.+?) with the cart/;
    const bridge = said.exec((screen.aims ?? []).find(a => said.test(a.text))!.text)![1]!;
    const marks = (screen.region?.land as { marks: { name: string; state: string; cell?: number }[] }).marks;
    expect(marks.find(m => m.name === bridge)).toMatchObject({ state: 'heard' });
    expect(marks.find(m => m.name === bridge)?.cell).toBeDefined();
  }, 120000);
});
