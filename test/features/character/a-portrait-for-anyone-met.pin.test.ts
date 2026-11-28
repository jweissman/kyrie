import { describe, expect, it } from 'bun:test';
import { Likeness } from '../../../src/paintings/likeness';
import { Sittings } from '../../../src/paintings/sittings';

// A conversation is its speaker's painting, large (the conversation page: a painting for nearly everyone met, chosen
// by calling, since portraits show callings; it looks broken where there is none: the owner, 26 November). In a new
// life's first steps a talk had been in type one time in twenty (the quantity gate's painting misses, 27 November,
// OR-1761): the boy in the bracken with a hare in a snare, a sellsword on the well-kerb, a sexton, an old man with a
// stick, a wandering preacher, whose words named no work with a painting and placed them in no station. Now whoever no
// word places is painted as one of the middling folk of their sex and years; and they are painted
// after whoever their words do place, from what no one holds, so that they never take a pedlar's painting nor hang in
// another's; a life's own cast, met first, is painted before anyone (the wagoner on the road in had been left none by
// a country of two hundred: OR-1764). No world is started: the words are as the world gives them.
describe('a portrait for anyone met', () => {
  it('paints one whose words name no work as one of the middling folk of their sex, of their years', () => {
    const cases = [['a boy down in the bracken with a hare in a snare', 'man', 'young'],
      ['a sellsword between masters, sitting on the well-kerb', 'woman', undefined],
      ['an old man with a stick and a bad hip', 'man', undefined]] as const;
    for (const [role, sex, age] of cases) {
      const sitter = Likeness.sitter(Likeness.of({ role, sex, key: role }) ?? '');
      expect([role, sitter?.sex, sitter?.station, age ? sitter?.age : age]).toEqual([role, sex, 'middling', age]);
      expect([role, Likeness.placed({ role, sex })]).toEqual([role, false]);
    }
    // Only where nothing says even their sex is anyone left in type.
    expect(Likeness.of({ role: 'a figure on the road', key: 'x' })).toBeUndefined();
  });
  it('reads a preacher as the faith and a sexton as the church\'s servant', () => {
    for (const role of ['a wandering preacher of the Keepers of the Road', 'the sexton, who keeps the churchyard']) {
      const sitter = Likeness.sitter(Likeness.of({ role, sex: 'man', key: role }) ?? '');
      expect([role, sitter?.station, Likeness.placed({ role, sex: 'man' })]).toEqual([role, 'religious', true]);
    }
  });
  it('paints a life\'s own cast first, then whoever words place, then whoever they do not, then over the march', () => {
    const placed = new Set(['pedlar', 'smith', 'origin__carter', 'xm1y0__cook']);
    expect(Sittings.order(['boy', 'xm1y0__cook', 'smith', 'origin__poacher', 'pedlar', 'stranger', 'origin__carter',
      'xm1y0__lad'], id => placed.has(id)))
      .toEqual(['origin__carter', 'origin__poacher', 'smith', 'pedlar', 'boy', 'stranger', 'xm1y0__cook', 'xm1y0__lad']);
  });
});
