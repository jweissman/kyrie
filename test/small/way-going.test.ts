import { describe, expect, it } from 'bun:test';
import { Words } from '../../web/reader/words';

// A way's row says its going whole, and only how it goes gives way where the row is narrow (the owner, 15 November: a
// brief main action and its details on one row; on a phone "Into the old stones above Broadholm by the path up the
// hill to the old stones" had been cut short).
describe('a way\'s name', () => {
  it('is its going, then how', () => {
    expect(Words.going('Into the old stones above Broadholm by the path up the hill to the old stones'))
      .toEqual(['Into the old stones above Broadholm', 'by the path up the hill to the old stones']);
    expect(Words.going('To the Walkers’ camp — drop the bar across the camp gate'))
      .toEqual(['To the Walkers’ camp', 'drop the bar across the camp gate']);
    expect(Words.going('To the edge of Darkhurst by Broadholm')).toEqual(['To the edge of Darkhurst', 'by Broadholm']);
  });
  it('is whole where there is no how, or it is no way', () => {
    expect(Words.going('To the bee orchards behind the town')).toEqual(['To the bee orchards behind the town']);
    expect(Words.going('Stand by the door')).toEqual(['Stand by the door']);
  });
});
