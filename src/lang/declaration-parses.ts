// Each declaration of a module's text, parsed once (AX-04: a new world's start re-parsed 1.4 s of Kyr its generators
// had just written, half of it declarations written the same in a world drawn before: a site's actions and passages,
// whose ids go by the town's place in the country, not by the seed). A declaration's parse is its own: what the
// lowering of one gives depends on its text alone, asking nothing of the kinds installed (the module made of its fields
// does: ModuleMade; a lowering that asks is kept by nothing here: see module), never on where it stands or what else
// the module says (a module's own kinds are declared after: CatalogParser.declare),
// but for the three that keep where they were written (Route, Promise, Occasion: SemanticRecords.span), whose text is
// parsed whole. A text is split at its declarations by a scan that knows strings, comments and braces; the split is
// taken only where the grammar bears it out, each part read as exactly one declaration (ModuleParser.chunked), else
// the text is parsed whole, as before. test/small/declaration-parses: every text the shared rules, the adventures and
// a drawn world give parses the same split as whole.
import type { Module } from './module';
import type { Declared } from './module-source';
import { DeclaredValues } from './declared-values';
import { DeclarationShapes } from './declaration-shapes';
import { ModuleMade, type Field } from './module-made';
import { VocabularyContext } from './vocabulary';

export interface Chunk { text: string; at: number }
// A text matched: its module's id and name, and each declaration's field and text.
export interface Parts { id: string; name: string; fields: Field[]; sources: string[] }
export class DeclarationParses {
  // Declarations that keep where they were written: their text is parsed whole.
  private static readonly placed = /^(Route|Promise|Occasion)\b/;
  // The last few thousand declarations' fields, by their text (the declarations of a country's towns,
  // sites and roads, a world or two of them).
  static readonly kept = new Map<string, Field>();
  static readonly most = 40000;
  // The module's header (through its "{") and each declaration after it, where it is; none where the text is not one
  // module's declarations and its closing brace, or holds one of the placed.
  static split(text: string): { head: string; chunks: Chunk[] } | undefined {
    const open = this.opening(text);
    if (open < 0) { return undefined; }
    const chunks: Chunk[] = [];
    let i = this.skip(text, open + 1);
    while (i < text.length && text[i] !== '}') {
      const end = this.end(text, i);
      if (end < 0) { return undefined; }
      const chunk = text.slice(i, end);
      if (this.placed.test(chunk)) { return undefined; }
      chunks.push({ text: chunk, at: i });
      i = this.skip(text, end);
    }
    return i < text.length && this.skip(text, i + 1) === text.length ? { head: text.slice(0, open + 1), chunks }
      : undefined;
  }
  // The text's declarations, each its kept field where it was parsed before (by the kinds it names and its text), the
  // rest matched together after the module's header (parts) and taken only where each part is exactly one
  // declaration; then the module made of them as a whole parse makes it (ModuleMade). None where the text does not
  // split so, or anything in it does not go so: the text is then parsed whole, and says what is wrong where it is.
  static module(context: VocabularyContext, text: string, declared: readonly Declared[],
    parts: (text: string) => Parts | undefined)
    : Module | undefined {
    const split = this.split(text);
    if (!split) { return undefined; }
    try {
      const keys = split.chunks.map(c => c.text);
      const missing = keys.flatMap((k, i) => this.kept.has(k) ? [] : [i]);
      // Those not kept filled from their shapes, or matched together after the header (DeclarationShapes).
      let header: Parts | undefined;
      const reading = context.reading(() => DeclarationShapes.read(context, missing.map(i => split.chunks[i]!.text),
        texts => {
          const read = parts(`${split.head}\n${texts.join('\n')}\n}`);
          if (!read || read.sources.length !== texts.length || read.sources.some((t, j) => t !== texts[j])) {
            return undefined;
          }
          header ??= read; return read.fields;
        })), found = reading.value;
      const read = header ?? parts(`${split.head}\n}`);
      if (!found || !read) { return undefined; }
      const made = new Map(missing.map((i, j) => [i, found[j]!]));
      // A lowering that asked of the kinds is not kept by its text.
      if (!reading.reads.length) { for (const [i, f] of made) { this.remember(keys[i]!, structuredClone(f)); } }
      const fields = keys.map((k, i) => this.placedAt(made.get(i) ?? structuredClone(this.kept.get(k) as Field), text,
        split.chunks[i]!.at));
      return DeclaredValues.during(declared, () => ModuleMade.of(context, { id: read.id, name: read.name, fields,
        starts: split.chunks.map(c => c.at), text }, (i, run) => this.at(text, split.chunks[i]!.at, run)));
    } catch { return undefined; }
  }
  // A Situation keeps where it was written as its declaration's start (SemanticRecords.span): split, that is where
  // its part begins in the whole text, not in the text the part was read in (a world's region, which holds every
  // first town's trouble, is read split; parsed whole for it, the start would lose what AX-04 won).
  private static placedAt(field: Field, text: string, start: number): Field {
    const f = field as { field?: string; value?: { span?: { line: number; column: number } } };
    if (f.field !== 'situation' || !f.value?.span) { return field; }
    const before = text.slice(0, start).split('\n');
    f.value.span = { line: before.length, column: before.at(-1)!.length + 1 };
    return field;
  }
  // An error in a declaration of a text split, said with the line and column it begins at in the text.
  private static at<T>(text: string, start: number, run: () => T): T {
    try { return run(); } catch (error) {
      const before = text.slice(0, start).split('\n'), message = error instanceof Error ? error.message : String(error);
      throw new Error(`Line ${before.length}, col ${before.at(-1)!.length + 1}: ${message}`);
    }
  }
  static remember(key: string, field: Field): void {
    if (this.kept.size >= this.most) { this.kept.delete(this.kept.keys().next().value!); }
    this.kept.set(key, field);
  }
  // Where the module's own "{" is: after Module, its id and its name.
  private static opening(text: string): number {
    const m = /^\s*Module\s+\w+\s+"(?:[^"\\]|\\.)*"\s*\{/.exec(this.uncommented(text));
    return m ? m[0].length - 1 : -1;
  }
  // The text's leading comments blanked (the header is read past them), its length kept.
  private static uncommented(text: string): string {
    let out = '', i = 0;
    for (;;) {
      const k = this.skip(text, i);
      out += ' '.repeat(k - i);
      if (k === i || text.startsWith('Module', k)) { return out + text.slice(k); }
      i = k;
    }
  }
  // Past white space and comments.
  private static skip(text: string, i: number): number {
    for (;;) {
      while (i < text.length && /\s/.test(text[i]!)) { i++; }
      if (!text.startsWith('//', i)) { return i; }
      while (i < text.length && text[i] !== '\n') { i++; }
    }
  }
  // Where a declaration begun at i ends: after its "." at the module's own depth (a "." not before a digit), or after
  // the "}" that closes its braces; -1 where the text ends first.
  private static end(text: string, i: number): number {
    let depth = 0;
    for (; i < text.length; i++) {
      const c = text[i]!;
      if (c === '"') { i = this.string(text, i); if (i < 0) { return -1; } continue; }
      if (c === '/' && text[i + 1] === '/') { while (i < text.length && text[i] !== '\n') { i++; } continue; }
      if (c === '{') { depth++; continue; }
      if (c === '}') {
        if (depth === 0) { return -1; }
        if (--depth === 0) { return this.after(text, i + 1); }
        continue;
      }
      if (c === '.' && depth === 0 && !/\d/.test(text[i + 1] ?? '')) { return i + 1; }
    }
    return -1;
  }
  // A declaration whose braces have closed may still go on (a topic's "once", an event's "then { … }"): it ends there
  // only where what follows begins another declaration or closes the module.
  private static after(text: string, i: number): number {
    const k = this.skip(text, i);
    return k >= text.length || text[k] === '}' || /^[A-Z][a-z]*\b/.test(text.slice(k, k + 16)) ? i
      : this.end(text, i);
  }
  // Past a string begun at i: its closing quote, escapes kept; -1 where it never closes.
  private static string(text: string, i: number): number {
    for (i++; i < text.length; i++) {
      if (text[i] === '\\') { i++; continue; }
      if (text[i] === '"') { return i; }
    }
    return -1;
  }
}
