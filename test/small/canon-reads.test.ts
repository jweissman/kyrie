import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { CanonReads } from '../../scripts/canon-reads';

// The runtime and the player reach for Canon directly (platform-separation.md, the root blocker): each layer's reads
// of each of its members may only fall, each moved to the owner it is classed for, and a fall is written back
// (`bun scripts/canon-reads.ts --write`) so that the count holds the gain.
describe('direct reads of Canon outside the setting', () => {
  const kept = (JSON.parse(readFileSync(CanonReads.file, 'utf8')) as { counts: Record<string, number> }).counts;
  const now = CanonReads.count();
  it('gain none', () => {
    expect(Object.entries(now).filter(([k, n]) => n > (kept[k] ?? 0)).map(([k, n]) => `${k}: ${n} (was ${kept[k] ?? 0})`))
      .toEqual([]);
  });
  it('keep no count above what is read, where reads fell', () => {
    expect(Object.entries(kept).filter(([k, n]) => (now[k] ?? 0) < n).map(([k]) => k)).toEqual([]);
  });
});
