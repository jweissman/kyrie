import { describe, expect, it } from 'bun:test';
import { Glob } from 'bun';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// One commit path for a row (OR-128): a row is taken by its own press or hold, the keys too (ReaderKeys.commit presses
// the row's own button, or holds it), and the page's handlers of its own are counted, so that they only fall: 93 on 20
// November (91 at the row's count, 124 at its writing). Lower it as handlers are folded into the rows' own press.
describe('the page\'s click handlers', () => {
  it('are no more than they were', () => {
    const root = join(import.meta.dir, '../..');
    const files = [...new Glob('web/reader/**/*.{ts,tsx}').scanSync(root)];
    const count = files.reduce((n, f) => n + (readFileSync(join(root, f), 'utf8').match(/onClick/g) ?? []).length, 0);
    expect(count).toBeLessThanOrEqual(93);
    expect(count).toBeGreaterThan(0);
  });
});
