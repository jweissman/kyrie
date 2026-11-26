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
// then filled, not parsed. Known shapes are kept with the parses (ParseCache.store), one entry for them all.
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
  private static readonly key = '\u0001declaration shapes 2';
  // How many declarations have been filled, not parsed (what test/small/declaration-shapes reads).
  static fills = 0;
  private static loaded = false;
  private static fresh = 0;
  static of(text: string): Shape | undefined {
    if (/qz\d+zq/.test(text)) { return undefined; }
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
  static fill(field: Field, values: readonly string[]): Field | undefined {
    const used = new Set<number>(), made = this.walk(field, values, used) as Field;
    return used.size === values.length ? made : undefined;
  }
  // A part of a field copied, each mark in its strings and keys put back as its value (and noted used).
  private static walk(v: unknown, values: readonly string[], used: Set<number>): unknown {
    if (typeof v === 'string') { return v.includes('qz') ? this.put(v, values, used) : v; }
    if (Array.isArray(v)) { return v.map(x => this.walk(x, values, used)); }
    if (v && typeof v === 'object') {
      return Object.fromEntries(Object.entries(v).map(([k, x]) =>
        [k.includes('qz') ? this.put(k, values, used) : k, this.walk(x, values, used)]));
    }
    return v;
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
      const field = shaped[j], filled = field && this.fill(field, shapes[i]!.values);
      this.remember(keys[i]!, field && filled && JSON.stringify(filled) === JSON.stringify(out[i]) ? field : 'text');
    });
    if (learnt.length) { this.save(learnt.length); }
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
    const made = field && typeof field === 'object' ? this.fill(field, shape!.values) : undefined;
    if (made) { this.fills++; }
    return made;
  }
  private static remember(key: string, field: Known): void {
    if (this.known.delete(key) || this.known.size < this.most) { this.known.set(key, field); return; }
    this.known.delete(this.known.keys().next().value!); this.known.set(key, field);
  }
  // Read from the store once there is one; written back as shapes become known, a few hundred at a time (one lost is
  // only parsed again), and only those known, not those counted.
  private static load(): void {
    if (this.loaded || !ParseCache.store) { return; }
    this.loaded = true;
    const kept = ParseCache.store.get(this.key) as unknown as [string, Known][] | undefined;
    for (const [k, v] of kept ?? []) { if (!this.known.has(k)) { this.known.set(k, v); } }
  }
  private static save(learnt: number): void {
    this.fresh += learnt;
    if (this.fresh < 256 || !ParseCache.store) { return; }
    this.fresh = 0;
    ParseCache.store.set(this.key, [...this.known].filter(([, v]) => typeof v !== 'number') as unknown as Module);
  }
}
