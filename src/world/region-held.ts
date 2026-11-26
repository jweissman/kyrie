import type { BundleSource } from '../campaign/bundle-source';
import { Composition, type Composed, type ManifestEntry } from './compose/composition';
import { RegionRumours } from './region-rumours';
import type { Region } from './region-writer';
import type { VocabularyContext } from '../lang';

// What the kits' placements have made their own of the sites an inn's count tells of, and what the count says of
// each (FH-24: an inn had named the hobs' hold as an old place, and no more, its count written with the country before
// the kits were placed). The kits are placed here as the campaign places them when it loads: against the country as
// written, with the same seed, so on the same ledger the same places; the count is written after (WorldAssembler),
// and the campaign loads with this composition (Composition.keep).
export class RegionHeld {
  static async of(region: Region, listed: ManifestEntry[],
    at: { seed: string; path: string; source: BundleSource; vocabulary: VocabularyContext }):
    Promise<{ told: Record<string, string>; composed?: Composed }> {
    if (!listed.some(e => Composition.isKit(e))) { return { told: {} }; }
    // Read as the campaign's manifest is read (ModuleBundle.campaign): each path from the manifest's own.
    const { seed, path, source, vocabulary } = at, entries = listed.map(m => Composition.isKit(m) ? m
      : { ...m, bundle: source.resolve(m.bundle, path) });
    const counted = RegionRumours.counted(region), told: Record<string, string> = {};
    const composed = await Composition.expand(entries, { seed, source, vocabulary });
    for (const p of composed.placements) {
      const site = p.told?.place.replace(/^.*__/, '');
      if (site && counted.has(site)) { told[site] = p.told!.says; }
    }
    return { told, composed };
  }
}
