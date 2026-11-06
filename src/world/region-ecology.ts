import { Canon } from '../canon/canon';
import { Counted } from '../presentation/counted';
import { Expressions } from '../expressions';
import { GenerationSetting } from '../generation-setting';
import type { Region, Site } from './region-writer';
import type { Species } from '../canon/schema';
import { Draw } from './land/draw';
import { CreatureVariants } from '../creature-variants';
import { RegionWeather } from './region-weather';
import { Challenge } from './challenge';

export interface Beast { species: string; count: number; label: string; role: string; nature: string;
  variations?: string[] }
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
  // Each kind of country as the one vocabulary says it is on the land (data/catalog/habitats.json): by the region's
  // terrain, by a site's kind, by a road's form, and by the ground an open road crosses (a moor road has the moor's).
  static readonly terrain = RegionEcology.by('terrains');
  static readonly sites = RegionEcology.by('sites');
  static readonly forms = RegionEcology.by('forms');
  static readonly grounds = RegionEcology.by('covers');
  private static by(field: 'terrains' | 'sites' | 'forms' | 'covers'): Record<string, string> {
    return Object.fromEntries(Object.entries(Canon.habitats).flatMap(([id, h]) => (h[field] ?? []).map(k => [k, id])));
  }
  static get tables(): Tables { return GenerationSetting.tables as unknown as Tables; }
  static country(region: Region): string { return this.terrain[region.terrain] ?? 'fells'; }
  // The kind of country a site stands in: what it is, or the region's own when that says nothing (a tower).
  static habitat(region: Region, site: Site, form?: string): string {
    return (form && this.forms[form]) ?? this.sites[site.kind] ?? this.country(region);
  }
  // What has made its den at a site: drawn by the region and the kind of country alone, so two dens in the same
  // kind of country in one region hold the same kind of beast.
  static den(region: Region, habitat: string): Beast | undefined {
    const table = this.tables.denBeast.groups[habitat] ?? [], recorded = RegionEcology.recorded(habitat);
    const kept = new Draw(`${region.name}:den:${habitat}:recorded`);
    const rows = table.length ? table : this.tables.denBeast.groups[this.country(region)];
    let row = !table.length && recorded.length ? kept.weighted(recorded.map(r => [r, r.__weight ?? 1] as const))
      : rows && this.weighed(rows, new Expressions(`${region.name}:den:${habitat}`));
    // What dens there by its own record, beside the table, by its share of the weight of both: drawn apart from the
    // table's draw, so what the table gives a country is not shifted by a kind added to the records.
    if (table.length && recorded.length
      && kept.chance(this.weight(recorded) / (this.weight(table) + this.weight(recorded)))) {
      row = kept.weighted(recorded.map(r => [r, r.__weight ?? 1] as const));
    }
    return row && { species: row._key, count: row.count, label: row.label, role: row.role, nature: row.nature };
  }
  // What dens in a kind of country by its own record, beside the ecology's table: a creature whose record says how
  // common it is (abundance), and that meets a company in some temper (a den is kept), dens wherever its habitats are,
  // a pair of them (the owner, 5 November, late: an animal added to animals.json is met where it lives, with nothing
  // else to write). How it can be dealt with is its nature: the dead are laid to rest, an animal smoked out, anything
  // else neither.
  static recorded(habitat: string): (Row & Omit<Beast, 'species'>)[] {
    return Canon.catalogued.map(id => [id, Canon.species[id]!] as const)
      .filter(([id, s]) => s.abundance && s.habitats?.includes(habitat)
      && this.keeps(id))
      .map(([id, s]) => { const name = s.name.toLowerCase(), beyond = Challenge.of(id) > this.budget;
        // One beyond a first den's danger (a drake on the heights) is rare there, and alone: a danger to go round.
        return { _key: id, __weight: beyond ? s.abundance! / 6 : s.abundance!, count: beyond ? 1 : 2,
          label: beyond ? `the ${name}` : `the ${Counted.plural(name)}`,
          role: `${/^[aeiou]/.test(name) ? 'an' : 'a'} ${name}`,
          nature: s.type === 'undead' ? 'unquiet' : s.kind === 'animal' ? 'wild' : 'stubborn' }; });
  }
  private static weight(all: Row[]): number { return all.reduce((n, r) => n + (r.__weight ?? 1), 0); }
  // A first den's danger, as Orsino's budget for a first-level room (twice its challenge, see Parties).
  static readonly budget = 2;
  // Whether a kind keeps a den: one that meets a company in some temper, save a tame one, and an animal that only
  // slips away (a curlew, a hare); a wary dryad keeps her grove.
  static keeps(id: string): boolean {
    const temper = Canon.temperament(id);
    return !!temper && temper !== 'tame' && !(temper === 'wary' && Canon.creature(id).kind === 'animal');
  }
  // The animals that keep no den (a hind, a hare, a curlew), with how common each is, that live in any of these
  // habitats: met in the open country where they live (see RegionAnimals).
  static seen(habitats: Set<string>): [string, Species][] {
    return Canon.catalogued.map(id => [id, Canon.species[id]!] as [string, Species]).filter(([id, s]) => s.abundance
      && Canon.creature(id).kind === 'animal'
      && !this.keeps(id) && Canon.temperament(id) !== 'tame' && s.habitats?.some(h => habitats.has(h)));
  }
  // What makes the beasts of one den other than their kind: in a barrow or a ruin, sometimes the dead of it (skeletal
  // wolves, which the rites will lay down); else the variations its country gives it (data/catalog/variations.json:
  // frost wolves where the winters are long, starving ones on the fells), and sometimes an Orsino aspect drawn by
  // rarity (venomous, ancient). Drawn by the site, so each den is its own.
  static variant(site: Site, beast: Beast, at: { habitat: string; region: Region }):
    Beast & { aspect?: string; template?: string } {
    const draw = new Draw(`${site.id}:variant`), habitat = at.habitat;
    if (['barrow', 'ruin'].includes(habitat) && beast.nature === 'wild' && draw.chance(0.4)) {
      // Any of Orsino's undead templates (the undeath variations), not two of them written here.
      const template = draw.pick(CreatureVariants.templates);
      return { ...this.named(beast, template), nature: 'unquiet', template };
    }
    const varied = this.varied(beast, { habitat, climate: RegionWeather.climate(at.region) }, draw);
    if (!draw.chance(0.45)) { return varied; }
    const aspect = CreatureVariants.draw(draw.int(100) + 1, draw.int.bind(draw));
    // Orsino's wildtype is the beast as it is: nothing to call it.
    return aspect === 'wildtype' ? varied : { ...this.named(varied, aspect), aspect };
  }
  // A beast with the variations its country gives it, and called by them ("a wolf" of the snows, "a frost wolf").
  static varied(beast: Beast, where: { habitat: string; climate: string }, draw: Draw): Beast {
    const variations = CreatureVariants.fitting(beast.species, where, () => draw.next());
    return variations.length ? { ...beast, variations, role: CreatureVariants.called(beast.role, variations) } : beast;
  }
  // "a wolf", venomous, is "a venomous wolf".
  private static named(beast: Beast, word: string): Beast {
    return { ...beast, role: `${/^[aeiou]/.test(word) ? 'an' : 'a'} ${word} ${beast.role.replace(/^(a|an) /, '')}` };
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
