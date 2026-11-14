import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlaySession } from '../../src/session/play-session';
import { Journey } from '../../src/session/journey';

// A Paragon pin (doc/architecture/mission-21/paragon-pins.md): a deep dwarven mine. A company goes down a shaft into
// the dark, finds a vein by searching, takes its ore, climbs out, is saved and restored, and goes back down to find the
// place as it left it: the vein worked, the ore gone, what was learned still known. Through the player's own acts.
const mine = `
  Place mine "the old mine" is site.
  Place head "the pit-head" is room within mine at 0, 0 outdoors.
  Place stope "the stope" is room within mine at 0, 1 underground.
  Passage shaft "the shaft" is shaft between head and stope.
  Company party "You" of 1 at head.
  Kind ore_lump "a lump of star-iron" like cell_key worth 20.
  Discovery vein_found "A seam of dark metal runs through the rock here, worked and left." { Found by searching stope. }
  Item ore "a lump of star-iron" is ore_lump at stope hidden until vein_found.`;
describe('a deep mine', () => {
  it('is gone down into, searched, taken from, left, and found again as it was left, across a save', async () => {
    const t = await Tiny.start(mine);
    await t.play('Pack › A torch › Light', 'To the stope', 'Search');
    await t.play('a lump of star-iron: Take');
    expect(t.journey.at('t__ore')).not.toBe('t__stope');
    await t.play('To the pit-head');
    const saved = JSON.parse(JSON.stringify(t.journey.session.checkpoint()));
    const again = Journey.of(PlaySession.resume(saved, { trusted: true }));
    await again.play('To the stope');
    expect(again.at('party')).toBe('t__stope');
    expect(again.at('t__ore')).not.toBe('t__stope');
    expect(again.holds('knows', 'party', 't__vein_found')).toBe(true);
  });
});
