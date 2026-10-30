import { Draw } from '../land/draw';
import { Commons } from './commons';
import { Canon } from '../../canon/canon';
import { Overlays } from '../../overlays';
import { RegionGeography } from '../region-geography';
import { Foundings, type Founding, type FoundingPlace } from '../founding';
import type { Region, Settlement } from '../region-writer';
import folk from '../../../data/generation/scenes/folk.json';
import trades from '../../../data/generation/scenes/occupations.json';

export interface Occupation {
  name: string; background: string; painting: string; everywhere?: boolean; trades?: string[]; terrains?: string[];
  // The foundings whose settlements take this work first (see Foundings).
  foundings?: string[];
  water?: boolean; sizes?: string[]; pronoun?: string; wanders?: boolean; animal?: string; knows?: string[];
  concern?: string;
  // What they sell, of the catalog's kinds, each with its price and how many they have (a tinker's wares spread on a
  // blanket, which had sold nothing: play 7).
  sells?: [string, number, number][];
  workplace?: { id: string; name: string; scene: string; indoors?: boolean };
  seen: string[]; talk: string[];
}
// Someone who lives in a settlement: their name and the words they are spoken of in, their people, their work and
// where they do it, their household, their manner, and what they are seen doing and say of their work.
export interface Resident {
  id: string; name: string; family: string; pronoun: 'he' | 'she' | 'they'; ancestry: string; occupation: string;
  work: Occupation; household: string; manner: string; workplace?: string; seen: string; talk: string;
  // Where they are of an evening: at the inn (and what they are doing there), or at home.
  evening: 'inn' | 'home'; tavern: string;
  // Who they are to someone else of the settlement ("Moll's husband"), when they are.
  kin?: { to: string; as: string };
}
export interface Animal { id: string; species: string; name: string; pronoun: 'he' | 'she' | 'it'; household?: string;
  role: string; at: string; seen: string;
  // How it is seen after dark, when that is not how it is seen by day (a cat in the sun).
  night?: string }
// A place where the work is done; the founding's own carries what there is to do there besides (see FoundingPlace).
// common: one of the places anyone works whose work has none of its own (see Commons): the lanes, the fields.
export interface Workplace { id: string; name: string; scene: string; indoors: boolean; place?: FoundingPlace;
  common?: boolean }
// A small trouble of one household that a stranger could help with: a goat got out, a thing they lack.
export interface Concern { kind: 'strayed' | 'wants'; resident: string; animal?: string; wants?: string }
export interface Community {
  settlement: Settlement; residents: Resident[]; animals: Animal[]; workplaces: Workplace[]; concern?: Concern;
  water: boolean;
  // Whether it has a room where people drink of an evening (an inn, an alehouse, a canteen, a guest-hall).
  inn: boolean;
}

// A settlement as the people who live in it: who works at what, given what the place lives by, the land round it,
// its water and its size; where they work; who belongs with whom; the animals about the place; and one small
// trouble. Drawn from the region and the settlement alone, so the same country always has the same people.
export class Communities {
  static readonly occupations = trades.occupations as unknown as Record<string, Occupation>;
  static readonly folk = folk as unknown as { given: Record<string, Record<string, string[]>>;
    family: Record<string, string[]>; animal: Record<string, string[]> };
  static readonly sizes: Record<string, number> = { hamlet: 3, village: 5, town: 7 };
  static readonly manners = ['proud', 'grim', 'cheerful', 'acerbic', 'compassionate', 'stoic', 'jovial'];
  static readonly evenings = (trades as unknown as { evening: string[] }).evening;
  static plan(region: Region, s: Settlement, stock: string[] = []): Community {
    const draw = new Draw(`${region.name}:${s.id}:community`), water = this.water(region, s);
    const founding = Foundings.of(region, region.settlements.indexOf(s));
    const chosen = this.choose(region, s, { water, draw, founding });
    const ancestry = s.folk ?? region.ancestry, { people: used, animals: beasts } = this.before(region, s);
    const reserved = region.reserved ?? [];
    const residents = chosen.map(([key, work], i) =>
      this.resident(s, { key, work, ancestry, i, draw, used, reserved }));
    this.households(residents, draw);
    const workplaces = this.places(s, residents, founding);
    workplaces.push(...Commons.assign(s, residents, { workplaces, water, heart: ['workings', 'yard'].includes(founding.kind) }));
    const animals = this.animals(s, residents, { draw, founding, beasts });
    const concern = this.concern(residents, animals, { draw, stock, beasts });
    return { settlement: s, residents, animals, workplaces, water, inn: founding.keeping !== 'none', ...concern ? { concern } : {} };
  }
  // Where the work is done: the founding's own place first (the crossing stones, the boat-sheds), where the founding's
  // own work goes; then the workplaces of the other work, as many as the settlement's size has room for. Where the
  // settlement is its work (a pit-head, a burners' clearing), whoever does that work does it there, on its heart.
  private static places(s: Settlement, residents: Resident[], founding: Founding): Workplace[] {
    const own = founding.place && { id: `${s.id}_${founding.place.id}`, name: founding.place.name, scene: founding.place.scene,
      indoors: !founding.place.outdoors, place: founding.place };
    const heart = ['workings', 'yard'].includes(founding.kind);
    const theirs = residents.filter(r => r.work.workplace && !(heart && r.work.trades?.includes(s.trade)));
    const room = (s.size === 'town' ? 3 : s.size === 'village' ? 2 : 1) - (own ? 1 : 0);
    const others = [...new Map(theirs.map(r => [r.work.workplace!.id, r.work.workplace!])).values()]
      .slice(0, Math.max(0, room))
      .map(w => ({ id: `${s.id}_${w.id}`, name: w.name, scene: w.scene, indoors: !!w.indoors }));
    // The founding's own place goes to the work that is only done in such places (the ferry-keeper's crossing, the
    // miller's mill), before work that is done anywhere.
    const ranked = founding.works.filter(k => this.occupations[k]?.foundings?.includes(founding.kind));
    const first = [...ranked, ...founding.works].map(k => residents.find(r => r.occupation === k)).find(Boolean);
    for (const r of residents) {
      const place = r.work.workplace && others.find(w => w.id === `${s.id}_${r.work.workplace!.id}`);
      if (own && r === first) { r.workplace = own.id; }
      else if (place && theirs.includes(r)) { r.workplace = place.id; }
    }
    return [...own ? [own] : [], ...others];
  }
  // Whether the settlement stands by a river, a lake or the sea.
  static water(region: Region, s: Settlement): boolean {
    const atlas = RegionGeography.atlas(region), W = atlas.land.width, at = s.cell;
    if (at === undefined) { return false; }
    const near = new Set([-W - 1, -W, -W + 1, -1, 0, 1, W - 1, W, W + 1].map(d => at + d));
    const wet = new Set([...atlas.rivers.flatMap(r => r.cells), ...atlas.lakes.flatMap(l => l.cells)]);
    return [...near].some(c => wet.has(c) || ['sea', 'lake'].includes(atlas.land.cover[c] ?? ''));
  }
  // Who works at what: the work the settlement was founded for first (two of it), then the place's own trade (at
  // least two at it), then what the land asks, then what any settlement has; a farmer or two wherever there is room.
  private static choose(region: Region, s: Settlement, at: { water: boolean; draw: Draw; founding: Founding }):
    [string, Occupation][] {
    const { water, draw, founding } = at;
    // Work that asks a calling the settlement's folk cannot follow (a sylph trapper would be a ranger) is not theirs.
    const classes = Canon.ancestries[s.folk ?? region.ancestry]?.classes;
    const fits = Object.entries(this.occupations).filter(([, o]) => (!o.water || water)
      && (!o.foundings || o.foundings.includes(founding.kind))
      && (!o.sizes || o.sizes.includes(s.size))
      && (!classes || !Overlays.has(o.background) || !Overlays.get(o.background).requiredClass
        || classes.includes(Overlays.get(o.background).requiredClass!)));
    const trade = draw.shuffle(fits.filter(([, o]) => o.trades?.includes(s.trade)));
    const land = draw.shuffle(fits.filter(([, o]) => !o.trades && o.terrains?.includes(region.terrain)));
    const any = draw.shuffle(fits.filter(([k, o]) => o.everywhere && !trade.some(([t]) => t === k)));
    const founded = founding.works.map(k => fits.find(([key]) => key === k)).filter(x => !!x)
      .filter(([, o]) => o.foundings?.includes(founding.kind)
        || (o.trades ? o.trades.includes(s.trade) : !o.terrains || o.terrains.includes(region.terrain)));
    const n = this.sizes[s.size] ?? 3, picked: [string, Occupation][] = [];
    for (const list of [founded.slice(0, 2), trade.slice(0, 2), land.slice(0, 1), trade.slice(2), any, land.slice(1)]) {
      for (const entry of list) {
        if (picked.length < n && !picked.some(([k]) => k === entry[0])) { picked.push(entry); }
      }
    }
    while (picked.length < n) { picked.push(['farmer', this.occupations.farmer!]); }
    return picked;
  }
  // The names already given in the country when a settlement's people are named: every settlement's innkeeper,
  // priest, merchant and traveller, and the people of the settlements before it, so that no two people in a country
  // share a name while there are names enough.
  private static readonly given = new WeakMap<Region, Map<string, { people: string[]; animals: string[] }>>();
  private static before(region: Region, s: Settlement): { people: Set<string>; animals: Set<string> } {
    // A story's people's names are kept for them (StoryPeople), from beasts too: an inn's dog had been the circus's
    // Nell.
    const people = this.townsfolk(region), animals = new Set<string>(region.reserved ?? []);
    for (const earlier of region.settlements.slice(0, region.settlements.indexOf(s))) {
      const named = this.names(region, earlier);
      for (const name of named.people) { people.add(name); }
      for (const name of named.animals) { animals.add(name); }
    }
    return { people, animals };
  }
  private static townsfolk(region: Region): Set<string> {
    return new Set(region.settlements.flatMap(x => [x.innkeeper, x.priest, x.merchant, x.traveller])
      .filter((n): n is string => !!n));
  }
  private static names(region: Region, s: Settlement): { people: string[]; animals: string[] } {
    let known = this.given.get(region);
    if (!known) { known = new Map(); this.given.set(region, known); }
    if (!known.has(s.id)) {
      const c = this.plan(region, s);
      known.set(s.id, { people: c.residents.map(r => r.name), animals: c.animals.map(a => a.name) });
    }
    return known.get(s.id)!;
  }
  // A name for someone named after the settled people (a shop's keeper, a traveller): one nobody has, or, when the
  // names of their people have all been given, one with a family's name to it.
  static distinct(names: string[], ancestry: string,
    at: { draw: Draw; taken: Set<string>; reserved?: readonly string[] | undefined }): string {
    const free = this.pick(names.filter(n => !at.taken.has(n)), at.draw, at.reserved);
    if (free) { return free; }
    const given = at.draw.pick(names);
    const families = at.draw.shuffle(this.folk.family[ancestry] ?? this.folk.family.human!);
    return families.map(f => `${given} ${f}`).find(n => !at.taken.has(n)) ?? `${given} ${families[0]!}`;
  }
  // One of a pool of names, as drawn; but one a story placed in the country gives one of its own people (Odile: see
  // StoryPeople) is drawn again from the rest, so a country none of whose people drew one is named as it was.
  static pick(pool: string[], draw: Draw, reserved: readonly string[] = []): string | undefined {
    if (!pool.length) { return undefined; }
    const drawn = draw.pick(pool), rest = pool.filter(n => !reserved.includes(n));
    return reserved.includes(drawn) && rest.length ? draw.pick(rest) : drawn;
  }
  // Every name the country's settled people have: its townsfolk and everyone who lives in its settlements, for those
  // named after them (a shop's keeper, a traveller on the road) to keep clear of.
  static everyone(region: Region): Set<string> {
    const all = this.townsfolk(region);
    for (const s of region.settlements) { for (const name of this.names(region, s).people) { all.add(name); } }
    return all;
  }
  private static resident(s: Settlement, at: { key: string; work: Occupation; ancestry: string; i: number; draw: Draw;
    used: Set<string>; reserved: readonly string[] }): Resident {
    const { key, work, ancestry, i, draw, used } = at;
    const names = this.folk.given[ancestry] ?? this.folk.given.human!;
    const pronoun = (work.pronoun ?? (draw.chance(0.06) ? 'they' : draw.chance(0.5) ? 'she' : 'he')) as Resident['pronoun'];
    const pool = (names[pronoun] ?? names.she!).filter(n => !used.has(n));
    const given = this.pick(pool, draw, at.reserved) ?? draw.pick(names[pronoun] ?? names.she!);
    const families = this.folk.family[ancestry] ?? this.folk.family.human!, family = draw.pick(families);
    // When the country's names of a people have all been given, a name given again is said with the family's.
    const name = pool.length ? given : `${given} ${family}`;
    used.add(name);
    return { id: `${s.id}_r${i + 1}`, name, family, pronoun, ancestry, occupation: key, work,
      household: `${s.id}_h${i + 1}`, manner: draw.pick(this.manners), seen: draw.pick(work.seen), talk: draw.pick(work.talk),
      evening: draw.chance(0.45) ? 'inn' : 'home', tavern: draw.pick(this.evenings) };
  }
  // Who lives with whom: now and then two of the workers are one household, a pair or a parent and a grown child,
  // and share a family name.
  private static households(residents: Resident[], draw: Draw) {
    for (let i = 1; i < residents.length; i++) {
      const a = residents[i - 1]!, b = residents[i]!;
      if (a.kin || !draw.chance(0.4)) { continue; }
      b.household = a.household; b.family = a.family;
      const as = draw.chance(0.5) ? (b.pronoun === 'she' ? 'wife' : b.pronoun === 'he' ? 'husband' : 'partner')
        : (b.pronoun === 'she' ? 'daughter' : b.pronoun === 'he' ? 'son' : 'child');
      b.kin = { to: a.id, as };
    }
  }
  // How the dog of the house where travellers sleep is about the place; each its own way.
  static readonly innDogs = [
    '{Name}, {dog}, lies across the doorstep of {inn} with {their} chin on {their} paws, and watches who comes.',
    '{Name}, {dog}, sleeps against the wall of {inn} with one ear up for the door.',
    '{Name}, {dog}, sits by the door of {inn} as if {they} kept it.',
    '{Name}, {dog}, noses along the foot of the wall of {inn}, busy with something only {they} can smell.'];
  // A cat about the place, each her own way (one cat on one wall-top was in every country: the play-structure
  // investigation's PT-15), in any weather (a cat "in a patch of sun" in the rain: the cold evaluation).
  static readonly cats = [
    '{Name}, a cat, sits on a wall-top with her eyes shut, which does not mean she is not watching.',
    '{Name}, a cat, is washing a paw on a windowsill, and stops to stare at you in the middle of it.',
    '{Name}, a cat, picks her way along the top of a fence as if it were a road built for her.',
    '{Name}, a cat, sits in the middle of the way as if it were hers, and people step round her.',
    '{Name}, a cat, sits in a window between two pots of herbs, keeping an eye on the street.',
    '{Name}, a cat, watches a hole at the foot of a wall with the whole of herself.'];
  // The animals about the place: the dog of the inn (or whatever house keeps travellers), always; a household's
  // animal where its work keeps one; a cat here and there.
  private static animals(s: Settlement, residents: Resident[],
    at: { draw: Draw; founding: Founding; beasts: Set<string> }): Animal[] {
    const { draw, founding, beasts } = at, out: Animal[] = [], keeping = Foundings.table.keeping[founding.keeping];
    const words = { inn: s.inn.replace(/^The /, 'the '), keeper: s.innkeeper, name: s.name };
    const house = Foundings.fill(keeping.house, words), role = Foundings.fill(keeping.dog, words);
    const dog = this.animalName('dog', draw, beasts), inn = { id: `${s.id}_inndog`, species: 'dog', name: dog,
      pronoun: draw.chance(0.5) ? 'she' as const : 'he' as const, role, at: `${s.id}_green`,
      seen: new Draw(`${s.name}:inn dog`).pick(this.innDogs).replace('{inn}', house).replace('{dog}', role) };
    out.push(inn);
    for (const r of residents.filter(x => x.work.animal)) {
      const species = r.work.animal!, name = this.animalName(species, draw, beasts);
      const pronoun = ['cow', 'goat', 'hen'].includes(species) || draw.chance(0.5) ? 'she' as const : 'he' as const;
      out.push({ id: `${r.id}_${species}`, species, name, pronoun, household: r.household,
        role: `${r.name}'s ${species}`, at: r.workplace ?? `${s.id}_green`,
        seen: `{Name}, ${r.name}'s ${species}, is never far from ${r.name}.` });
    }
    if (draw.chance(0.6)) {
      const r = draw.pick(residents);
      out.push({ id: `${s.id}_cat`, species: 'cat', name: this.animalName('cat', draw, beasts), pronoun: 'she', household: r.household,
        role: `the ${r.family}s' cat`, at: `${s.id}_green`,
        seen: new Draw(`${s.name}:cat`).pick(this.cats),
        night: 'Two green eyes on a wall-top are {Name}, the cat, who sees you better than you see her.' });
    }
    return out;
  }
  // An animal's name, unless another animal in the country has it already.
  private static animalName(species: string, draw: Draw, beasts: Set<string>): string {
    const names = this.folk.animal[species] ?? this.folk.animal.dog!, free = names.filter(n => !beasts.has(n));
    const name = draw.pick(free.length ? free : names);
    beasts.add(name);
    return name;
  }
  // One small trouble a stranger could help with: a household's goat got out; or someone who lacks a thing the
  // shop sells, and would pay for it brought.
  private static concern(residents: Resident[], animals: Animal[],
    at: { draw: Draw; stock: string[]; beasts: Set<string> }): Concern | undefined {
    const { draw, stock, beasts } = at;
    if (!residents.length || !draw.chance(0.85)) { return undefined; }
    const r = draw.pick(residents);
    if (draw.chance(0.5)) {
      animals.push({ id: `${r.id}_goat`, species: 'goat', name: this.animalName('goat', draw, beasts), pronoun: 'she',
        household: r.household, role: `${r.name}'s goat, got loose`, at: '', seen: '' });
      return { kind: 'strayed', resident: r.id, animal: `${r.id}_goat` };
    }
    const wanted = ['rope', 'torch', 'lantern', 'crowbar', 'herbs'].filter(k => stock.includes(k));
    return wanted.length ? { kind: 'wants', resident: r.id, wants: draw.pick(wanted) } : undefined;
  }
}
