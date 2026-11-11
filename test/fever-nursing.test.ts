import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';

// An act advances an aim only by making what it waits on so, not by making it so again: the fever's mother keeping
// the feverwort, the page had led her, in the aim's gold, for giving her the company's other herbs too, which did
// nothing (round 7, L 25-26).
describe('the fever, the feverwort given', () => {
  it('leads the mother for what is left to do, not for more herbs', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'herbs', party: [{ name: 'Merle', raceId: 'human',
      classId: 'cleric', backgroundId: 'apothecary' }] }, NodeBundleSource.shared);
    const c = s.campaign, mother = 'fever__mother';
    for (const [p, to] of Journey.way(c.world, c.world.one('at', 'party')!, c.world.one('at', mother)!)) {
      await s.leg(`go(${p},${to})`);
    }
    await s.perform(`give(region__party_1__feverwort,${mother})`);
    const led = Narrator.leaf(c, ScreenModel.build(c)).glance!.acts.find(a => a.subject === mother);
    expect(led?.continues).toBe(true);
    expect(led?.for ?? '').not.toMatch(/^give\(/);
  }, 120000);
});
