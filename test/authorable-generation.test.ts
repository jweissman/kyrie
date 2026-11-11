import { describe, expect, it } from 'bun:test';
import { KyrTemplates } from '../src/world/kyr-template';
import { Histories } from '../src/world/history/histories';
import { RegionWorks } from '../src/world/region-works';

// Two things that were TypeScript and are now the author's, with their meaning kept: how many works of a plan a
// country holds (a table in histories.ts, now `@count` in each plan's own header), and whether a section of a Kyr
// template is written at all (a filter in region-outskirts.ts, now `if` / `unless` in the template).
describe('what an author can now say in a plan or a template', () => {
  it('keeps the counts the table held: the plans say them', () => {
    expect(RegionWorks.texts.length).toBeGreaterThan(10);
    const held = { cistern: 2, galleries: 2, watchtower: 3, barrow: 3, singing_hall: 2, keep: 2 };
    for (const [id, n] of Object.entries(held)) { expect(Histories.plan(id).count).toBe(n); }
    for (const id of ['abbey', 'tollhouse', 'roadstation']) { expect(Histories.plan(id).count ?? 1).toBe(1); }
  });
  it('writes a template section only for the places whose values meet its condition', () => {
    const t = KyrTemplates.parse(['# t: a test', '--- base', '  A.', '--- road station 1 if station', '  B.',
      '--- sign plain 1 unless station', '  C.'].join('\n'));
    const written = (values: Record<string, string>) => KyrTemplates.choose(t, 'k', values).flatMap(s => s.lines.map(l => l.trim()));
    expect(written({})).toEqual(['A.', 'C.']);
    expect(written({ station: 'e1' })).toEqual(['A.', 'B.']);
    expect(KyrTemplates.choose(t, 'k').map(s => s.group)).toEqual(['base', 'sign']);
  });
});
