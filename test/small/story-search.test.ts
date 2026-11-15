import { describe, expect, it } from 'bun:test';
import { StorySearch } from '../../web/reader/story-search';
import type { Entry } from '../../web/engine/protocol';

// A search of the story so far: by what was done and what was told, case and curled quotes aside; nothing asked, all.
const entry = (id: number, said: string, lines: string[], placeName = 'The green'): Entry =>
  ({ id, said, lines, place: 'p', placeName } as unknown as Entry);
describe('a search of the story', () => {
  const story = [entry(1, 'Talk to the drover', ['He says the ford is low.']),
    entry(2, 'Wait', ['The light goes.'], 'The camp'), entry(3, 'Search here', ['A folded paper under the “chest”.'])];
  it('finds what was said, what was done, and where, whatever the case or the quotes', () => {
    expect(StorySearch.filter(story, 'FORD').map(e => e.id)).toEqual([1]);
    expect(StorySearch.filter(story, 'search here').map(e => e.id)).toEqual([3]);
    expect(StorySearch.filter(story, 'camp').map(e => e.id)).toEqual([2]);
    expect(StorySearch.filter(story, '"chest"').map(e => e.id)).toEqual([3]);
  });
  it('shows everything for nothing asked, and nothing for what was never said', () => {
    expect(StorySearch.filter(story, '  ').map(e => e.id)).toEqual([1, 2, 3]);
    expect(StorySearch.filter(story, 'dragon')).toEqual([]);
  });
});
