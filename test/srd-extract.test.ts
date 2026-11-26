import { describe, expect, it } from 'bun:test';
import monsters from '../data/sources/srd35/monsters.json';
import { SrdPages } from '../src/cli/srd-pages';

describe('SRD creature extraction', () => {
  it('reads armor class when either the label or the value says AC', () => {
    const read = (label: string, value: string) => SrdPages.monster('test', 'body', '', key => key === label ? value : '');
    expect(read('Armor Class:', '13 (+2 Dex, +1 natural)').ac).toBe(13);
    expect(read('Armor Class:', 'AC 23 (+5 Dex, +1 natural)').ac).toBe(23);
    const fiend = read('AC:', '40 (-1 size, +8 Dex, +23 natural)');
    expect([fiend.ac, fiend.natural]).toEqual([40, 23]);
    expect([monsters.monsters['pit-fiend'].ac, monsters.monsters['pit-fiend'].natural,
      monsters.monsters['harpy-archer-7th-level-fighter'].ac]).toEqual([40, 23, 23]);
  });
  it('keeps iterative bonuses in order without losing the rest of the first attack routine', () => {
    expect(SrdPages.attacks('Club +7/+2 melee (1d6) and 2 claws +2 melee (1d3)')).toEqual([
      { name: 'club', count: 1, dice: '1d6', plus: 0, bonus: 7 },
      { name: 'club', count: 1, dice: '1d6', plus: 0, bonus: 2 },
      { name: 'claws', count: 2, dice: '1d3', plus: 0, bonus: 2 },
    ]);
    expect(SrdPages.attacks('Sword +3/-2 melee (1d8+1) or bow +4 ranged (1d6)')).toEqual([
      { name: 'sword', count: 1, dice: '1d8', plus: 1, bonus: 3 },
      { name: 'sword', count: 1, dice: '1d8', plus: 1, bonus: -2 },
    ]);
    expect(SrdPages.attacks('Morningstar +12/+7 melee (3d6+8), and 2 morningstars +12 melee (3d6+4),'
      + ' and bite +12 melee (2d8+4 plus poison)')).toEqual([
      { name: 'morningstar', count: 1, dice: '3d6', plus: 8, bonus: 12 },
      { name: 'morningstar', count: 1, dice: '3d6', plus: 8, bonus: 7 },
      { name: 'morningstars', count: 2, dice: '3d6', plus: 4, bonus: 12 },
      { name: 'bite', count: 1, dice: '2d8', plus: 4, bonus: 12 },
    ]);
    expect(monsters.monsters.harpy.attacks.map(a => [a.name, a.count, a.bonus])).toEqual([
      ['club', 1, 7], ['club', 1, 2], ['claws', 2, 2],
    ]);
    expect(monsters.monsters.athach.attacks.map(a => [a.name, a.count, a.bonus])).toEqual([
      ['morningstar', 1, 12], ['morningstar', 1, 7], ['morningstars', 2, 12], ['bite', 1, 12],
    ]);
  });
});
