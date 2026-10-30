import data from '../../data/generation/scenes/common-names.json';
import { Draw } from './land/draw';
import { Terrain } from './land/terrain';
import type { Crossing } from './land/roads';
import type { Region, Settlement } from './region-writer';

// A name in Common, and the two words it is made of: what the place lies by (a ford, the fells) and what tells it from
// its neighbours (white, thorn, salt).
export interface Common { name: string; feature: string; affix: string }
interface Lexicon {
  heartland: string[]; generics: { when: string[]; weight: number; words: string[] }[]; wet: string[];
  qualifiers: Record<string, string[]>; trades: Record<string, string[]>; said: Record<string, string>;
  land: Record<string, Record<string, string>>;
}

// The plain names the folk of the human heartland give their settlements, in Common: what the place lies by and a
// word to tell it from its neighbours. A village where its road fords the river is a ford (Thornford), one under the
// fells where a river comes down is a fall (Whitefall), one by a mere a mere; and failing all that, it is named for
// its size (Ashby, Greenham). What tells it apart is its trees, its beasts, its colour or its weather, likelier its
// trade or the river it stands on, and likelier still what Deem drew it to mean. The names come in order, the most
// telling first, for PlaceNames to take the first that no other place in the region could be taken for; Deem's own
// meaning, said in Common, comes last.
export class CommonNames {
  static readonly lexicon = data as Lexicon;
  // Whether a region is the human heartland, whose folk name their settlements in Common.
  static heartland(region: Region): boolean { return this.lexicon.heartland.includes(region.ancestry); }
  static candidates(region: Region, i: number, at: { seed: string; founding?: string }): Common[] {
    const s = region.settlements[i]!, draw = new Draw(`${at.seed}:common:${s.id}`);
    const marks = this.marks(region, i, at.founding);
    const generics = this.lexicon.generics.filter(g => g.when.every(w => marks.has(w)));
    const ordered = this.ordered(generics.map(g => [g, g.weight]), draw);
    const words = [...new Set(ordered.flatMap(g => draw.shuffle(g.words)))];
    const dry = this.qualifiers(region, s, [], draw), wet = this.qualifiers(region, s, this.river(region, i), draw);
    const named = words.flatMap(w => (this.lexicon.wet.includes(w) ? wet : dry).flatMap(q => this.joined(q, w)));
    return [...named, ...this.meant(s)];
  }
  // What Deem drew a settlement to mean ("cold" and "hill"), said in Common: Coldhill.
  static meant(s: { feature?: string; affix?: string }): Common[] {
    if (!s.feature || !s.affix) { return []; }
    return this.joined(this.said(s.feature), this.said(s.affix));
  }
  static said(word: string): string { return this.lexicon.said[word] ?? word; }
  // A piece of the land named in Common, for what it is and what it is known by: the swan river is the Swanbourne,
  // the oak wood Oakhurst, the snow peak Snowpike.
  static land(feature: string, modifier: string, word: string): string[] {
    return this.joined(this.said(modifier), this.lexicon.land[feature]?.[word] ?? word).map(c => c.name);
  }
  // What a settlement has that a name can tell: its lie (a river, the fells, woods), a ford or a bridge where its own
  // road crosses a river close by, a crossroads where three roads meet at it, its size, and what made it (see
  // Foundings): a settlement there for its crossing is named for the very ford or bridge (crossed:ford), a house of
  // brothers or a fort holding a pass likely for that.
  static marks(region: Region, i: number, founding?: string): Set<string> {
    const s = region.settlements[i]!, atlas = region.atlas, seat = atlas?.seats[i];
    const marks = new Set<string>([s.size, ...seat?.lie ?? [], ...founding ? [founding] : []]);
    if (!atlas || !seat) { return marks; }
    const roads = atlas.ways.filter(w => w.start === i || w.end === i);
    for (const x of roads.flatMap(w => w.crossings)) {
      if (Terrain.distance(atlas.land, x.cell, seat.cell) <= 2) { marks.add(x.kind); }
    }
    const crossed = this.crossed(region, i);
    if (founding === 'crossing' && crossed) { marks.add(`crossed:${crossed.kind}`); }
    if (roads.length >= 3) { marks.add('cross'); }
    return marks;
  }
  // The river a settlement crosses or stands on, by what its name means (the swans, the white water), for a ford, a
  // bridge or a mill on it to be named the same: Swanford, Whitebridge; and a mill, for a mill by any water.
  private static river(region: Region, i: number): string[] {
    const atlas = region.atlas, seat = atlas?.seats[i];
    if (!atlas || !seat) { return ['mill']; }
    const crossed = this.crossed(region, i);
    const river = crossed ? atlas.rivers[crossed.river]
      : atlas.rivers.find(r => r.cells.some(c => Terrain.distance(atlas.land, c, seat.cell) <= 1));
    return [...river ? [this.said(river.naming.modifier)] : [], 'mill'];
  }
  // Where a road out of the settlement crosses a named river nearest it, within a cell or two: the crossing a
  // settlement there for its crossing is there for (as Foundings reads it).
  private static crossed(region: Region, i: number): Crossing | undefined {
    const atlas = region.atlas!, cell = atlas.seats[i]!.cell;
    return atlas.ways.filter(w => w.start === i || w.end === i).flatMap(w => w.crossings)
      .filter(x => atlas.rivers[x.river]).map(x => ({ x, d: Terrain.distance(atlas.land, x.cell, cell) }))
      .filter(c => c.d <= 2).sort((a, b) => a.d - b.d)[0]?.x;
  }
  // The words that can tell a settlement apart, in an order drawn for it: the trade it lives by, what Deem drew it to
  // mean and the river it stands on three times as likely to come first as any of its country's trees, beasts, colours
  // and weathers.
  private static qualifiers(region: Region, s: Settlement, river: string[], draw: Draw): string[] {
    const q = this.lexicon.qualifiers, weights = new Map<string, number>();
    for (const word of [...q[region.terrain] ?? [], ...q.shared!]) { weights.set(word, 1); }
    const own = s.feature ? [this.said(s.feature)] : [];
    for (const word of [...this.lexicon.trades[s.trade] ?? [], ...own, ...river]) { weights.set(word, 3); }
    return this.ordered([...weights], draw);
  }
  // A list in an order drawn by weight: each the likelier to come before the rest the heavier it is.
  private static ordered<T>(entries: [T, number][], draw: Draw): T[] {
    return entries.map(([item, weight]) => ({ item, key: draw.next() ** (1 / weight) }))
      .sort((a, b) => b.key - a.key).map(x => x.item);
  }
  // Two words made one name the way such names are made: no word twice (Fenfen), no vowel run on from a final "e"
  // (Stoneedge), one "h" where "sh" meets another (Ashurst, Rushurst), and no letter doubled where the words meet
  // otherwise (Newworth, Elmmere, Highholm, Birchholt).
  private static joined(q: string, w: string): Common[] {
    if (q.startsWith(w) || w.startsWith(q) || (q.endsWith('e') && /^[aeiou]/.test(w))) { return []; }
    const merged = q.endsWith('sh') && w.startsWith('h');
    if (q.at(-1) === w[0] && !merged) { return []; }
    const name = `${q}${merged ? w.slice(1) : w}`;
    return [{ name: `${name[0]!.toUpperCase()}${name.slice(1)}`, feature: q, affix: w }];
  }
}
