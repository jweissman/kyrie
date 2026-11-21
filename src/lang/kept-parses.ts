import type { Module } from './module';
import type { Declared } from './module-source';
import { ParseCache } from './parse-cache';
import { Vocabularies } from './vocabulary';

// A parse kept, uncopied, for a caller that changes nothing of it: a cache of its own that copies what it hands out
// (ModuleBundle's parses, and what it reads ahead), a reading of a country's places (Composition.region). Copying every
// kept parse as it was read ahead had been 0.4 s of a start (OR-144's profile; ModuleParser.parse copies each one it
// gives, for callers that change it). Proved unwritten frozen (test/small/frozen-modules).
export class KeptParses {
  // What a parse is kept by: the vocabulary and kinds it was read among, its text, and what was declared for it as
  // values (ModuleSource), as ModuleParser.parse keeps it.
  static key(text: string, declared: readonly Declared[] = []): string {
    return `${Vocabularies.seen(text)}\u0000${text}${declared.length ? `\u0000${JSON.stringify(declared)}` : ''}`;
  }
  // The kept parse, or the text parsed (ModuleParser.parse keeps a copy of its own).
  static of(text: string, declared: readonly Declared[], parse: (t: string, d: readonly Declared[]) => Module): Module {
    const known = ParseCache.get(this.key(text, declared));
    if (known) { Vocabularies.install(known.catalog); return known; }
    return parse(text, declared);
  }
}
