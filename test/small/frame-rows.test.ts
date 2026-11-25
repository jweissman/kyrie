import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { FrameRows } from '../../scripts/frame-rows';

// The player's rows are asked for once per player revision, by the frame, and read from it (the trust thread,
// platform-separation.md): every other place that asks PlayerView.choices for itself derives its own meaning from
// them. Each file's asks may only fall, and a fall is written back (`bun scripts/frame-rows.ts --write`) so that the
// count holds the gain.
describe('the player\'s rows asked outside the frame', () => {
  const kept = (JSON.parse(readFileSync(FrameRows.file, 'utf8')) as { counts: Record<string, number> }).counts;
  const now = FrameRows.count();
  it('gain none', () => {
    expect(Object.entries(now).filter(([f, n]) => n > (kept[f] ?? 0)).map(([f, n]) => `${f}: ${n} (was ${kept[f] ?? 0})`))
      .toEqual([]);
  });
  it('keep no count above what is asked, where asks fell', () => {
    expect(Object.entries(kept).filter(([f, n]) => (now[f] ?? 0) < n).map(([f]) => f)).toEqual([]);
  });
});
