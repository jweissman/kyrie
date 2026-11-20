import { describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Features, SECTIONS } from '../capstones/features';
import { Probes } from '../capstones/probes';
import { Tiny } from '../support/tiny';

// The capstone map (the owner, 15 November): the table of features a mature platform has, held as a ratchet. The
// table is the owner's whole (51 features, six sections); every proof named is a spec that exists; every probe
// observes what the claim says (a present claim is executable, and an absent one fails when the feature arrives, to
// be promoted); each probe is cheap. Not a verdict on quality: see doc/architecture/mission-21/capstones-brief.md.
describe('the capstone map', () => {
  const root = join(import.meta.dir, '..', '..');
  it('holds the whole table, by section', () => {
    expect(Features.all).toHaveLength(51);
    expect(SECTIONS).toHaveLength(6);
    expect([1, 2, 3, 4, 5, 6].map(s => Features.all.filter(f => f.section === s).length)).toEqual([11, 8, 6, 7, 10, 9]);
    expect(new Set(Features.all.map(f => f.id)).size).toBe(51);
  });
  it('names a gap for everything not present, and a proof for everything present', () => {
    for (const f of Features.all) {
      if (f.claim !== 'present') { expect(f.gap, f.id).toBeTruthy(); }
      if (f.claim === 'present') { expect(f.proof.length, f.id).toBeGreaterThan(0); }
      for (const p of f.proof) { expect(existsSync(join(root, p)), `${f.id}: ${p}`).toBe(true); }
    }
  });
  it('is observed by a probe that agrees with each claim, cheaply', async () => {
    // The process's first world parses the shared rules once (main's CI, 19 November: the first probe, scene, at
    // 2044 ms on a runner); that is no probe's own cost, so it is paid before the probes are timed.
    // The first probe once untimed (its world reads a thing, a discovery and a search, which the barest world does not:
    // scene still took 3.4 s on a runner after that, 20 November); and a runner's own budget, as test/act-budget's.
    await Tiny.start('Place hall "the hall" is room at 0, 0 indoors.\n  Company party "You" of 1 at hall.\n  Goal false.');
    await Probes.by.scene!();
    const off: string[] = [];
    let total = 0;
    for (const f of Features.all) {
      const probe = Probes.by[f.id];
      if (!probe) { continue; }
      const began = performance.now(), seen = await probe(), ms = performance.now() - began;
      total += ms;
      if (seen.status !== f.claim) { off.push(`${f.id}: claimed ${f.claim}, observed ${seen.status} (${seen.evidence})`); }
      expect(ms, f.id).toBeLessThan(process.env.CI ? 4000 : 2000);
    }
    expect(off).toEqual([]);
    expect(total).toBeLessThan(8000);
  });
  it('has a probe for every feature (a static fact of the data and the page where a world is not needed)', () => {
    expect(Features.all.filter(f => !Probes.by[f.id]).map(f => f.id)).toEqual([]);
  });
});
