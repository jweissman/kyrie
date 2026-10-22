import { Expressions } from '../expressions';
import { GenerationSetting } from '../generation-setting';
import type { Region, Site } from './region-writer';

export interface Beast { species: string; count: number; label: string; role: string; nature: string }
interface Row { _key: string; __weight?: number }
interface Tables {
  denBeast: { groups: Record<string, (Row & Omit<Beast, 'species'>)[]> };
  wildSign: { groups: Record<string, (Row & { text: string })[]> };
}

// What lives where in a generated region (ecology.json). Each place is some kind of country: a site by what it is
// (a cave, a barrow, a ruin), a road by the land it crosses (a river, a wood, a pass), anything else by the region's
// terrain. A den in a kind of country holds what makes dens there, the same beast for the same country throughout a
// region, so a region has its wolves or its ghouls; and a traveller sees the animals of each place as they pass.
// The dens follow Orsino's monsterHome (fey in forests, the undead in crypts and ruins, giants and dragons in
// mountains and caves, beasts in the wilderness), with Kyr's own beasts where Orsino's companion animals are too small
// to keep a den; the signs are Orsino's animals. A row's nature says how its beast can be dealt with besides a fight:
// smoked out (wild), laid to rest (unquiet), or neither (stubborn).
export class RegionEcology {
  static readonly terrain: Record<string, string> = { forest: 'wood', marsh: 'fen', mountain: 'fells', frost: 'snow' };
  static readonly sites: Record<string, string> = { cave: 'cave', mine: 'cave', sinkhole: 'cave', barrow: 'barrow',
    ruin: 'ruin', grove: 'grove', bog: 'fen' };
  static readonly forms: Record<string, string> = { river: 'river', lake: 'lake', wood: 'wood', pass: 'heights',
    peak: 'heights' };
  static get tables(): Tables { return GenerationSetting.tables as unknown as Tables; }
  static country(region: Region): string { return this.terrain[region.terrain] ?? 'fells'; }
  // The kind of country a site stands in: what it is, or the region's own when that says nothing (a tower).
  static habitat(region: Region, site: Site, form?: string): string {
    return (form && this.forms[form]) ?? this.sites[site.kind] ?? this.country(region);
  }
  // What has made its den at a site: drawn by the region and the kind of country alone, so two dens in the same
  // kind of country in one region hold the same kind of beast.
  static den(region: Region, habitat: string): Beast | undefined {
    const rows = this.tables.denBeast.groups[habitat] ?? this.tables.denBeast.groups[this.country(region)];
    const row = rows && this.weighed(rows, new Expressions(`${region.name}:den:${habitat}`));
    return row && { species: row._key, count: row.count, label: row.label, role: row.role, nature: row.nature };
  }
  // A sign of the animals of a kind of country, for a place there: drawn by the place, so places differ.
  static sign(habitat: string, place: string): string {
    const rows = this.tables.wildSign.groups[habitat];
    return rows?.length ? this.weighed(rows, new Expressions(`${place}:sign`)).text : '';
  }
  private static weighed<T extends Row>(rows: T[], rng: Expressions): T {
    const total = rows.reduce((n, r) => n + (r.__weight ?? 1), 0);
    let roll = rng.number(`1d${total}`);
    return rows.find(r => (roll -= r.__weight ?? 1) <= 0) ?? rows[0]!;
  }
}
