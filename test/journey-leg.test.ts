import { describe, expect, it } from 'bun:test';
import { Words } from '../web/reader/words';

// A leg of a journey on the map's plan says its way and where it comes, and does not name the place twice when the
// way is named for it (the cold evaluation: "By the track to a great long mound with a door of stone to a great long
// mound with a door of stone").
describe('a leg of a journey', () => {
  it('names where it comes once', () => {
    expect(Words.leg('the track to a great long mound', 'a great long mound')).toBe('By the track to a great long mound');
    expect(Words.leg('the stakes out into Sealtmersc', 'the edge of Sealtmersc'))
      .toBe('By the stakes out into Sealtmersc to the edge of Sealtmersc');
  });
});
