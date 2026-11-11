import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

// A country beyond a march is come into at its entry, which is one of what its bundle exports: the vale of the Brimble
// named the place itself (east_road), not the export (road), and setting out for it from the map failed with
// "Unresolved module import there: psallowfield.east_road" (Mission 20's route check, 11 November).
describe('each country beyond', () => {
  it('is entered by one of what its bundle exports', () => {
    const json = (p: string) => JSON.parse(readFileSync(p, 'utf8')) as Record<string, unknown>;
    const countries = json('data/adventures/countries.json') as unknown as { countries?: { id: string; province?: boolean;
      bundle: string; entry?: string }[] };
    const wrong = (countries.countries ?? []).filter(c => c.province).filter(c =>
      !Object.keys((json(`data/adventures/${c.bundle}`).exports ?? {}) as Record<string, string>).includes(c.entry ?? ''));
    expect(wrong.map(c => `${c.id}: ${c.entry}`)).toEqual([]);
  });
});
