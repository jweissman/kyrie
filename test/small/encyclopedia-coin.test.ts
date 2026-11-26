import { describe, expect, it } from 'bun:test';
import { CompanyChapters } from '../../src/handbook/phb-company';
import { Creation } from '../../web/engine/creation';
import { CatalogContext } from '../../src/item-catalog';

// OR-270: the encyclopedia's callings and lives say the coin a life is given, as creation and the purse do (OR-257).
// A calling's gold is paid to no one: the bard's entry had said "Gold 25", where a bard-inquisitor set out with 13
// coin, the weir's 6 and the inquisitor's 7. A trade's coin is its gold at a coin for every ten.
describe('the encyclopedia on coin', () => {
  it('says no gold of a calling', () => {
    const facts = CompanyChapters.callings(CatalogContext.canon).entries!
      .map(e => [e.id, e.facts!.map(([k]) => k)] as const);
    expect(facts.length).toBeGreaterThan(5);
    expect(facts.filter(([, k]) => k.includes('Gold')).map(([id]) => id)).toEqual([]);
  });
  it('says each trade\'s coin as the purse is paid it', () => {
    const coin = new Map(Creation.catalog().backgrounds.map(b => [`background:${b.id}`, String(b.coin)]));
    const tables = CompanyChapters.backgrounds(CatalogContext.canon).sections!.map(s => s.table!);
    for (const t of tables) { expect(t.head).toEqual(['Background', 'Qualities', 'Coin', 'For', 'Brings', 'Status']); }
    const said = tables.flatMap(t => t.rows.map((r, i) => [t.ids![i]!, r[2]!] as const)).filter(([id]) => coin.has(id));
    expect(said.length).toBe(coin.size);
    expect(said.filter(([id, c]) => coin.get(id) !== c)).toEqual([]);
    expect(said.find(([id]) => id === 'background:inquisitor')?.[1]).toBe('7');
  });
});
