import { describe, expect, it } from 'bun:test';
import { Promotion, type Candidate, type Situation } from '../../src/ui/promotion';
import type { Why } from '../../src/presentation/glance-types';

// A way led with for another reason bears whoever is perceived along it (the owner's playtest, 19 November, night,
// AT-04: a way in Explore that said only "By the door", a companion there, and no companion on its row), though a
// companion is never its reason to lead (the scene's four keep what is here).
const calm: Situation = { threat: false, warned: false, dark: false, settled: true, open: false };
const made = (choice: string, whys: Why[], extra: Partial<Candidate> = {}): Candidate =>
  ({ choice, label: choice, kind: 'act', whys, order: 0, marks: [], subject: choice, ...extra });

describe('a way led with in the four', () => {
  it('bears the companion perceived along it, led for its own reason', () => {
    const picked = Promotion.pick([made('door', ['unlooked', 'companion'], { kind: 'way' })], calm);
    expect(picked.map(p => [p.choice, p.why])).toEqual([['door', 'unlooked']]);
    expect(picked[0]!.aspects).toContain('companionship');
  });
});
