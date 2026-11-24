import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import folk from '../../data/generation/scenes/folk.json';
import naming from '../../data/generation/scenes/naming.json';
import { AdventureNames } from './adventure-names';
import { NameChain } from './name-chain';

type ByPeople = Record<string, Record<string, string[]> | string[]>;
export interface NameAsk { kind: 'given' | 'family' | 'place'; people: string; sex?: string; like?: string }
// Names to draw new ones from, and the names a new one may not be: `kyrie suggest names`. A people's given and family
// names are the setting's (data/generation/scenes: folk.json and naming.json), a place's the adventures' own proper
// place names; or one adventure's own, to draw names in its manner (--like). Excluded is every name the setting and the
// adventures give (AdventureNames: surnames and places, first names too), so that what is drawn is free to use.
export class SuggestNames {
  static readonly root = resolve(import.meta.dir, '../../data/adventures');
  // The names learnt from, for what is asked.
  static corpus(ask: NameAsk): string[] {
    if (ask.like) { return this.adventure(ask.like, ask.kind); }
    if (ask.kind === 'place') { return this.places(); }
    const table = (ask.kind === 'family' ? folk.family : folk.given) as ByPeople;
    const more = ask.kind === 'given' ? (naming.more as ByPeople)[ask.people] : undefined;
    return [...this.flat(table[ask.people], ask.sex), ...this.flat(more, ask.sex)];
  }
  static peoples(kind: NameAsk['kind']): string[] {
    return Object.keys(kind === 'family' ? folk.family : folk.given);
  }
  private static flat(names: Record<string, string[]> | string[] | undefined, sex?: string): string[] {
    if (!names) { return []; }
    return Array.isArray(names) ? names : sex ? names[sex] ?? [] : Object.values(names).flat();
  }
  // Every name already given, lowercased: the setting's tables for every people, and the adventures' people and places.
  // (Read once a process: every adventure's texts are read for it.)
  private static kept?: { excluded: Set<string>; words: Set<string>; texts: string[] };
  static excluded(): Set<string> { return new Set(this.read().excluded); }
  private static read(): { excluded: Set<string>; words: Set<string>; texts: string[] } {
    if (this.kept) { return this.kept; }
    const texts = this.texts(), words = new Set(texts.join('\n').match(/\b[a-z][a-z'’-]+\b/g));
    this.kept = { excluded: this.given(), words, texts };
    return this.kept;
  }
  private static given(): Set<string> {
    const out = new Set<string>();
    for (const table of [folk.given, folk.family, naming.more] as ByPeople[]) {
      for (const names of Object.values(table)) { for (const n of this.flat(names)) { out.add(n.toLowerCase()); } }
    }
    for (const name of AdventureNames.read(this.root).keys()) {
      for (const word of name.replace(/^\w+: /, '').split(/\s+/)) { out.add(word.toLowerCase()); }
    }
    for (const first of AdventureNames.firsts().keys()) { out.add(first.toLowerCase()); }
    return out;
  }
  // The adventures' place names, word by word, that are proper names: never written in lower case in any adventure's
  // text (a Gate, a Row and a Hill are words; a Quittance and a Mortmain are names).
  static places(): string[] {
    const common = this.words();
    return this.declared(this.read().texts, 'Place').filter(w => !common.has(w.toLowerCase()));
  }
  // The words the adventures write in lower case: the language's, not names.
  private static words(): Set<string> { return this.read().words; }
  // One adventure's own names of a kind: its people's first names, or their surnames, or its places' words.
  private static adventure(id: string, kind: NameAsk['kind']): string[] {
    const texts = this.texts(id), common = this.words();
    const people = [...texts.join('\n').matchAll(/^\s*Person\s+\w+\s+"([^"]+)"/gm)]
      .map(m => m[1]!.split(/\s+/).filter(w => /^[A-Z][a-z]+$/.test(w) && !AdventureNames.titles.has(w)));
    const words = kind === 'place' ? this.declared(texts, 'Place')
      : people.flatMap(w => kind === 'given' ? w.slice(0, 1) : w.length > 1 ? [w.at(-1)!] : []);
    return words.filter(w => !common.has(w.toLowerCase()));
  }
  private static declared(texts: string[], kind: 'Place' | 'Person'): string[] {
    return [...texts.join('\n').matchAll(new RegExp(`^\\s*${kind}\\s+\\w+\\s+"([^"]+)"`, 'gm'))]
      .flatMap(m => m[1]!.replace(/['’]s\b/g, '').split(/\s+/).filter(w => /^[A-Z][a-z-]+$/.test(w)));
  }
  private static texts(only?: string): string[] {
    const dirs = readdirSync(this.root, { withFileTypes: true })
      .filter(d => d.isDirectory() && (!only || d.name === only));
    if (only && !dirs.length) { throw new Error(`No adventure ${only} in data/adventures`); }
    return dirs.flatMap(d => readdirSync(join(this.root, d.name)).filter(f => /\.kyrt?$/.test(f))
      .map(f => readFileSync(join(this.root, d.name, f), 'utf8')));
  }
  // New names, each free: drawn from the corpus by a chain of the order given, none already given anywhere.
  static draw(ask: NameAsk, at: { count: number; seed: string; order?: number }): string[] {
    return this.ranked(ask, at).map(([name]) => name);
  }
  // The same, best first, each with how well it sounds (NameChain.score).
  static ranked(ask: NameAsk, at: { count: number; seed: string; order?: number }): [string, number][] {
    const corpus = this.corpus(ask), chain = new NameChain(corpus, at.order ?? 2);
    // A given name or a place's is no word of the language ("Mice", "Got"); a family's may be (Holt, Brook, Crane).
    const words = ask.kind === 'family' ? new Set<string>() : this.words();
    return chain.ranked(at.count, NameChain.random(at.seed), this.read().excluded, words);
  }
}
