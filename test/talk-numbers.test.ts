import { describe, expect, it } from 'bun:test';
import { TalkFocus } from '../web/reader/talk-focus';

// A conversation is four acts in view (the owner's ruling 2, 16 November): taking your leave always, and in the three
// rows before it any answer owed, then what can be said and Trade, a page at a time, the rest paged and never unfolded
// (M22's baseline had found three topics, Trade and the leave at once, and keys numbered 6, 7 and 9 for rows in view).
// Each row's key is its place on the page.
describe('a conversation\'s rows', () => {
  const topics = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  it('shows what fits whole, and pages the rest a room at a time, round to the first', () => {
    expect(TalkFocus.paged(['a', 'b', 'trade'], 3, 0)).toEqual({ shown: ['a', 'b', 'trade'], at: 0, pages: 1 });
    expect([0, 1, 2, 3].map(p => TalkFocus.paged(topics, 3, p).shown))
      .toEqual([['a', 'b', 'c'], ['d', 'e', 'f'], ['g'], ['a', 'b', 'c']]);
    expect(TalkFocus.paged(topics, 3, 1)).toMatchObject({ at: 1, pages: 3 });
  });
  it('leaves room for the answers owed, and none when they fill it', () => {
    expect(TalkFocus.paged(topics, 3 - 1, 0).shown).toEqual(['a', 'b']);
    expect(TalkFocus.paged(topics, 3 - 3, 0)).toEqual({ shown: [], at: 0, pages: 1 });
  });
  it('never puts more than three beside the leave, whatever the page', () => {
    for (const n of [0, 1, 3, 4, 7, 20]) {
      const items = topics.concat(topics, topics).slice(0, n);
      for (let p = 0; p < 4; p++) { expect(TalkFocus.paged(items, 3, p).shown.length).toBeLessThanOrEqual(3); }
    }
  });
});
