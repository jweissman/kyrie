import { Expressions } from '../expressions';
import { GenerationSetting } from '../generation-setting';
import type { Region, Settlement } from './region-writer';

interface Mix { _key: string; __weight?: number; majority: string; others: string[] }
interface Tables {
  regionPeoples: { groups: Record<string, Mix[]> }; peopleCame: { groups: Record<string, string[]> };
  folkWord: { groups: Record<string, string[]> }; townsfolkName: { groups: Record<string, string[]> };
}
export type Townsfolk = 'innkeeper' | 'priest' | 'merchant' | 'traveller';

// Who lives in a generated region. Deem chooses its majority; the region takes a mix of peoples that fits it in its
// kind of country (peoples.json), drawn from Orsino's ancestries by what Orsino says of them: halflings in pastoral
// country, lizardfolk and undines by the water, gnomes and dwarves where there is metal, birdfolk and sylphs on the
// heights, half-orcs where raiders once came over the passes. One of its other settlements is likely another
// people's, with a word on how they came to be there. A settlement's innkeeper is nearly always of its folk; a priest
// is sent, a merchant moves and a traveller comes from anywhere in the region. Each is named in their own people's
// way, and no two alike.
export class RegionPeoples {
  static readonly roles: Townsfolk[] = ['innkeeper', 'priest', 'merchant', 'traveller'];
  // In a hundred, how likely each of a settlement's people is to be of its folk rather than another of the region's.
  static readonly local: Record<Townsfolk, number> = { innkeeper: 85, priest: 70, merchant: 60, traveller: 35 };
  static get tables(): Tables { return GenerationSetting.tables as unknown as Tables; }
  static settle(region: Region, seed: string): Region {
    const rng = new Expressions(`${seed}:peoples`), mix = this.mix(region, rng);
    const peoples = [region.ancestry, ...mix.others.filter(o => o !== region.ancestry)];
    const folk = this.folk(region.settlements.length, peoples, rng), used = new Set<string>();
    // Drawn on a stream of its own, so that who is he and who is she changes nothing else about a country.
    const sexes = new Expressions(`${seed}:pronouns`);
    const settlements = region.settlements.map((s, i) => {
      const people = Object.fromEntries(this.roles.map(r => [r,
        rng.number('1d100') <= this.local[r] ? folk[i]! : this.pick(peoples, rng)])) as Record<Townsfolk, string>;
      const names = Object.fromEntries(this.roles.map(r => [r, this.name(people[r], used, rng)]));
      const pronouns = Object.fromEntries(['innkeeper', 'priest', 'merchant', 'traveller']
        .map(r => [r, sexes.number('1d2') === 1 ? 'he' : 'she']));
      return { ...s, ...names, folk: folk[i]!, people, pronouns, ...folk[i] === region.ancestry ? {}
        : { came: this.came(folk[i]!, { trade: s.trade, majority: region.ancestry }, rng) } };
    });
    return { ...region, peoples: [...new Set(folk.concat(peoples))], settlements };
  }
  // A settlement's innkeeper, priest, merchant or traveller drawn a name that a story placed in the country gives one
  // of its own people (Odile, Garth: see StoryPeople) is named again, apart from every other.
  static apart(region: Region, reserved: string[]): void {
    const used = new Set([...reserved, ...region.settlements.flatMap(s => this.roles.map(r => s[r]))]);
    for (const s of region.settlements) {
      for (const role of this.roles.filter(r => reserved.includes(s[r]))) {
        s[role] = this.name(s.people?.[role] ?? s.folk ?? region.ancestry, used,
          new Expressions(`${region.name}:${s.id}:${role}:apart`));
      }
    }
  }
  // How a people is spoken of: "dwarven folk", "halflings".
  static word(ancestry: string): string {
    return this.tables.folkWord.groups[ancestry]?.[0] ?? `${ancestry.replaceAll('_', '-')} folk`;
  }
  // The mix of peoples that fits the region's majority in its country, weighted as the table says.
  private static mix(region: Region, rng: Expressions): Mix {
    const rows = this.tables.regionPeoples.groups[region.terrain] ?? [];
    const fits = rows.filter(r => r.majority === region.ancestry);
    const pool = fits.length ? fits : rows.length ? rows : [{ _key: 'alone', majority: region.ancestry, others: [] }];
    const total = pool.reduce((n, r) => n + (r.__weight ?? 1), 0);
    let roll = rng.number(`1d${total}`);
    return pool.find(r => (roll -= r.__weight ?? 1) <= 0) ?? pool[0]!;
  }
  // The folk of each settlement: the first is the majority's; one of the others is likely the next people's, and
  // any other may be the third's.
  private static folk(n: number, peoples: string[], rng: Expressions): string[] {
    const folk = Array.from({ length: n }, () => peoples[0]!);
    if (n < 2 || peoples.length < 2) { return folk; }
    const theirs = rng.number(`1d${n - 1}`);
    if (rng.number('1d100') <= 75) { folk[theirs] = peoples[1]!; }
    for (let i = 1; i < n; i++) {
      if (i !== theirs && peoples[2] && rng.number('1d100') <= 30) { folk[i] = peoples[2]; }
    }
    return folk;
  }
  private static pick<T>(list: T[], rng: Expressions): T { return list[rng.number(`1d${list.length}`) - 1]!; }
  private static name(ancestry: string, used: Set<string>, rng: Expressions): string {
    const list = this.tables.townsfolkName.groups[ancestry] ?? this.tables.townsfolkName.groups.human!;
    const free = list.filter(n => !used.has(n));
    const name = this.pick(free.length ? free : list, rng);
    used.add(name);
    return name;
  }
  private static came(ancestry: string, at: { trade: string; majority: string }, rng: Expressions): string {
    const lines = this.tables.peopleCame.groups[ancestry];
    if (!lines?.length) { return ''; }
    return this.pick(lines, rng).replaceAll('{trade}', at.trade).replaceAll('{majority}', this.word(at.majority));
  }
  // What a settlement says of its folk: "Coldhill is a village of halflings, living by honey. The folk of Coldhill
  // came up the river with the honey carts…".
  static told(s: Settlement): string {
    return `${s.name} is a ${s.size} of ${this.word(s.folk ?? 'human')}, living by ${s.trade}.${s.came
      ? ` The folk of ${s.name} ${s.came}.` : ''}`;
  }
}
