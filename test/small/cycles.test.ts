import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Cycles } from '../../scripts/cycles';

// The folders' dependency cycles held (MT-29 (c), the architectural review's Stage 0): today's value imports within a
// cycle are the baseline; a new one fails here, and so does one gone that the baseline still lists, so that the count
// only falls, each time on purpose (`bun scripts/cycles.ts --write` after removing one, named in the commit).
describe('the folders\' cycles', () => {
  const kept = JSON.parse(readFileSync(join(Cycles.root, Cycles.baseline), 'utf8')) as { edges: string[] };
  const now = Cycles.edges();
  it('gain no import within a cycle', () => { expect(now.filter(e => !kept.edges.includes(e))).toEqual([]); });
  it('keep no edge in the baseline that is gone', () => { expect(kept.edges.filter(e => !now.includes(e))).toEqual([]); });
  it('join folders by value imports only, and count an edge only where the folders reach each other', () => {
    const imports = ['src/a/x.ts -> src/b/y', 'src/b/y.ts -> src/a/z', 'src/c/w.ts -> src/a/x'];
    expect(Cycles.edges(imports)).toEqual(imports.slice(0, 2));
    expect(['src/ui/scene.ts', 'src/battle.ts', 'web/engine/engine-host.ts'].map(p => Cycles.unit(p)))
      .toEqual(['src/ui', 'src', 'web/engine']);
  });
});
