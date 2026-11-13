import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Guidance } from '../../web/reader/guidance';
import type { ReaderApp } from '../../web/reader/reader-app';
import type { MemberRow } from '../../src/ui/screen-types';

// In the quiet game the aim's next step is shown only to a company with a cleric, whose prayers show the way; the page
// had known a cleric by the word in a member's line ("human cleric"), so a calling called otherwise was missed and a
// line that only said the word was taken (AR-05: text inference in the page). The calling is the row's own, by id.
const quiet = (party: Partial<MemberRow>[]) => Guidance.shown({ props: { query: new URLSearchParams('guide=quiet') },
  state: { frame: { screen: { party } } } } as unknown as ReaderApp);

describe('the quiet game\'s guidance', () => {
  it('is shown to a company with a cleric by calling, and not for a word in a line', async () => {
    const t = await Tiny.start(`
      Place yard "the yard" is room at 0, 0 outdoors.
      Company party "You" of 1 at yard.
      Goal false.`, { party: [{ name: 'Wenna', raceId: 'human', classId: 'cleric' }] });
    expect(t.screen.party.map(m => m.calling)).toEqual(['cleric']);
    expect(quiet(t.screen.party)).toBe(true);
    expect(quiet([{ line: 'human cleric', calling: 'warrior' }])).toBe(false);
  });
});
