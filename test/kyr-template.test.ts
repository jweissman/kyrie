import { describe, expect, it } from 'bun:test';
import { KyrTemplates } from '../src/world/kyr-template';
import { RegionUndertown } from '../src/world/region-undertown';

// Content a generator places and an author writes: a template of Kyr in data, its sections chosen and filled, an
// author's new option a new choice with no engine code changed (the owner, 2 November).
describe('a Kyr template', () => {
  const text = ['# cellar: what is under a house', '// a comment', '--- base',
    '  Place {t}_cellar "the cellar" is room within {t}.', '--- trouble rats', '  Person {t}_rats "rats" at {t}_cellar { }',
    '>> RATS. Ask {{t}_merchant}.', '--- trouble toads 3', '  Person {t}_toads "toads" at {t}_cellar { }', '>> TOADS.'].join('\n');
  it('writes every section of its own group and one drawn option of each other, filled', () => {
    const t = KyrTemplates.parse(text), picked = KyrTemplates.choose(t, 'a');
    expect(t).toMatchObject({ id: 'cellar', about: 'what is under a house' });
    expect(picked.map(s => s.group)).toEqual(['base', 'trouble']);
    const lines = picked.flatMap(s => KyrTemplates.fill(s.lines, { t: 's2' }));
    expect(lines[0]).toBe('  Place s2_cellar "the cellar" is room within s2.');
    const said = KyrTemplates.fill(picked.flatMap(s => s.said), { t: 's2' });
    expect(said[0] === 'RATS. Ask {s2_merchant}.' || said[0] === 'TOADS.').toBe(true);
  });
  it('is what the undertown is written from', () => {
    expect(RegionUndertown.template.id).toBe('undertown');
    expect(RegionUndertown.template.sections.filter(s => s.said.length).map(s => s.option)).toEqual(['apprentice', 'runaway', 'rats',
      'dead', 'spiders']);
  });
  // A group's option fixed, as a kit's author fixes a dimension (Iscoed's first town keeps the corn-store's rats):
  // written in place of the one drawn, and the groups after it drawn as they would have been.
  it('writes the option fixed for its group, and draws the groups after it as before', () => {
    const t = KyrTemplates.parse([text, '--- weather rain', '>> RAIN.', '--- weather sun', '>> SUN.'].join('\n'));
    for (const key of ['a', 'b', 'c', 'd']) {
      const drawn = KyrTemplates.choose(t, key), fixed = KyrTemplates.choose(t, key, {}, { trouble: 'rats' });
      expect(fixed.map(x => x.option)).toEqual(['base', 'rats', drawn[2]!.option]);
    }
  });
});
