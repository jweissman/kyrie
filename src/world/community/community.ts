import { Draw } from '../land/draw';
import { Canon } from '../../canon/canon';
import { Overlays } from '../../overlays';
import { RegionGeography } from '../region-geography';
import type { Region, Settlement } from '../region-writer';
import folk from '../../../data/generation/scenes/folk.json';
import trades from '../../../data/generation/scenes/occupations.json';

export interface Occupation {
  name: string; background: string; painting: string; everywhere?: boolean; trades?: string[]; terrains?: string[];
  water?: boolean; sizes?: string[]; pronoun?: string; wanders?: boolean; animal?: string; knows?: string[];
  concern?: string;
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
export interface Workplace { id: string; name: string; scene: string; indoors: boolean }
// A small trouble of one household that a stranger could help with: a goat got out, a thing they lack.
export interface Concern { kind: 'strayed' | 'wants'; resident: string; animal?: string; wants?: string }
export interface Community {
  settlement: Settlement; residents: Resident[]; animals: Animal[]; workplaces: Workplace[]; concern?: Concern;
  water: boolean;
}

// A settlement as the people who live in it: who works at what, given what the place lives by, the land round it,
// its water and its size; where they work; who belongs with whom; the animals about the place; and one small
// trouble. Drawn from the region and the settlement alone, so the same country always has the same people.
export class Communities {
  static readonly occupations = trades.occupations as Record<string, Occupation>;
  static readonly folk = folk as unknown as { given: Record<string, Record<string, string[]>>;
    family: Record<string, string[]>; animal: Record<string, string[]> };
  static readonly sizes: Record<string, number> = { hamlet: 3, village: 5, town: 7 };
  static readonly manners = ['proud', 'grim', 'cheerful', 'acerbic', 'compassionate', 'stoic', 'jovial'];
  static readonly evenings = (trades as unknown as { evening: string[] }).evening;
  static plan(region: Region, s: Settlement, stock: string[] = []): Community {
    const draw = new Draw(`${region.name}:${s.id}:community`), water = this.water(region, s);
    const chosen = this.choose(region, s, water, draw);
    const ancestry = s.folk ?? region.ancestry, used = new Set<string>();
    const residents = chosen.map(([key, work], i) => this.resident(s, { key, work, ancestry, i, draw, used }));
    this.households(residents, draw);
    const workplaces = [...new Map(residents.filter(r => r.work.workplace)
      .map(r => [r.work.workplace!.id, r.work.workplace!])).values()].slice(0, s.size === 'town' ? 3 : s.size === 'village' ? 2 : 1)
      .map(w => ({ id: `${s.id}_${w.id}`, name: w.name, scene: w.scene, indoors: !!w.indoors }));
    for (const r of residents) {
      const place = r.work.workplace && workplaces.find(w => w.id === `${s.id}_${r.work.workplace!.id}`);
      if (place) { r.workplace = place.id; }
    }
    const animals = this.animals(s, residents, draw);
    const concern = this.concern(residents, animals, { draw, stock });
    return { settlement: s, residents, animals, workplaces, water, ...concern ? { concern } : {} };
  }
  // Whether the settlement stands by a river, a lake or the sea.
  static water(region: Region, s: Settlement): boolean {
    const atlas = RegionGeography.atlas(region), W = atlas.land.width, at = s.cell;
    if (at === undefined) { return false; }
    const near = new Set([-W - 1, -W, -W + 1, -1, 0, 1, W - 1, W, W + 1].map(d => at + d));
    const wet = new Set([...atlas.rivers.flatMap(r => r.cells), ...atlas.lakes.flatMap(l => l.cells)]);
    return [...near].some(c => wet.has(c) || ['sea', 'lake'].includes(atlas.land.cover[c] ?? ''));
  }
  // Who works at what: the place's own trade first (at least two at it), then what the land asks, then what any
  // settlement has; a farmer or two wherever there is room.
  private static choose(region: Region, s: Settlement, water: boolean, draw: Draw): [string, Occupation][] {
    // Work that asks a calling the settlement's folk cannot follow (a sylph trapper would be a ranger) is not theirs.
    const classes = Canon.ancestries[s.folk ?? region.ancestry]?.classes;
    const fits = Object.entries(this.occupations).filter(([, o]) => (!o.water || water)
      && (!o.sizes || o.sizes.includes(s.size))
      && (!classes || !Overlays.has(o.background) || !Overlays.get(o.background).requiredClass
        || classes.includes(Overlays.get(o.background).requiredClass!)));
    const trade = draw.shuffle(fits.filter(([, o]) => o.trades?.includes(s.trade)));
    const land = draw.shuffle(fits.filter(([, o]) => !o.trades && o.terrains?.includes(region.terrain)));
    const any = draw.shuffle(fits.filter(([k, o]) => o.everywhere && !trade.some(([t]) => t === k)));
    const n = this.sizes[s.size] ?? 3, picked: [string, Occupation][] = [];
    for (const list of [trade.slice(0, 2), land.slice(0, 1), trade.slice(2), any, land.slice(1)]) {
      for (const entry of list) {
        if (picked.length < n && !picked.some(([k]) => k === entry[0])) { picked.push(entry); }
      }
    }
    while (picked.length < n) { picked.push(['farmer', this.occupations.farmer!]); }
    return picked;
  }
  private static resident(s: Settlement, at: { key: string; work: Occupation; ancestry: string; i: number; draw: Draw;
    used: Set<string> }): Resident {
    const { key, work, ancestry, i, draw, used } = at;
    const names = this.folk.given[ancestry] ?? this.folk.given.human!;
    const pronoun = (work.pronoun ?? (draw.chance(0.06) ? 'they' : draw.chance(0.5) ? 'she' : 'he')) as Resident['pronoun'];
    const pool = (names[pronoun] ?? names.she!).filter(n => !used.has(n));
    const name = pool.length ? draw.pick(pool) : draw.pick(names.she!);
    used.add(name);
    const families = this.folk.family[ancestry] ?? this.folk.family.human!;
    return { id: `${s.id}_r${i + 1}`, name, family: draw.pick(families), pronoun, ancestry, occupation: key, work,
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
  // The animals about the place: the inn's dog, always; a household's animal where its work keeps one; a cat here
  // and there.
  private static animals(s: Settlement, residents: Resident[], draw: Draw): Animal[] {
    const out: Animal[] = [];
    const dog = this.animalName('dog', draw), inn = { id: `${s.id}_inndog`, species: 'dog', name: dog,
      pronoun: draw.chance(0.5) ? 'she' as const : 'he' as const, role: `the inn's dog`, at: `${s.id}_green`,
      seen: `{Name}, the inn's dog, lies across the doorstep of ${s.inn} with {their} chin on {their} paws, and watches who comes.` };
    out.push(inn);
    for (const r of residents.filter(x => x.work.animal)) {
      const species = r.work.animal!, name = this.animalName(species, draw);
      const pronoun = ['cow', 'goat', 'hen'].includes(species) || draw.chance(0.5) ? 'she' as const : 'he' as const;
      out.push({ id: `${r.id}_${species}`, species, name, pronoun, household: r.household,
        role: `${r.name}'s ${species}`, at: r.workplace ?? `${s.id}_green`,
        seen: `{Name}, ${r.name}'s ${species}, is never far from ${r.name}.` });
    }
    if (draw.chance(0.6)) {
      const r = draw.pick(residents);
      out.push({ id: `${s.id}_cat`, species: 'cat', name: this.animalName('cat', draw), pronoun: 'she', household: r.household,
        role: `the ${r.family}s' cat`, at: `${s.id}_green`,
        seen: '{Name}, a cat, sits on a warm wall-top in the sun with her eyes shut, which does not mean she is not watching.',
        night: 'Two green eyes on a wall-top are {Name}, the cat, who sees you better than you see her.' });
    }
    return out;
  }
  private static animalName(species: string, draw: Draw): string {
    return draw.pick(this.folk.animal[species] ?? this.folk.animal.dog!);
  }
  // One small trouble a stranger could help with: a household's goat got out; or someone who lacks a thing the
  // shop sells, and would pay for it brought.
  private static concern(residents: Resident[], animals: Animal[], at: { draw: Draw; stock: string[] }):
    Concern | undefined {
    const { draw, stock } = at;
    if (!residents.length || !draw.chance(0.85)) { return undefined; }
    const r = draw.pick(residents);
    if (draw.chance(0.5)) {
      animals.push({ id: `${r.id}_goat`, species: 'goat', name: this.animalName('goat', draw), pronoun: 'she',
        household: r.household, role: `${r.name}'s goat, got loose`, at: '', seen: '' });
      return { kind: 'strayed', resident: r.id, animal: `${r.id}_goat` };
    }
    const wanted = ['rope', 'torch', 'lantern', 'crowbar', 'herbs'].filter(k => stock.includes(k));
    return wanted.length ? { kind: 'wants', resident: r.id, wants: draw.pick(wanted) } : undefined;
  }
}
