import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { FrameMarks } from '../../scripts/frame-marks';

// Every mark a client draws is a node of the engine's frame, read as it is (the owner, 26 November: "scanning one
// tree", OR-1071): each place a client (the page, the terminal, the runner) composes one from its own inputs is a
// parallel derivation. Each file's count may only fall, and a fall is written back (`bun scripts/frame-marks.ts
// --write`) so that the count holds the gain.
describe('the marks a client derives for itself', () => {
  const kept = (JSON.parse(readFileSync(FrameMarks.file, 'utf8')) as { counts: Record<string, number> }).counts;
  const now = FrameMarks.count();
  it('gain none', () => {
    expect(Object.entries(now).filter(([f, n]) => n > (kept[f] ?? 0)).map(([f, n]) => `${f}: ${n} (was ${kept[f] ?? 0})`))
      .toEqual([]);
  });
  it('keep no count above what is derived, where derivations fell', () => {
    expect(Object.entries(kept).filter(([f, n]) => (now[f] ?? 0) < n).map(([f]) => f)).toEqual([]);
  });
});
