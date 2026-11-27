import type { ModuleParser } from './module-parser';
import type { Module } from './module';
import type { Declared } from './module-source';
import { VocabularyContext, type ReadAmong } from './vocabulary';
import { KeptParses } from './kept-parses';
import { ParseCache } from './parse-cache';
import { ModuleMade } from './module-made';
import { DeclaredValues } from './declared-values';
import { DeclarationParses, type Parts } from './declaration-parses';
import { Grammars } from './grammars';

export class ModuleReads {
  static parse(parser: typeof ModuleParser, context: VocabularyContext, text: string,
    declared: readonly Declared[]): Module {
    const key = KeptParses.key(context, text, declared);
    const known = ParseCache.get(context, key);
    const began = performance.now();
    if (known) { context.install(known.catalog); return structuredClone(known); }
    const split = context.reading(() => this.chunked(parser, context, text, declared)), matched = performance.now();
    const reading = split.value ? split as ReadAmong<Module>
      : context.reading(() => this.whole(parser, context, text, declared)), lowered = performance.now();
    const bytes = ParseCache.costs ? new TextEncoder().encode(text).byteLength : text.length;
    ParseCache.costs?.note('parse match', matched - began, { bytes });
    ParseCache.costs?.note('parse lower', lowered - matched, { bytes });
    ParseCache.set(context, key, reading, { ms: lowered - began, bytes });
    return reading.value;
  }
  static syntax(parser: typeof ModuleParser, text: string, declared: readonly Declared[] = []): Module {
    return this.parse(parser, VocabularyContext.none, text, declared);
  }
  static whole(parser: typeof ModuleParser, context: VocabularyContext, text: string,
    declared: readonly Declared[]): Module {
    const match = parser.grammar.match(text);
    if (match.failed()) { throw new Error(`Invalid Kyr module: ${Grammars.why(text)}`); }
    const made = parser.semantics(match).ast() as Omit<Parameters<typeof ModuleMade.of>[1], 'text'>;
    return DeclaredValues.during(declared, () => ModuleMade.of(context, { ...made, text },
      (i, run) => parser.locatedByStart(made.starts[i]!, text, run)));
  }
  static wholeSyntax(parser: typeof ModuleParser, text: string, declared: readonly Declared[] = []): Module {
    return this.whole(parser, VocabularyContext.none, text, declared);
  }
  static chunked(parser: typeof ModuleParser, context: VocabularyContext, text: string,
    declared: readonly Declared[]): Module | undefined {
    return DeclarationParses.module(context, text, declared, t => {
      const match = parser.grammar.match(t);
      return match.failed() ? undefined : parser.semantics(match).parts() as Parts;
    });
  }
  static chunkedSyntax(parser: typeof ModuleParser, text: string, declared: readonly Declared[] = []):
    Module | undefined {
    return this.chunked(parser, VocabularyContext.none, text, declared);
  }
}
