import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { OrsinoRegistry } from '../src/registry/orsino-registry';
import { CatalogLedger } from '../src/registry/catalog-ledger';
import { OrsinoInventory } from '../src/registry/orsino-inventory';
import { OrsinoInventoryReport } from '../src/registry/orsino-inventory-report';

// Every entry of Orsino's corpus has a place in the inventory: where its family goes in Kyr, and its own status read
// off what Kyr has and draws. Nothing is integrated without a destination that exists; nothing short of integrated is
// without its blocker; and the committed inventory is the one the code computes.
class Inventoried {
  static registry() {
    return new OrsinoRegistry(JSON.parse(readFileSync('data/sources/orsino/registry.json', 'utf8')),
      CatalogLedger.combined(JSON.parse(readFileSync('data/sources/orsino/adaptations.json', 'utf8'))));
  }
  // The files a destination names: data/…, src/…, test/… paths, without anchors.
  static paths(text: string): string[] {
    return [...text.matchAll(/\b((?:data|src|test|doc)\/[\w./-]+?)(?=[#\s,;)]|$)/g)].map(m => m[1]!.replace(/[.,]$/, ''));
  }
}

describe('the Orsino inventory', () => {
  const registry = Inventoried.registry(), inventory = new OrsinoInventory(registry).build();

  it('decides every family of the corpus, and no family it does not have', () => {
    expect(Object.keys(OrsinoInventory.families).sort()).toEqual(Object.keys(registry.snapshot.families).sort());
    expect(inventory.entries.length).toBe(registry.snapshot.entries.length);
  });

  it('names destinations and tests that exist, for every family any of whose entries is met in play', () => {
    for (const [name, f] of Object.entries(inventory.families).filter(([, x]) => x.counts.integrated > 0)) {
      const where = Inventoried.paths(f.destination);
      expect({ name, where: where.length }).not.toEqual({ name, where: 0 });
      for (const path of [...where, ...f.tests]) {
        expect({ name, path, exists: existsSync(path) }).toEqual({ name, path, exists: true });
      }
      expect({ name, tests: f.tests.length > 0 }).toEqual({ name, tests: true });
    }
  });

  it('gives every entry not met in play its blocker', () => {
    for (const e of inventory.entries.filter(x => x.status !== 'integrated')) {
      const given = (e.blockers ?? []).filter(Boolean).length > 0;
      expect({ id: e.id, given }).toEqual({ id: e.id, given: true });
    }
  });

  it('is committed as computed', () => {
    expect(JSON.parse(readFileSync('data/sources/orsino/inventory.json', 'utf8'))).toEqual(JSON.parse(JSON.stringify(inventory)));
    expect(readFileSync('doc/architecture/orsino-inventory.md', 'utf8')).toBe(OrsinoInventoryReport.render(inventory));
  });
});
