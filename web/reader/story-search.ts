import type { Entry } from '../../src/creation/protocol';

// A search of the story so far (the capstone map's "scrollback and search", 15 November): the entries that say the
// words, by what the player did and by what was told, case and curled quotes set aside. A presentation operation only:
// nothing in the game changes by it.
export class StorySearch {
  static plain(text: string): string {
    return text.replace(/[‘’]/g, '\'').replace(/[“”]/g, '"').toLowerCase().replace(/\s+/g, ' ').trim();
  }
  static filter(entries: Entry[], query: string): Entry[] {
    const q = this.plain(query);
    if (!q) { return entries; }
    return entries.filter(e => this.plain([e.said, ...e.lines, e.placeName].join(' ')).includes(q));
  }
}
