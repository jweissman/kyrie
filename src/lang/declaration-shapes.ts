import type { Field } from './module-made';
import type { Module } from './module';
import { ParseCache } from './parse-cache';
import { VocabularyContext } from './vocabulary';

// A declaration's shape: its text with what a generator fills in taken out (AX-04: a new world's 1.4 MB of Kyr is some
// fifteen hundred shapes, much the same in every world, filled with its own names and words). A string with no escape
// in it, and a name with a digit in it (a drawn place's or person's id: s2_merchant, w4_track), each stand as a mark,
// one mark to a value however often it is written, so that a shape keeps which of its names are the same. A shape met
// a second time is parsed, and is known from then on where its field, filled with the text's values, is the text's own
// field (a string of Kyr's own, as an ability's program, is not: its shape is parsed no more). Its declarations are
// then filled, not parsed. Known shapes are kept with the parses (ParseCache.store), one entry for them all. A
// declaration with a call in it is filled too, where its calls were written moved by its values' lengths (fill): it had
// been parsed every time (2 318 of a fresh s0's declarations, 510 KB of the 767 the grammar matched, 28 November).
// test/small/declaration-shapes: every text of the shared rules, the adventures and drawn worlds the same so as parsed.
export interface Shape { text: string; values: string[] }
type Known = Field | 'text' | number;
export class DeclarationShapes {
  private static readonly mark = /qz(\d+)zq/g;
  // A string, or a name with a digit in it that is a whole name of Kyr's (letters, digits, "_" and "-").
  private static readonly filled = /"([^"\\\n\r]*)"|(?<![\w-])([A-Za-z][\w-]*\d[\w-]*)(?![\w-])/g;
  // Each shape's field, by its text; 'text' for one whose filling is not its text's parse, and how many
  // times one has been met that is not parsed yet.
  static readonly known = new Map<string, Known>();
  static readonly most = 30000;
  private static readonly key = '\u0001declaration shapes 5';
  // How many declarations have been filled, not parsed (what test/small/declaration-shapes reads).
  static fills = 0;
  private static loaded = false;
  private static fresh = 0;
  static of(text: string): Shape | undefined {
    if (/qz\d+zq/.test(text) || /^Relation\b/.test(text)) { return undefined; }
    const values: string[] = [], index = new Map<string, number>();
    const shaped = text.replace(this.filled, (whole, string?: string, name?: string) =>
      string !== undefined ? `"${this.marked(string, values, index)}"`
        : name !== undefined ? this.marked(name, values, index) : whole);
    return { text: shaped, values };
  }
  // A value's mark: the same for the same value.
  private static marked(value: string, values: string[], index: Map<string, number>): string {
    let i = index.get(value);
    if (i === undefined) { i = values.push(value) - 1; index.set(value, i); }
    return `qz${i}zq`;
  }
  // The shape's field filled with a text's values; none where a mark is missing from it (a value the parse let go).
  // Where its calls were written (callSpans, by the character from the declaration's start: the symbol table's
  // references) is moved as each value is longer or shorter than its mark (shape: the shape's text), and each still
  // names the call of the field it is in: a part met twice in the field is one copy (seen).
  static fill(field: Field, values: readonly string[], shape?: string): Field | undefined {
    const used = new Set<number>(), made = this.walk(field, values, { used, seen: new Map() }) as Field;
    if (used.size !== values.length) { return undefined; }
    if (made.callSpans?.length) {
      if (shape === undefined) { return undefined; }
      const marks = this.marks(shape, values);
      for (const c of made.callSpans) {
        c.name = this.moved(c.name, marks);
        c.args = c.args.map(a => this.moved(a, marks));
      }
    }
    return made;
  }
  // Where each mark of the shape's text ends, and how much longer its value is than it.
  private static marks(shape: string, values: readonly string[]): { end: number; by: number }[] {
    return [...shape.matchAll(this.mark)].map(m => ({ end: m.index + m[0].length,
      by: values[+m[1]!]!.length - m[0].length }));
  }
  // A span of the shape's text as it is in the text: each mark ending at or before a place moves it on.
  private static moved(s: { at: number; end: number }, marks: { end: number; by: number }[]):
    { at: number; end: number } {
    let at = s.at, end = s.end;
    for (const m of marks) {
      if (m.end <= s.at) { at += m.by; }
      if (m.end <= s.end) { end += m.by; }
    }
    return { at, end };
  }
  // A part of a field copied, each mark in its strings and keys put back as its value (and noted used).
  private static walk(v: unknown, values: readonly string[], at: { used: Set<number>; seen: Map<object, unknown> }):
    unknown {
    if (typeof v === 'string') { return v.includes('qz') ? this.put(v, values, at.used) : v; }
    if (!v || typeof v !== 'object') { return v; }
    const seen = at.seen.get(v);
    if (seen !== undefined) { return seen; }
    if (Array.isArray(v)) {
      const out: unknown[] = [];
      at.seen.set(v, out);
      for (const x of v) { out.push(this.walk(x, values, at)); }
      return out;
    }
    const out: Record<string, unknown> = {};
    at.seen.set(v, out);
    for (const [k, x] of Object.entries(v)) {
      out[k.includes('qz') ? this.put(k, values, at.used) : k] = this.walk(x, values, at);
    }
    return out;
  }
  private static put(s: string, values: readonly string[], used: Set<number>): string {
    return s.replace(this.mark, (_m, i: string) => { used.add(+i); return values[+i]!; });
  }
  // The fields of declarations not kept by their text: each filled from its shape where the shape is known, the rest
  // parsed (parse: declarations' texts read together, a field for each, or none); and the shapes met a second time
  // parsed beside them, each known where its first text's filling is that text's own field.
  static read(context: VocabularyContext, texts: readonly string[],
    parse: (texts: string[]) => Field[] | undefined): Field[] | undefined {
    this.load();
    const shapes = texts.map(t => this.of(t)), keys = shapes.map(s => s?.text);
    const out: (Field | undefined)[] = texts.map((_t, i) => this.filling(keys[i], shapes[i]));
    const plain = texts.flatMap((_t, i) => out[i] ? [] : [i]);
    const reading = context.reading(() => parse(plain.map(i => texts[i]!))), read = reading.value;
    if (!read) { return undefined; }
    plain.forEach((i, j) => { out[i] = read[j]; });
    // A shape is a lowering of its text alone: one that asked of the kinds installed is learnt by none.
    if (reading.reads.length) { return out as Field[]; }
    const learning = this.learning(plain.map(i => keys[i]));
    const learnt = learning.map(j => plain[j]!), shaped = this.shaped(learnt.map(i => shapes[i]!.text), parse);
    learnt.forEach((i, j) => {
      const field = shaped[j], filled = field && this.fill(field, shapes[i]!.values, keys[i]);
      this.remember(keys[i]!, field && filled && JSON.stringify(filled) === JSON.stringify(out[i]) ? field : 'text');
    });
    if (plain.length) { this.save(plain.length); }
    return out as Field[];
  }
  // Of the keys parsed as text, the first of each shape now met a second time (counted), by its place among them.
  private static learning(keys: readonly (string | undefined)[]): number[] {
    const first = new Map<string, number>();
    keys.forEach((k, j) => {
      const was = k ? this.known.get(k) : 'text';
      if (k && (was === undefined || typeof was === 'number')) {
        this.known.set(k, (typeof was === 'number' ? was : 0) + 1);
        if (!first.has(k)) { first.set(k, j); }
      }
    });
    return [...first].filter(([k]) => (this.known.get(k) as number) >= 2).map(([, j]) => j);
  }
  // The shapes' fields, read together, or each alone where together they are not (a string of Kyr's own a mark cannot
  // stand for): none for a shape that is not read.
  private static shaped(texts: string[], parse: (texts: string[]) => Field[] | undefined): (Field | undefined)[] {
    if (!texts.length) { return []; }
    return this.tried(texts, parse) ?? texts.map(t => this.tried([t], parse)?.[0]);
  }
  private static tried(texts: string[], parse: (texts: string[]) => Field[] | undefined): Field[] | undefined {
    try { return parse(texts); } catch { return undefined; }
  }
  private static filling(key: string | undefined, shape: Shape | undefined): Field | undefined {
    const field = key ? this.known.get(key) : undefined;
    const made = field && typeof field === 'object' ? this.fill(field, shape!.values, key) : undefined;
    if (made) { this.fills++; }
    return made;
  }
  private static remember(key: string, field: Known): void {
    if (this.known.delete(key) || this.known.size < this.most) { this.known.set(key, field); return; }
    this.known.delete(this.known.keys().next().value!); this.known.set(key, field);
  }
  // Read from the store once there is one; written back as declarations are met that were not filled, some hundreds at
  // a time (one lost is only parsed again): those known, and those counted, so that a shape met once in each of two
  // worlds is known in the second (a shape met once in a world had been counted and let go with its process: on a
  // fresh s0, 1 116 declarations, 219 KB of what the grammar matched).
  private static load(): void {
    if (this.loaded || !ParseCache.store) { return; }
    this.loaded = true;
    const kept = ParseCache.store.get(this.key) as unknown as [string, Known][] | undefined;
    for (const [k, v] of kept ?? []) { if (!this.known.has(k)) { this.known.set(k, v); } }
  }
  private static save(met: number): void {
    this.fresh += met;
    if (this.fresh < 512 || !ParseCache.store) { return; }
    this.fresh = 0;
    ParseCache.store.set(this.key, [...this.known] as unknown as Module);
  }
}
