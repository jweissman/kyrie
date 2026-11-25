import type { DeemValue } from 'deem';
import type { BundleSource } from '../campaign/bundle-source';
import { Countries } from './countries';
import { PlaceNames } from './place-names';
import { Provinces } from './provinces';
import { RegionWriter, type Region } from './region-writer';
import { StrategicAtlas } from './strategic-atlas';
import { WorldAssembler, type Entry, type Placement, type WorldReport } from './world-assembler';

// A country's drawing (its land, peoples and names, the scenarios it holds and where each is placed) is the same for
// the same seed and the same ask, whoever comes into it and for whatever reason: so it is drawn once, and each world
// assembled from it is given a copy of its own (campaign isolation), the library it was drawn from shared, being only
// read. A new life had drawn its country twice: once for creation to say what it holds (who may begin there, and
// why), and again, the same, to set out into (the owner, 25 November: "It still takes way too long to start up a new
// world"). Kept for the source it was read from, the last few only. What comes into it (the company, an origin, an
// opening, its calendar) is the assembler's, after.
export interface Ask {
  library?: string; scenarios?: number; towns?: number; region?: Record<string, DeemValue>; standing?: string[];
  chain?: string;
}
export interface Drawing {
  region: Region; context: WorldReport['context']; eligibility: { fits: boolean; why?: string }[];
  placements: Placement[];
  // Read, never changed: shared by every copy.
  library: Entry[]; heralds: Entry[]; standing: Entry[];
}
type Own = Pick<Drawing, 'region' | 'context' | 'eligibility' | 'placements'>;
export class WorldDrawings {
  private static readonly kept = new WeakMap<BundleSource, Map<string, Promise<Drawing>>>();
  static readonly held = 4;
  static async of(seed: string, base: BundleSource, ask: Ask = {}): Promise<Drawing> {
    const kept = this.kept.get(base) ?? new Map<string, Promise<Drawing>>(), key = this.key(seed, ask);
    this.kept.set(base, kept);
    let drawing = kept.get(key);
    if (!drawing) {
      drawing = this.draw(seed, base, ask);
      kept.set(key, drawing);
      // One that failed is not kept: asked again, it is drawn again (and fails again, saying why).
      drawing.catch(() => { if (kept.get(key) === drawing) { kept.delete(key); } });
      for (const oldest of kept.keys()) { if (kept.size <= this.held) { break; } kept.delete(oldest); }
    }
    const { region, context, eligibility, placements, ...shared } = await drawing;
    return { ...structuredClone({ region, context, eligibility, placements } satisfies Own), ...shared };
  }
  // Every drawing let go, so that the next is drawn afresh (for the specs that compare the two).
  static forget(base: BundleSource): void { this.kept.delete(base); }
  private static key(seed: string, a: Ask): string {
    return JSON.stringify([seed, a.library ?? null, a.scenarios ?? null, a.towns ?? null, a.region ?? null,
      a.standing ?? null, a.chain ?? null]);
  }
  // Deem draws the region; the scenarios that fit it are chosen (a Deem select over the library) and placed.
  private static async draw(seed: string, base: BundleSource, ask: Ask): Promise<Drawing> {
    const region = WorldAssembler.region(seed, [0, 0], ask.region);
    region.further = Countries.further(region, seed); region.chain = ask.chain;
    const library = await WorldAssembler.library(base, ask.library ?? 'data/scenarios/library.json');
    const heralds = await WorldAssembler.heralds(base, region, seed);
    const standing = (await WorldAssembler.library(base, WorldAssembler.standing))
      .filter(e => (ask.standing ?? StrategicAtlas.standing(region) ?? [e.manifest.id]).includes(e.manifest.id));
    const { context, eligibility, placements } = WorldAssembler.settle(region, library, { seed, rid: RegionWriter.id,
      heralds, standing, ...StrategicAtlas.settling(region, ask) });
    // The country's provinces: its authored adventures that are parts of it, each with a way in on its land (a
    // harbour's at the head of a firth from the sea, let in then).
    region.provinces = await Provinces.regions(Provinces.flood(region, Provinces.situate(region)), base);
    // Its old places called by their Common meaning, their old names to be learned (see OldPlaces).
    region.sites = PlaceNames.called(region);
    return { region, context, eligibility, placements, library, heralds, standing };
  }
}
