import tongues from 'languages';
import { Expressions } from '../expressions';

export type Form = 'river' | 'lake' | 'peak' | 'pass' | 'wood';
// One piece of a region's land: what it is, its name in the folk's tongue, and what the name means.
export interface Landmark { id: string; form: Form; name: string; gloss: string; tongue: string; modifier: string }

// The land a generated region lies in, beyond its settlements and sites: the river its first road fords, the lake one
// of its sites stands by, the peak and the pass its second road climbs, the wood it runs through. Each is named in the
// folk's tongue for what it is (a brook of swans, a narrow pass) and is never named so like another place in the
// region that a traveller could take one for the other.
export class RegionLand {
  static readonly forms: Record<string, Form[]> = {
    forest: ['river', 'wood', 'lake'], marsh: ['river', 'lake'], mountain: ['river', 'peak', 'pass'],
    frost: ['river', 'peak', 'pass'] };
  // What each kind of land may be named for, and the words a tongue has for that kind of land.
  static readonly modifiers: Record<Form, string[]> = {
    river: ['swans', 'white', 'black', 'gray', 'quick', 'deep', 'willow', 'birch', 'cold', 'salt', 'red', 'fish'],
    lake: ['swans', 'black', 'gray', 'deep', 'moss', 'mist', 'silver', 'pale', 'fish', 'secret'],
    peak: ['iron', 'tin', 'stone', 'flint', 'high', 'lonely', 'giant', 'sharp', 'gray', 'white', 'snow', 'eagles'],
    pass: ['narrow', 'wind', 'cold', 'bitter', 'high', 'wolves', 'snow', 'mist'],
    wood: ['oak', 'elm', 'birch', 'holly', 'pine', 'thorn', 'ash', 'bears', 'secret', 'wild'] };
  static readonly words: Record<Form, string[]> = { river: ['brook', 'stream', 'river'], lake: ['mere', 'lake', 'pool'],
    peak: ['crest', 'peak', 'ridge', 'hill'], pass: ['pass'], wood: ['wood', 'grove'] };
  // How a word reads in a gloss: "swan brook", not "swans brook".
  static readonly glossed: Record<string, string> = { swans: 'swan', eagles: 'eagle', wolves: 'wolf', bears: 'bear' };
  static shape(terrain: string, tongue: string, seed: string, taken: string[]): Landmark[] {
    const rng = new Expressions(seed);
    return (this.forms[terrain] ?? ['river']).map(form => this.landmark(form, tongue, { rng, taken }));
  }
  private static landmark(form: Form, tongue: string, at: { rng: Expressions; taken: string[] }): Landmark {
    const dictionary = tongues.getDictionary(tongue), words = this.words[form];
    const pairs = this.order(this.modifiers[form], at.rng)
      .flatMap(m => this.order(words, at.rng).map(w => [m, w] as [string, string]));
    const named = pairs.map(([modifier, word]) => ({ modifier, word,
      name: dictionary.translate(modifier as never, word as never).trim() }));
    const chosen = named.find(n => at.taken.every(t => !this.confusable(n.name, t))) ?? named[0]!;
    at.taken.push(chosen.name);
    return { id: form, form, name: chosen.name, gloss: `${this.glossed[chosen.modifier] ?? chosen.modifier} ${chosen.word}`,
      tongue: dictionary.name, modifier: chosen.modifier };
  }
  // A list in an order drawn from the seed: the first pick, then the next to fall back on, and so on.
  static order<T>(list: T[], rng: Expressions): T[] {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
      const j = rng.number(`1d${i + 1}`) - 1;
      [out[i], out[j]] = [out[j]!, out[i]!];
    }
    return out;
  }
  // Two names a traveller could take for each other: the same opening, the same run of consonants, or nearly the same
  // letters ("Merscheald" and "Merscstede").
  static confusable(a: string, b: string): boolean {
    const [x, y] = [this.plain(a), this.plain(b)];
    if (!x || !y) { return false; }
    if (x.slice(0, 4) === y.slice(0, 4) || this.skeleton(x) === this.skeleton(y)) { return true; }
    return this.distance(x, y) / Math.max(x.length, y.length) < 0.4;
  }
  private static plain(s: string): string {
    const letters: Record<string, string> = { æ: 'ae', œ: 'oe', ð: 'th', þ: 'th', ø: 'o', ß: 'ss' };
    return s.toLowerCase().normalize('NFD').replace(/[æœðþøß]/g, c => letters[c]!).replace(/[^a-z]/g, '')
      .replace(/^the/, '');
  }
  private static skeleton(s: string): string { return s.replace(/[aeiouy]/g, '').replace(/(.)\1+/g, '$1').slice(0, 4); }
  private static distance(a: string, b: string): number {
    let row = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const next = [i];
      for (let j = 1; j <= b.length; j++) {
        next.push(Math.min(row[j]! + 1, next[j - 1]! + 1, row[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1)));
      }
      row = next;
    }
    return row[b.length]!;
  }
}
