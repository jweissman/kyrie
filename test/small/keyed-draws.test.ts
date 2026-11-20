import { describe, expect, it } from 'bun:test';
import { KyrTemplates } from '../../src/world/kyr-template';

// Keyed draws (the owner, 19 November, MT-14): each group of a template draws by its own name under the place's key,
// so that content added to a template moves no other content. A group put in first, two groups moved, a group emptied
// for a place, each leaves every other group's draw as it was, in every place; only a group's own options or
// weights change what that group draws.
const sections = (groups: string[], weights: Record<string, number[]> = {}) => ['# keyed: groups', ...groups
  .flatMap(g => (weights[g] ?? [1, 1, 1]).map((w, i) => `--- ${g} ${g}${i} ${w}${g === 'cellar' ? ' if cellar' : ''}`)
    .flatMap(h => [h, `  // ${h}`, '  Goal false.']))].join('\n');
const drawn = (text: string, key: string, values: Record<string, string> = { cellar: 'yes' })
  : Record<string, string | undefined> =>
  Object.fromEntries(KyrTemplates.choose(KyrTemplates.parse(text), key, values).map(x => [x.group, x.option]));
const places = Array.from({ length: 30 }, (_, i) => `seed${i}:s${i % 4}:undertown`);
const four = ['rats', 'crypt', 'cellar', 'gallery'];

describe('a template\'s draws, keyed by group', () => {
  it('draws each other group as it was when a group is put in first or two are moved', () => {
    for (const key of places) {
      const before = drawn(sections(four), key);
      expect(drawn(sections(['hand', ...four]), key)).toEqual({ ...before, hand: drawn(sections(['hand']), key).hand });
      expect(drawn(sections(['gallery', 'rats', 'crypt', 'cellar']), key)).toEqual(before);
    }
  });
  it('draws each other group as it was when one is emptied for a place', () => {
    for (const key of places) {
      const rest = drawn(sections(four), key);
      delete rest.cellar;
      expect(drawn(sections(four), key, {})).toEqual(rest);
    }
  });
  it('changes only the group whose weights change', () => {
    let moved = 0;
    for (const key of places) {
      const before = drawn(sections(four), key), after = drawn(sections(four, { crypt: [1, 5, 9] }), key);
      expect({ ...after, crypt: before.crypt } as Record<string, string | undefined>).toEqual(before);
      moved += Number(after.crypt !== before.crypt);
    }
    expect(moved).toBeGreaterThan(0);
  });
});
