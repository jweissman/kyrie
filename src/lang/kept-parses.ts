import type { Module } from './module';
import type { Declared } from './module-source';
import { ParseCache } from './parse-cache';
import { Vocabularies, type Vocabulary } from './vocabulary';

// A parse kept, uncopied, for a caller that changes nothing of it: a cache of its own that copies what it hands out
// (ModuleBundle's parses, and what it reads ahead), a reading of a country's places (Composition.region). Copying every
// kept parse as it was read ahead had been 0.4 s of a start (OR-144's profile; ModuleParser.parse copies each one it
// gives, for callers that change it). Proved unwritten frozen (test/small/frozen-modules).
export class KeptParses {
  // Read every file among all the kinds its siblings declare, until each sees the same final vocabulary.
  static together<T>(files: readonly T[], vocabulary: Vocabulary, text: (file: T) => string,
    parse: (file: T, index: number) => Module): Module[] {
    const seen = new Set<string>(), parts: ({ module: Module; after: string; stable: boolean } | undefined)[]
      = new Array(files.length);
    let last: { error: unknown } | undefined;
    for (let pass = 0; pass <= files.length * 2 + 1; pass++) {
      const before = this.signature(files, vocabulary, text);
      if (seen.has(before)) {
        if (last) { throw last.error; }
        throw new Error('Module kinds do not stabilize across files');
      }
      seen.add(before);
      const failures: { error: unknown }[] = [];
      for (const [i, file] of files.entries()) {
        if (parts[i]?.stable && parts[i]?.after === this.signature(files, vocabulary, text)) { continue; }
        const dependency = Vocabularies.key(vocabulary, this.inherited(text(file)));
        try {
          const module = parse(file, i);
          parts[i] = { module, after: this.signature(files, vocabulary, text),
            stable: dependency === Vocabularies.key(vocabulary, this.inherited(text(file))) };
        }
        catch (error) { failures.push({ error }); }
      }
      const after = this.signature(files, vocabulary, text);
      if (!failures.length && parts.every(part => part?.stable && part.after === after)) {
        return parts.map(part => part!.module);
      }
      if (before === after) {
        if (failures.length) { throw failures[0]!.error; }
        throw new Error('Module kinds do not stabilize across files');
      }
      last = failures[0];
    }
    if (last) { throw last.error; }
    throw new Error('Module kinds do not stabilize across files');
  }
  private static signature<T>(files: readonly T[], vocabulary: Vocabulary, text: (file: T) => string): string {
    return vocabulary.fingerprint?.() ?? JSON.stringify(files.map(file => Vocabularies.key(vocabulary, text(file))));
  }
  private static inherited(text: string): string {
    const names = [...text.matchAll(/like(?:\s|\/\/[^\n]*)*[\p{L}\p{M}_][\p{L}\p{M}\p{N}_-]*/gu)]
      .map(match => match[0]);
    return [...names, ...text.includes('worn') ? ['worn'] : []].join('\n');
  }
  // What a parse is kept by: the vocabulary and kinds it was read among, its text, and what was declared for it as
  // values (ModuleSource), as ModuleParser.parse keeps it.
  static key(text: string, declared: readonly Declared[] = [], vocabulary: Vocabulary = Vocabularies): string {
    return `${Vocabularies.key(vocabulary, text)}\u0000${text}${declared.length
      ? `\u0000${JSON.stringify(declared)}` : ''}`;
  }
  // The kept parse, or the text parsed (ModuleParser.parse keeps a copy of its own).
  static of(text: string, declared: readonly Declared[],
    parse: (t: string, d: readonly Declared[], v: Vocabulary) => Module,
    vocabulary: Vocabulary = Vocabularies): Module {
    const known = ParseCache.get(this.key(text, declared, vocabulary));
    if (known) { vocabulary.install(known.catalog); return known; }
    return parse(text, declared, vocabulary);
  }
}
