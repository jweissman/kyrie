import tongues from 'languages';
import { Expressions } from '../expressions';
import { GenerationSetting } from '../generation-setting';
import { RegionLand, type Landmark } from './region-land';
import type { Naming } from './land/land-names';
import type { Region, Site } from './region-writer';

interface Named { name: string; feature?: string; affix?: string; gloss?: string; tongue?: string }
// What a name must stand apart from: the names already given in the region, and the meanings already said by places of
// its kind; and where another can be drawn from.
interface Distinction {
  taken: string[]; parts: Set<string>; rng: Expressions; features: string[]; affixes: string[];
  english: (f: string, a: string) => string; kind?: string;
}
interface Tables {
  placeFeature: { groups: Record<string, string[]> }; placeAffix: { groups: Record<string, string[]> };
  siteNoun: { groups: Record<string, string[]> };
}
// Generated places named in the tongue of the folk who live there. Deem chooses what a name means (a feature and an
// affix from the region's tables: "cold" and "hill"); the region's language says it ("Chealdholm", in Westron), and
// the place keeps the meaning so a description can tell it. A name whose parts the language lacks stays as Deem said.
// No two places in a region are named so alike that a traveller could take one for the other: a settlement whose name
// would echo one already given takes the next of its terrain's features and affixes that does not. The region's land
// (its river, lake, peak, pass and wood) is named the same way. Ruins, barrows and towers were there before the folk,
// and are named in Aenean, the old tongue.
export class PlaceNames {
  static readonly tongues: Record<string, string> = { human: 'westron', elf: 'quenya', dwarf: 'khuzdul' };
  // What was built before the folk came (a ruin, a barrow, a tower) keeps its name in the old tongue.
  static readonly old = ['ruin', 'barrow', 'tower'];
  static render(region: Region, seed = region.name): Region {
    const tongue = this.tongues[region.ancestry] ?? 'westron', rng = new Expressions(`${seed}:names`);
    const tables = GenerationSetting.tables as unknown as Tables;
    const features = tables.placeFeature.groups[region.terrain] ?? [];
    const affixes = tables.placeAffix.groups[region.terrain] ?? [];
    const named = { ...region, ...this.named(region, tongue) }, parts = new Set<string>();
    const taken = [named.name, ...this.landmarks(region).map(l => l.name)];
    // A settlement is named in its own folk's tongue: a dwarf hold in human country has a Khuzdul name.
    const settlements = region.settlements.map(s => ({ ...s, ...this.distinct(s, this.tongues[s.folk ?? ''] ?? tongue,
      { taken, parts, rng, features, affixes, english: this.joined }) }));
    // A work keeps the name the folk wore it down to (see Histories); any other site is named here.
    taken.push(...region.sites.filter(s => s.work).map(s => s.name));
    const sites = region.sites.map(s => s.work ? s : this.site(s, { region: named, tongue, taken, parts, rng }));
    return { ...named, settlements, sites, land: region.atlas ? this.landmarks(region)
      : RegionLand.shape(region.terrain, tongue, `${seed}:land`, taken) };
  }
  // The land a region is known by, from its atlas: its great river and lake, its largest wood, the pass its roads
  // climb, its highest peak.
  static landmarks(region: Region): Landmark[] {
    const atlas = region.atlas;
    if (!atlas) { return []; }
    const wood = atlas.zones.find(z => z.wild === 'wood'), pass = atlas.ways.find(w => w.over)?.over;
    const peak = atlas.zones.find(z => z.peak)?.peak?.naming;
    const found: [Landmark['form'], Naming | undefined][] = [['river', atlas.rivers[0]?.naming],
      ['lake', atlas.lakes[0]?.naming], ['wood', wood?.naming], ['pass', pass], ['peak', peak]];
    return found.filter((f): f is [Landmark['form'], Naming] => !!f[1])
      .map(([form, n]) => ({ id: form, form, name: n.name, gloss: n.gloss, tongue: n.tongue, modifier: n.modifier }));
  }
  // A site named after the region was: one a scenario asked for, kept as distinct as the rest.
  static another(region: Region, site: Site, seed: string): Site {
    const taken = [region.name, ...region.settlements.map(s => s.name), ...region.sites.map(s => s.name),
      ...(region.land ?? []).map(l => l.name)];
    const parts = new Set(region.sites.flatMap(s => [`site:${s.affix}`, `site:of:${s.feature}`]));
    return this.site(site, { region, tongue: this.tongues[region.ancestry] ?? 'westron', taken, parts,
      rng: new Expressions(`${seed}:names`) });
  }
  private static site(s: Site, at: { region: Region; tongue: string; taken: string[]; parts: Set<string>;
    rng: Expressions }): Site {
    const tables = GenerationSetting.tables as unknown as Tables;
    return { ...s, ...this.distinct(s, this.old.includes(s.kind) ? 'aenean' : at.tongue, { ...at,
      features: tables.placeFeature.groups[at.region.terrain] ?? [], affixes: tables.siteNoun.groups[s.kind] ?? [],
      english: this.spaced, kind: s.kind }) };
  }
  // How Deem says a name the folk's tongue cannot: "Coldhill" for a settlement, "Cold Barrow" for a site.
  private static joined(f: string, a: string): string { return `${f[0]!.toUpperCase()}${f.slice(1)}${a}`; }
  private static spaced(f: string, a: string): string {
    return `${f[0]!.toUpperCase()}${f.slice(1)} ${a[0]!.toUpperCase()}${a.slice(1)}`;
  }
  // A place's own name if nothing named before it could be taken for it and it says nothing another settlement (or
  // site) already says: no two "dales", no two "Wet" anythings. Else the first of its terrain's other features and
  // affixes that does neither, in the folk's tongue when it has the words and as Deem would say it when not.
  private static distinct<T extends Named>(place: T, tongue: string, at: Distinction): Partial<Named> {
    const own = { ...place, ...this.named(place, tongue) }, prefix = at.kind ? 'site:' : '';
    const chosen = this.free(own, at) ? own : RegionLand.order(at.features, at.rng)
      .flatMap(f => RegionLand.order(at.affixes, at.rng).map(a => ({ feature: f, affix: a })))
      .map(c => ({ ...c, name: at.english(c.feature, c.affix), ...this.named(c, tongue) }))
      .find(c => this.free(c, at)) ?? own;
    at.taken.push(chosen.name!);
    at.parts.add(`${prefix}${chosen.affix}`).add(`${prefix}of:${chosen.feature}`);
    const { name, feature, affix, gloss, tongue: said } = chosen;
    return { name, feature, affix, ...gloss ? { gloss, tongue: said } : {} };
  }
  private static free(c: Partial<Named>, at: Distinction): boolean {
    const prefix = at.kind ? 'site:' : '';
    return !!c.name && at.taken.every(t => !RegionLand.confusable(c.name!, t))
      && !at.parts.has(`${prefix}${c.affix}`) && !at.parts.has(`${prefix}of:${c.feature}`);
  }
  private static named(place: { feature?: string; affix?: string }, tongue: string): Partial<Named> {
    // A part drawn twice ("fen" and "fen") is said once.
    const parts = [...new Set([place.feature, place.affix])];
    if (parts.some(p => !p)) { return {}; }
    const dictionary = tongues.getDictionary(tongue);
    try {
      return { name: dictionary.translate(...parts as Parameters<typeof dictionary.translate>).trim(),
        gloss: parts.join(' '), tongue: dictionary.name, feature: parts[0], affix: parts.at(-1) };
    } catch { return {}; }
  }
}
