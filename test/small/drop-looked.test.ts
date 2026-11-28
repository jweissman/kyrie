import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A one-way drop is looked down first (SI-09, split from SI-08; the sites' phase A: "a one-way chute offers no look
// first"): from its top, by a company that can see, what lies below and whether anything moves there, once; a way
// that comes back up asks no look, nor does a company in the dark.
const pit = (below: string) => `
  Place top "the top of the shaft" is room at 0, 0 underground.
  Place pit "the bottom of the shaft" is room at 1, 0 underground.
  Place gallery "the gallery" is room at 0, 1 underground.
  Passage chute "the chute" is shaft between top and pit one way.
  Passage stair "the stair" is passage between top and gallery.
  Company party "You" of 1 at top.
  ${below}
  Goal false.`;
const look = /^Look down the chute first/;
class Drop {
  static offered(t: Tiny, label: RegExp): boolean { return t.journey.choices().some(c => label.test(c.label)); }
}

describe('a one-way drop', () => {
  it('is looked down first, telling what moves below, and only once', async () => {
    const t = await Tiny.start(pit(`Person rats "the rats" at pit { Role "rats as big as cats". Species rat. Numbers 3. }`),
      { horizon: ['probing'] });
    expect(Drop.offered(t, look)).toBe(true);
    expect(Drop.offered(t, /^Look down the stair/)).toBe(false);
    await t.play('Look down the chute first');
    expect(t.journey.latest).toContain('the bottom of the shaft below, and something moving down there');
    expect(Drop.offered(t, look)).toBe(false);
  });
  it('says nothing moves where nothing does', async () => {
    const t = await Tiny.start(pit(''), { horizon: ['probing'] });
    await t.play('Look down the chute first');
    expect(t.journey.latest).toContain('the bottom of the shaft below, and nothing moving');
  });
  it('is not looked down in the dark', async () => {
    const t = await Tiny.start(pit('Initially Assert unlit(top).'), { horizon: ['probing'] });
    expect(Drop.offered(t, look)).toBe(false);
  });
});
