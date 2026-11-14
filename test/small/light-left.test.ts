import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ScreenModel } from '../../src/ui/screen-model';

// A search the light will not last through is said so beside it (CO-12: a torch, then a candle, burned out in one
// search with no word before). Not barred: another light may be lit.
const cellar = `
  Place cellar "the cellar" is room at 0, 0 underground.
  Company party "You" of 1 at cellar.
  Initially Assert unlit(cellar).`;
const search = (t: Tiny) => ScreenModel.build(t.campaign).camp.find(a => a.does === 'search');
describe('a search in a failing light', () => {
  it('says the light will give out first, and is not barred', async () => {
    const t = await Tiny.start(cellar);
    await t.play('Pack › A torch › Light');
    expect(search(t)?.about ?? '').not.toMatch(/give out first/);
    for (let i = 0; i < 12 && (ScreenModel.build(t.campaign).expedition.flame?.left ?? 99) >= 20; i++) {
      await t.play('Wait › A while');
    }
    expect(ScreenModel.build(t.campaign).expedition.flame?.left).toBeLessThan(20);
    expect(search(t)).toMatchObject({ risk: true });
    expect(search(t)?.about).toMatch(/The torch has \d+ minutes left: it will give out first\./);
    expect(search(t)?.disabled).toBeUndefined();
  });
});
