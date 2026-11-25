import { describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import { KnowledgeDoor } from '../../scripts/knowledge-door';

// The knowledge boundary has one door (OR-527; the trust thread, platform-separation.md): only the projector reads
// the authoritative world for what the company knows and perceives, and the player layer reads what it gives. Every
// other read of the world from the presentation, the screen's model, the terminal's client parts and the page is
// counted by file and kind; each count may only fall, and a fall is written back (`bun scripts/knowledge-door.ts
// --write`) so that the count holds the gain. The projector's parts and the diagnostic tools are named in the
// manifest, each with why, and the calls through which the projection crosses are listed beside it.
describe('the world read outside the knowledge boundary\'s one door', () => {
  const kept = KnowledgeDoor.read(), now = KnowledgeDoor.count('.', kept.manifest);
  const grown = (f: string, k: string, n: number) => n > ((kept.counts[f] ?? {}) as Record<string, number>)[k]!;
  it('gains no read', () => {
    expect(Object.entries(now).flatMap(([f, c]) => Object.entries(c)
      .filter(([k, n]) => !(kept.counts[f] && k in kept.counts[f]) || grown(f, k, n))
      .map(([k, n]) => `${f} ${k}: ${n} (was ${(kept.counts[f] as Record<string, number> | undefined)?.[k] ?? 0})`)))
      .toEqual([]);
  });
  it('keeps no count above what is read, where reads fell', () => {
    expect(Object.entries(kept.counts).flatMap(([f, c]) => Object.entries(c)
      .filter(([k, n]) => ((now[f] ?? {}) as Record<string, number>)[k] !== n).map(([k]) => `${f} ${k}`))).toEqual([]);
  });
  it('names only files there are in its manifest, each with why, and the calls the projection crosses by', () => {
    expect(Object.entries(kept.manifest).filter(([f, why]) => !existsSync(f) || !why.trim()).map(([f]) => f))
      .toEqual([]);
    expect(kept.crossing.length).toBeGreaterThan(0);
  });
});
