import type { BundleSource } from '../campaign/bundle-source';
import type { BundleRequest } from '../campaign/module-bundle';
import type { Company, Region } from './region-writer';
import { KyrTemplates } from './kyr-template';
import { StrategicAtlas } from './strategic-atlas';

// A stock opening (BRIEF §3.1; the owner, 23 November: two rooms, one person, one ration, one fight, a small hazard,
// then the open world): a short situation a new life begins in, ahead of where its origin begins, chosen at creation
// (Drawn.opening), never by the world, so that a life or a kept play that never chose one begins as it always did.
// Its rooms are the region's, written as a town's way in is (RegionWriter, the company's start), so the life begins in
// one of them; what happens there is a module of its own (data/openings/<id>/opening.kyr) bound to them; and its last
// room's way leads to where the origin begins, which stays the start's place (the town the life belongs to). What the
// origin told in its first watches it tells, once the life has come up, by the opening's after-template
// (data/openings/<id>/after.kyrt, a section by the origin's id).
export interface OpeningManifest {
  id: string; title: string; source: string; after?: string; start: string;
  rooms: { id: string; name: string; under?: boolean; unlit?: boolean }[];
  exit: { from: string; way: string; minutes: number };
}
type Room = OpeningManifest['rooms'][number];
// The opening as the region writes it: its rooms (ids the region's own), the one the life begins in, and the way from
// the last of them to where the origin begins.
export interface Opened {
  settlement: string; start: string; to: string; rooms: Room[];
  exit: { id: string; from: string; way: string; minutes: number };
}
export interface StockOpening { manifest: OpeningManifest; source: string; after?: string }
type Start = NonNullable<Company['start']>;

export class StockOpenings {
  static readonly library = 'data/openings/library.json';
  // What a new life is begun in: the opening asked for by name; none, asked "none"; else, the opening its country
  // keeps for every new life there (the strategic atlas's, by the world's first country: Iscoed's adit). Creation
  // asks this for a new life (EngineStarts); a world drawn again for a kept play takes what it was drawn for, and one
  // that never chose an opening has none.
  static readonly none = 'none';
  static chosen(seed: string, asked?: string): string | undefined {
    if (asked) { return asked === this.none ? undefined : asked; }
    return StrategicAtlas.at(seed, 0, 0)?.opening;
  }
  static async load(base: BundleSource, id: string): Promise<StockOpening> {
    const index = base.resolve(this.library);
    const list = JSON.parse(await base.read(index)) as { openings: string[] };
    for (const file of list.openings) {
      const at = base.resolve(file, index), manifest = JSON.parse(await base.read(at)) as OpeningManifest;
      if (manifest.id !== id) { continue; }
      return { manifest, source: await base.read(base.resolve(manifest.source, at)),
        ...manifest.after ? { after: await base.read(base.resolve(manifest.after, at)) } : {} };
    }
    throw new Error(`No opening ${id} (${this.library})`);
  }
  // The opening written against this world, ahead of the start its origin gives: its module, and the start with the
  // opening in it (the life in its first room; the way out to where the origin begins).
  static write(o: StockOpening, at: { region: Region; start: Start; root: string; files: Record<string, string> })
    : { request: BundleRequest; start: Start } {
    const s = at.start.approach?.settlement ?? /^(s\d+)_/.exec(at.start.place)?.[1] ?? at.region.settlements[0]!.id;
    const town = at.region.settlements.find(x => x.id === s)?.name ?? '', m = o.manifest, dir = `${at.root}/opening`;
    const names = m.rooms.map(r => r.id);
    const opening: Opened = { settlement: s, start: this.own(s, m, m.start), to: at.start.place,
      rooms: m.rooms.map(r => ({ ...r, id: this.own(s, m, r.id), name: this.town(r.name, town) })),
      exit: { id: this.own(s, m, 'exit'), from: this.own(s, m, m.exit.from), way: this.town(m.exit.way, town),
        minutes: m.exit.minutes } };
    at.files[`${dir}/module.json`] = JSON.stringify({ version: 1, source: 'opening.kyr', rules: ['world'],
      globals: ['party'], imports: ['party', ...names],
      roles: Object.fromEntries([['party', { type: 'group' }], ...names.map(n => [n, { type: 'place' }])]) });
    at.files[`${dir}/opening.kyr`] = this.town(o.source, town);
    return { request: { id: m.id, bundle: `${dir}/module.json`,
      imports: { party: 'region.party', ...Object.fromEntries(names.map(n => [n, `region.${this.own(s, m, n)}`])) } },
    start: { ...at.start, opening } };
  }
  private static town(text: string, town: string): string { return text.replace(/\{town\}/g, town); }
  // A room's id in the region: the town's, the opening's and its own (s1_adit_fall).
  private static own(settlement: string, m: OpeningManifest, room: string): string { return `${settlement}_${m.id}_${room}`; }
  // What the origin tells in place of its first watches' lines, once the life has come up out of the opening.
  static after(o: StockOpening, origin: string, values: Record<string, string>): string[] {
    const sections = o.after ? KyrTemplates.parse(o.after).sections.filter(x => x.group === origin) : [];
    return KyrTemplates.fill(sections.flatMap(x => x.lines), values);
  }
  // Where the company is first: the opening's first room, where there is one; else where its origin begins.
  static place(start: Start): string { return start.opening?.start ?? start.place; }
  // The opening's rooms in the region's module: each within the town it opens above, those under the hill dark; the
  // way out of the last to where the origin begins; and its ids, for the module that is bound to them.
  static lines(o: Opened): string[] {
    const q = JSON.stringify;
    return [...o.rooms.map(r => `  Place ${r.id} ${q(r.name)} is room within ${o.settlement} `
      + `${r.under ? 'underground' : 'outdoors'}.`),
    ...o.rooms.filter(r => r.unlit).map(r => `  Initially Assert unlit(${r.id}).`),
    `  Passage ${o.exit.id} ${q(o.exit.way)} is road between ${o.exit.from} and ${o.to} taking ${o.exit.minutes} minutes.`];
  }
  static ids(o: Opened | undefined): string[] { return o ? [...o.rooms.map(r => r.id), o.exit.id] : []; }
}
