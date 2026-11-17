import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// What makes a world, plays it and keeps it reads no locale (PR-04, the architecture review's H6: determinism had been
// asserted, not verified): two world-generation sorts had broken ties between ids by the locale's collation
// (Vantage.seen, KitWord.tellers), so one seed could draw otherwise on a machine set to another language. Ids are
// ordered by their code units; only the handbooks, the registry's reports and the page's words may sort for a reader.
describe('the engine', () => {
  it('orders nothing by the locale', () => {
    const src = join(import.meta.dir, '../../src');
    const engine = [...readdirSync(src).filter(f => f.endsWith('.ts')),
      ...['world', 'rules', 'campaign', 'session', 'lang', 'canon', 'narrative']
        .flatMap(d => readdirSync(join(src, d), { recursive: true }).map(f => join(d, String(f))))
        .filter(f => f.endsWith('.ts'))];
    const found = engine.filter(f => /\blocaleCompare\b|\bIntl\.|\.toLocale\w*\(/.test(readFileSync(join(src, f), 'utf8')));
    expect(engine.length).toBeGreaterThan(100);
    expect(found).toEqual([]);
  });
});
