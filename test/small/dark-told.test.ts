import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Told } from '../../web/reader/stage/told';

// The dark told truly (the second blind playtest, 15 November: "You have no light to see by. A torch or a candle is a
// coin at a chandler's" was said, in both runs, to a company carrying a torch, a candle and the Light spell). A company
// that can make a light is told only that it is dark, its lighting acts below; one that cannot, where a light is had.
describe('the dark', () => {
  it('sends to the chandler only a company with nothing to light', async () => {
    const t = await Tiny.start(`Place cellar "the cellar" is room at 0, 0 indoors.
      Initially Assert unlit(cellar).
      Company party "You" of 1 at cellar.`);
    expect(t.screen.dark).toBe(true);
    expect(Told.dark(t.screen)).toBe('It is dark here.');
    const bare = { ...t.screen, items: t.screen.items.filter(i => !i.light) };
    expect(Told.dark(bare)).toBe(Told.unlit);
  });
});
