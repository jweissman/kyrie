import { describe, expect, it } from 'bun:test';
import { RegionFaith, type Cult } from '../../src/world/region-faith';
import type { Settlement } from '../../src/world/region-writer';

// A shrine is named by what its first sentence shows (DN-06, the owner on a1's shrine: "A well-head with a carved lip
// … : the well-kept fountain of Nodens"). Each seat is tagged with what it is called, [water|well-head]; the frame and
// the thing take that name, never Orsino's form word, so the two sentences cannot disagree.
class Seats {
  static readonly all = Object.entries(RegionFaith.tables.shrineSeat.groups)
    .flatMap(([form, rows]) => rows.map(row => ({ form, row })));
  static called(row: string): string | undefined { return /^\[\w+\|([^\]]+)\]/.exec(row)?.[1]; }
  // The forms, every name a seat is called, and the things a seat may be that a wrong tag would hide.
  static readonly nouns = [...new Set([...this.all.map(s => s.form), ...this.all.flatMap(s => this.called(s.row) ?? []),
    'well-head', 'spring', 'figure', 'pillar', 'standing stone'])];
}
describe('a shrine\'s name', () => {
  it('is what its seat shows, and the seat names no other shrine', () => {
    for (const { row } of Seats.all) {
      const called = Seats.called(row) ?? '', text = row.replace(/^\[[^\]]+\]/, '');
      expect(called, row).not.toBe('');
      const others = Seats.nouns.filter(n => !called.includes(n) && new RegExp(`\\b${n}\\b`).test(text));
      expect(others, row).toEqual([]);
    }
  });
  it('is the name the telling and the thing are given', () => {
    const s = { id: 's1', name: 'Lowmouth', trade: 'salt' } as Settlement;
    const cult: Cult = { deity: 'nodens', name: 'Nodens', domain: 'nature', title: 'Lord of Nature', form: 'fountain',
      called: 'well-head', look: 'well-kept', seat: 'a well-head with a carved lip, the water close under it',
      practice: 'A wreath of ivy hangs on it, cut fresh at each new moon.', history: '', offering: 2 };
    const lines = RegionFaith.lines(s, cult).join('\n');
    expect(lines).toContain('"the well-head of Nodens"');
    expect(lines).toContain('A well-head with a carved lip, the water close under it: the well-head of Nodens, Lord of');
    expect(lines).not.toContain('fountain');
  });
});
