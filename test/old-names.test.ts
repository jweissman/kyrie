import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { RegionWriter } from '../src/world/region-writer';
import { OldPlaces } from '../src/world/old-places';

// Common names first (T24-20, OPR-06, the lead's decision on the owner's word): in the starting country an old place
// (a makers' work, a ruin, barrow or tower built before the folk) is called by its name in Common, made from what its
// old name means by the languages library's Common dictionary as the towns' names are (Moonwatch), and its old name
// is learned by reading it where it is cut, on the place itself. A census over ten countries, as the starting country
// is written: no line tells an old name but the ones that teach it there, and every old name can be learned there.
const seeds = ['a1', 'b2', 'kite', 'ash', 'wren', 'mere', 'thorn', 'cov2', 'cov7', 'd4'];
const written = (seed: string) => {
  const region = WorldAssembler.region(seed, [0, 0]);
  region.sites = OldPlaces.called(region);
  return { region, lines: Object.values(RegionWriter.files(region, { size: 1, contacts: [] })).join('\n').split('\n') };
};
describe('old places in the starting country', () => {
  it.each(seeds)('%s: every one called by its name in Common, its old name told only where it is learned', seed => {
    const { region, lines } = written(seed);
    const old = region.sites.filter(s => OldPlaces.old(s) || s.old);
    expect(old.length).toBeGreaterThan(0);
    for (const site of old) {
      // Called first by its name in Common, as a town would be; the Place is written so.
      const common = OldPlaces.common({ ...site, name: site.old! })!;
      expect([site.id, site.old, site.name]).toEqual([site.id, expect.any(String), common]);
      expect(site.name).toMatch(/^[A-Z][a-z]+( [A-Z][a-z]+)?$/);
      expect(lines.some(l => l.startsWith(`  Place ${site.id} "${site.name}"`))).toBe(true);
      // Told nowhere else than where it is learned.
      const telling = lines.filter(l => l.includes(site.old!));
      expect(telling.filter(l => !new RegExp(`\\b${site.id}_(old|old_cut|old_known|letters)\\b`).test(l))).toEqual([]);
      // Learnable at the place: something there teaches it.
      expect(lines.some(l => new RegExp(`Observe ${site.id}_(old_cut|letters) at ${site.id} .* teaches ${site.id}_old\\.$`)
        .test(l))).toBe(true);
    }
  });
});
