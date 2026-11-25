import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Glob } from 'bun';

// Kyr's one public entry (src/lang/index.ts; platform-separation.md, stage 1): code outside the language imports it
// there, so that the language's own files can move behind it into a package of their own. The deep imports into
// src/lang/ that stood on 24 November are counted here and only fall; each moved to the entry lowers the count, written
// back here. The parse store, node's file system, is the runtime's adapter, not the language's surface.
const kept = 1257;
class Deep {
  static count(): number {
    const roots = ['src/**/*.ts', 'web/**/*.{ts,tsx}', 'scripts/**/*.ts', 'test/**/*.ts', 'bin/**/*.ts'];
    let n = 0;
    for (const f of roots.flatMap(g => [...new Glob(g).scanSync('.')])) {
      if (f.startsWith('src/lang/')) { continue; }
      n += [...readFileSync(f, 'utf8').matchAll(/from '[^']*\/lang\/(?!index')[\w-]+'/g)].length;
    }
    return n;
  }
}
describe("Kyr's public entry", () => {
  const now = Deep.count();
  it('gains no deep import into the language', () => {
    expect(now).toBeLessThanOrEqual(kept);
  });
  it('keeps its count as it falls', () => {
    expect(kept).toBeLessThanOrEqual(now);
  });
});
