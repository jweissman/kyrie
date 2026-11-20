import { describe, expect, it } from 'bun:test';
import { ChoiceGrouping } from '../../src/ui/choice-grouping';
import { ChoiceIds } from '../../src/ui/choice-ids';
import type { Act } from '../../src/ui/screen-types';

// A row's id is its own, not its place among its siblings (the integration's CI, 20 November: the notice on the
// well-post had been company/1, then company/4 once the four waits were rows of their own, and a capture replayed by
// id broke on a sibling added; MT-15: replays by meaning). Two alike are told apart by a count; an id kept by an older
// build still names its row where one alone is alike to it.
class Grouped {
  static keys(paths: string[][]): string[] {
    const acts: Act[] = [];
    for (const [i, path] of paths.entries()) { ChoiceGrouping.insert(acts, path, { command: `c${i}` }); }
    return acts.map(a => a.key);
  }
}

describe('a row\'s id', () => {
  it('is unchanged by a sibling added before it', () => {
    const alone = Grouped.keys([['Read the notice on the well-post']]);
    const after = Grouped.keys([['Wait a while'], ['Wait an hour'], ['Wait until dark'], ['Wait and watch'],
      ['Read the notice on the well-post']]);
    expect(after.at(-1)).toBe(alone[0]);
    expect(alone).toEqual(['0:Read the notice on the well-post']);
  });
  it('tells two acts said alike apart by a count, and an opener\'s rows by their own labels', () => {
    expect(Grouped.keys([['Look'], ['Look']])).toEqual(['0:Look', '1:Look']);
    const acts: Act[] = [];
    ChoiceGrouping.insert(acts, ['Wait'], { command: 'w' });
    ChoiceGrouping.insert(acts, ['Buy', 'A ration'], { command: 'b1' });
    ChoiceGrouping.insert(acts, ['Buy', 'A torch'], { command: 'b2' });
    expect([acts.map(a => a.key), acts[1]!.children!.map(a => a.key)])
      .toEqual([['0:Wait', '0:Buy'], ['0:A ration', '0:A torch']]);
  });
  it('resolves an id kept by position to the one row alike to it, and none where two are', () => {
    const now = ['company/0:Wait a while', 'company/0:Read the notice on the well-post', 'region__x/0:Look',
      'region__x/1:Look'];
    expect(ChoiceIds.resolve('company/4:Read the notice on the well-post', now))
      .toBe('company/0:Read the notice on the well-post');
    expect(ChoiceIds.resolve('company/0:Wait a while', now)).toBe('company/0:Wait a while');
    expect(ChoiceIds.resolve('region__x/3:Look', now)).toBeUndefined();
    expect(ChoiceIds.resolve('company/2:Sing', now)).toBeUndefined();
  });
});
