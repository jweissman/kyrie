import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Canon } from '../../src/canon/canon';
import { Content } from '../../src/content';

const dir = 'data/adventures/tallow/';
const setting = Content.settingWith(JSON.parse(readFileSync(`${dir}long-cell-tables.json`, 'utf8')),
  JSON.parse(readFileSync(`${dir}long-cell-templates.json`, 'utf8')));
type Draw = { facts: { name: string; args: string[] }[]; initial: { name: string; value: number }[];
  casting: { lc_cell: { raceId: string; classId: string; count: number } } };

describe('the Ferryman\'s cell, drawn', () => {
  it('draws each organization with compatible people and the food it carries', () => {
    const kinds = new Set<string>();
    const gnollKinds = new Set<string>();
    for (let i = 0; i < 80; i++) {
      const draw = new Content(`long-cell-${i}`, setting).generate('long_cell', {}) as unknown as Draw;
      const kind = draw.facts.find(f => f.name === 'lc_cell_kind')!.args[0]!;
      const cast = draw.casting.lc_cell;
      kinds.add(kind);
      if (cast.raceId === 'gnoll') { gnollKinds.add(kind); }
      expect(Canon.ancestries[cast.raceId]!.classes).toContain(cast.classId);
      expect(cast.count).toBe(kind === 'lc_marauders' ? 3 : 2);
      expect(draw.initial.find(f => f.name === 'quantity')!.value).toBe(kind === 'lc_marauders' ? 3 : 2);
    }
    expect([...kinds].sort()).toEqual(['lc_cult', 'lc_marauders', 'lc_musicians']);
    expect([...gnollKinds].sort()).toEqual(['lc_cult', 'lc_marauders', 'lc_musicians']);
  });
});
