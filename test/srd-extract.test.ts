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
});
