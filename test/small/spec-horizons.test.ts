import { describe, expect, it } from 'bun:test';
import { SpecHorizons } from '../../scripts/spec-horizons';

// The specs by horizon, held toward the cheapest (OR-407; the owner, 24 November: "just testing a tiny rule doesn't
// pull in the universe"): by the dearest thing each spec file starts (scripts/spec-horizons.ts: none, a tiny world on a
// declared horizon, one on the whole of the shared rules, one world, the corpus). A fragment declares its horizon
// (Tiny.start(kyr, { horizon: [...] }): the kernel and the packages it is proved among); the specs on a horizon only
// rise, and the tiny worlds on the whole shared rules only fall, each count written back here as it moves.
// 27 November, the first readings: of 1,823 spec files, 440 start no world, 14 a tiny world on a horizon, 234 one on
// the whole shared rules, 444 one world, 691 the corpus.
// 14 → 16 on rebasing onto main: the way on (the kernel) and rest within reach (probing) put on their horizons.
// 16 → 20: the gamma probes, each file on the kernel and the packages its probes read.
// 20 → 21: the chart kept without where the company stands, on the kernel.
// 21 → 23: the grounded questions and the character within reach, on the kernel.
// 23 → 24, 234 → 233: the knowledge indicator's wagoner on the kernel (PR #25), over main.
// 24 → 85: Copilot's 51 narrowings of 28 November (PRs #19 to #70), batched; 233 → 179 on the whole rules.
// 85 → 86 over the stack: the deep renewed on its horizon (inhabitants, probing).
// 86 → 95: Copilot's further narrowings of 28 November (PRs #71 to #88), batched; 179 → 176 on the whole rules.
// 95 → 97: If in consequences, its spec and pin on the kernel.
const kept = { horizon: 97, rules: 176 };
describe('the specs by horizon', () => {
  const now = SpecHorizons.census();
  it('moves no spec off its horizon, and starts no new tiny world on the whole of the shared rules', () => {
    expect(now.horizon).toBeGreaterThanOrEqual(kept.horizon);
    expect(now.rules).toBeLessThanOrEqual(kept.rules);
  });
  it('keeps its counts as they move toward the cheapest', () => {
    expect(kept.horizon).toBeGreaterThanOrEqual(now.horizon);
    expect(kept.rules).toBeLessThanOrEqual(now.rules);
  });
});
