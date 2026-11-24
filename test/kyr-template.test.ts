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
      'dead', 'pickers', 'spiders', 'bear']);
  });
  // What the merchant says of the rats is what is under the corn-store: "a whole nest of them" had been two rats of one
  // hit point for a lone company (cold play 5, CL-37).
  it('has the merchant say as many rats as the corn-store holds', () => {
    const rats = RegionUndertown.template.sections.find(s => s.option === 'rats')!;
    const said = (company: number) => KyrTemplates.fill(rats.lines, RegionUndertown.values('s1', 'Lowmouth', company,
      { merchant: 's1_shop', priest: 's1_shrine', innkeeper: 's1_taproom' })).join('\n');
    expect(said(1)).toContain('Numbers 2.');
    expect(said(1)).toContain('Rats, a couple of them at the least, and bold with it.');
    expect(said(3)).toContain('Numbers 5.');
    expect(said(3)).toContain('Rats, a whole nest of them, and bold with it.');
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
