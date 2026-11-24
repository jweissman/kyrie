import { SeededStream } from './seeded-stream';

// New names in the manner of names already given (the owner, 24 November: "a Markov chain for name generation, so that
// authors can roll up truly new names and automatically exclude duplicates from existing adventures"). A chain of
// letters, each drawn by the few before it as they follow one another in the names it learnt from. A name it draws is
// offered only if it is apart from every name it learnt and every name excluded (what the adventures and the setting
// already give): none of them, no beginning of one, none begun by one, none within one and none holding one (the
// owner: "no subsets or prefixes of existing names"; a name of three letters or fewer is held against a name drawn only
// as itself, so that Ann and Bet do not refuse every name with an "ann" or a "bet" in it). Of many drawn, the best are
// offered, shorter names first and those that sound well (the owner: "favor shorter names for memorability, and a light
// phonaesthetic ranking"): how readily its letters follow one another in the names learnt, less a little for each
// letter past five, and less for three consonants or three vowels together.
export class NameChain {
  private readonly next = new Map<string, Map<string, number>>();
  private readonly learnt: Set<string>;
  private readonly shortest: number;
  private readonly longest: number;
  // order: how many letters a letter is drawn by (two reads as names do; three keeps close to the names learnt).
  constructor(names: readonly string[], private readonly order = 2) {
    const clean = [...new Set(names.filter(n => /^[A-Za-z'’-]{2,}$/.test(n)).map(n => n.toLowerCase()))];
    if (!clean.length) { throw new Error('A chain of names needs names to learn from'); }
    this.learnt = new Set(clean);
    // As long as most of them are: the longest tenth of a few dozen names had drawn names of a dozen letters.
    const lengths = clean.map(n => n.length).sort((a, b) => a - b);
    this.shortest = Math.max(3, lengths[0]!);
    this.longest = Math.max(this.shortest, lengths[Math.floor((lengths.length - 1) * 0.9)]!);
    for (const name of clean) { this.learn(name); }
  }
  private learn(name: string): void {
    const padded = `${'^'.repeat(this.order)}${name}$`;
    for (let i = this.order; i < padded.length; i++) {
      const before = padded.slice(i - this.order, i), counts = this.next.get(before) ?? new Map<string, number>();
      counts.set(padded[i]!, (counts.get(padded[i]!) ?? 0) + 1);
      this.next.set(before, counts);
    }
  }
  // As many new names as asked, the best of some twenty times as many drawn, by the random numbers given (a seeded
  // stream, so that a draw can be had again); fewer where the chain has no more new ones in it.
  // words: what may not be drawn as it is, though a name may hold it (the language's words: "Mice", "Got").
  draw(count: number, random: () => number, excluded: ReadonlySet<string> = new Set(),
    words: ReadonlySet<string> = new Set()): string[] {
    return this.ranked(count, random, excluded, words).map(([name]) => name);
  }
  // The same, each with its score.
  ranked(count: number, random: () => number, excluded: ReadonlySet<string> = new Set(),
    words: ReadonlySet<string> = new Set()): [string, number][] {
    const pool = new Set<string>(), tried = new Set<string>(), against = [...this.learnt, ...excluded];
    for (let tries = 0; pool.size < count * 20 && tries < count * 1000; tries++) {
      const name = this.one(random), key = name.toLowerCase();
      // Each drawn once is judged once: most draws are drawn again.
      if (!name || tried.has(key)) { continue; }
      tried.add(key);
      if (!words.has(key) && !/(.)\1\1/.test(key) && this.apart(key, against)) { pool.add(name); }
    }
    return [...pool].map(n => [n, this.score(n)] as [string, number])
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, count);
  }
  // Apart from every name given: not one, not a beginning or a part of one, and (of four letters or more) none is its
  // beginning or a part of it.
  private apart(key: string, names: readonly string[]): boolean {
    return !names.some(e => e.startsWith(key) || e.includes(key) || e.length >= 4 && key.includes(e));
  }
  // How well a name sounds, as the names learnt sound: the mean likelihood of each of its letters after those before
  // it (and of its ending), less 0.25 for each letter past five and 1 for each run of three consonants or vowels.
  score(name: string): number {
    const padded = `${'^'.repeat(this.order)}${name.toLowerCase()}$`;
    let sum = 0;
    for (let i = this.order; i < padded.length; i++) {
      const counts = this.next.get(padded.slice(i - this.order, i));
      const total = counts ? [...counts.values()].reduce((a, b) => a + b, 0) : 0;
      sum += Math.log(((counts?.get(padded[i]!) ?? 0) + 0.1) / (total + 1));
    }
    const runs = name.toLowerCase().match(/[^aeiouy]{3,}|[aeiouy]{3,}/g)?.length ?? 0;
    return sum / (padded.length - this.order) - 0.25 * Math.max(0, name.length - 5) - runs;
  }
  private one(random: () => number): string {
    let name = '', before = '^'.repeat(this.order);
    while (name.length <= this.longest) {
      const letter = this.pick(this.next.get(before), random);
      if (!letter || letter === '$') { break; }
      name += letter; before = (before + letter).slice(-this.order);
    }
    return name.length >= this.shortest && name.length <= this.longest
      ? name.charAt(0).toUpperCase() + name.slice(1) : '';
  }
  private pick(counts: Map<string, number> | undefined, random: () => number): string | undefined {
    if (!counts) { return undefined; }
    let left = random() * [...counts.values()].reduce((a, b) => a + b, 0);
    for (const [letter, n] of counts) { left -= n; if (left < 0) { return letter; } }
    return [...counts.keys()].at(-1);
  }
  // A stream of numbers in [0, 1) from a seed's words, the same for the same seed (Deem's expressions are too dear to
  // draw a letter by).
  static random(seed: string): () => number { const stream = new SeededStream(seed); return stream.next.bind(stream); }
}
