import type { Module } from './module';
import type { Field } from './module-made';
import { DeclarationParses, type Parts } from './declaration-parses';
import { ModuleParser } from './module-parser';
import { KyrText } from './kyr-text';
import { ParseCache } from './parse-cache';

// A template's Kyr read once and filled as values (AX-04's next step, OR-1900; doc/architecture/mission-22/
// generated-ir.md): the lines a generator fills from a template (data/generation/**/*.kyrt: "{w}_hall", "{town}" in a
// string), each placeholder made a hole, as DeclarationShapes marks a declaration's, and the declarations of those
// lines parsed once for the holes (kept in the process and with the parses: ParseCache.store), not once for each
// place the template is written for. Each use fills the holes of each declaration's field with its values, the field
// its filled text would have parsed to: test/generated-ir holds the two to one module and one game.
// A hole stands for its value where the value goes into a string (any words: a brace escaped there is the brace the
// string keeps, KyrText.brace), where it is a name or part of one (letters, digits and "_"), or where it is a whole
// number; anything else is put in as its text, which the holed lines then hold as the filled ones do. A declaration
// whose field does not hold every hole in its lines is written as its text, as is every declaration that is read
// with the module's other fields rather than declared alone (a module's own kinds, a capability, an ending, a
// relation's signature, a situation's place in its file).
export interface Held { from: number; to: number; field?: Field }
interface Mark { fill: string; number: boolean }
interface Holed { lines: string[]; marks: Mark[]; used: Set<number>[] }
export class TemplateShapes {
  private static readonly placeholder = /\{(!?)([a-z]+)\}/y;
  private static readonly mark = /qz(\d+)zq/g;
  private static readonly numbered = /90909(\d{4})/g;
  private static readonly base = 909090000;
  private static readonly key = '\u0001template shapes 1\u0000';
  // Of each holed text, its declarations, by their lines; null where its lines are not each a declaration's own.
  static readonly known = new Map<string, Held[] | null>();
  static readonly most = 20000;
  // How many declarations were filled from their holes (what test/generated-ir reads).
  static fills = 0;
  // Read with the module's fields (ModuleMade, CatalogParser.declare, Endings.rank, DeclarationParses.placedAt), or
  // kept with where its line is (a relation's signature types): never declared alone.
  private static readonly together = new Set(['localkind', 'localspecies', 'ending', 'situation', 'relation']);
  // The declarations of lines filled from a template with these values, each over its lines (from, to), with its
  // field where it is filled from its holes; none where the lines are not each a declaration's own.
  static declared(lines: readonly string[], values: Record<string, string>): Held[] | undefined {
    const holed = this.holed(lines, values);
    if (!holed) { return undefined; }
    const shape = this.shape(holed.lines);
    if (!shape) { return undefined; }
    return shape.map(h => {
      if (!h.field) { return { from: h.from, to: h.to }; }
      const used = new Set<number>(), field = this.walk(h.field, holed.marks, used) as Field;
      const wanted = new Set(holed.used.slice(h.from, h.to + 1).flatMap(u => [...u]));
      const whole = used.size === wanted.size && [...used].every(i => wanted.has(i));
      if (whole) { this.fills++; }
      return whole ? { from: h.from, to: h.to, field } : { from: h.from, to: h.to };
    });
  }
  // The lines with their holes marked: a value as a mark (the same mark for the same value), or as its text.
  private static holed(lines: readonly string[], values: Record<string, string>): Holed | undefined {
    const marks: Mark[] = [], index = new Map<string, number>(), used: Set<number>[] = [];
    const out: string[] = [];
    for (const line of lines) {
      if (/qz\d+zq|90909/.test(line)) { return undefined; }
      const u = new Set<number>(), made = this.line(line, values, (fill, number) => {
        const k = `${number ? '#' : '"'}${fill}`;
        let i = index.get(k);
        if (i === undefined) { i = marks.push({ fill, number }) - 1; index.set(k, i); }
        u.add(i);
        return number ? String(this.base + i) : `qz${i}zq`;
      });
      if (made === undefined) { return undefined; }
      out.push(made); used.push(u);
    }
    return { lines: out, marks, used };
  }
  // One line with its placeholders as holes or text (KyrTemplates.fill's placeholders: "{name}", "{!name}" as it is).
  private static line(line: string, values: Record<string, string>,
    hole: (fill: string, number: boolean) => string): string | undefined {
    let out = '', quoted = false;
    for (let i = 0; i < line.length;) {
      this.placeholder.lastIndex = i;
      const m = line[i] === '{' ? this.placeholder.exec(line) : null, v = m ? values[m[2]!] : undefined;
      if (m && typeof v === 'string') {
        if (/qz\d+zq|90909/.test(v)) { return undefined; }
        if (m[1]) { out += v; quoted = this.quoting(v, quoted); }
        else { out += this.put(v, quoted, [out.at(-1) ?? '', line[i + m[0].length] ?? ''], hole); }
        i += m[0].length; continue;
      }
      const c = line[i]!;
      if (!quoted && c === '/' && line[i + 1] === '/') { return out + line.slice(i); }
      if (quoted && c === '\\') {
        // An escape before a placeholder escapes the value's first character, as the filled text has it.
        this.placeholder.lastIndex = i + 1;
        const p = line[i + 1] === '{' ? this.placeholder.exec(line) : null, pv = p ? values[p[2]!] : undefined;
        if (p && typeof pv === 'string') {
          if (p[1]) { return undefined; }
          out += c + this.escaped(pv); i += 1 + p[0].length; continue;
        }
        out += line.slice(i, i + 2); i += 2; continue;
      }
      if (c === '"') { quoted = !quoted; }
      out += c; i++;
    }
    return out;
  }
  // A value where its placeholder is: in a string, a hole for its words; outside one, a hole for a name or a part of
  // one (beside: the characters either side) or for a whole number; else its text, as KyrTemplates.fill puts it.
  private static put(v: string, quoted: boolean, beside: [string, string],
    hole: (fill: string, number: boolean) => string): string {
    if (quoted) {
      return /[\n\r]/.test(v) ? this.escaped(v)
        : hole(v.replace(/\{/g, KyrText.brace[0]).replace(/\}/g, KyrText.brace[1]), false);
    }
    const joined = /\w/.test(beside[0]), next = /\w/.test(beside[1]);
    if (joined || next) {
      return /^\w+$/.test(v) && (joined || /^[A-Za-z_]/.test(v)) ? hole(v, false) : this.escaped(v);
    }
    return /^[A-Za-z_]\w*$/.test(v) ? hole(v, false) : /^\d{1,9}$/.test(v) ? hole(v, true) : this.escaped(v);
  }
  private static escaped(v: string): string { return v.replace(/["\\{}]/g, '\\$&'); }
  // Whether a string is open after a piece of Kyr put in as it is.
  private static quoting(piece: string, quoted: boolean): boolean {
    for (let i = 0; i < piece.length; i++) {
      if (quoted && piece[i] === '\\') { i++; continue; }
      if (piece[i] === '"') { quoted = !quoted; }
    }
    return quoted;
  }
  // The holed lines' declarations, read once: from the process, the store, or parsed.
  private static shape(lines: string[]): Held[] | null {
    const text = lines.join('\n'), known = this.known.get(text);
    if (known !== undefined) { return known; }
    const stored = ParseCache.store?.get(this.key + text) as unknown as { held: Held[] | null } | undefined;
    const shape = stored ? stored.held : this.parsed(lines);
    if (this.known.size >= this.most) { this.known.delete(this.known.keys().next().value!); }
    this.known.set(text, shape);
    if (!stored) { ParseCache.store?.set(this.key + text, { held: shape } as unknown as Module); }
    return shape;
  }
  // Each declaration of the lines over lines of its own, and its field, parsed with the holes in it.
  private static parsed(lines: string[]): Held[] | null {
    const head = 'Module t "t" {', split = DeclarationParses.split(`${head}\n${lines.join('\n')}\n}`);
    if (!split) { return null; }
    const held = this.spans(lines, head.length + 1, split.chunks);
    if (!held) { return null; }
    const fields = this.fields(split.head, split.chunks.map(c => c.text));
    held.forEach((h, i) => {
      const f = fields[i];
      if (f && !this.together.has(f.field) && !this.capability(f)) { h.field = { field: f.field, value: f.value }; }
    });
    return held;
  }
  // The lines each declaration is on (where the first line begins: start), each declaration beginning on the line after
  // the last one's and the last ending on the last line; none where they do not.
  private static spans(lines: string[], start: number, chunks: { text: string; at: number }[]): Held[] | undefined {
    const starts: number[] = [], held: Held[] = [];
    let at = start, line = 0;
    for (const l of lines) { starts.push(at); at += l.length + 1; }
    for (const c of chunks) {
      const from = this.on(starts, line, c.at), to = this.on(starts, from, c.at + c.text.length - 1);
      if (from !== (held.at(-1)?.to ?? -1) + 1) { return undefined; }
      held.push({ from, to }); line = to;
    }
    return (held.at(-1)?.to ?? -1) === lines.length - 1 ? held : undefined;
  }
  // The line a character is on, looking on from a line it is not before.
  private static on(starts: number[], line: number, p: number): number {
    while (line + 1 < starts.length && starts[line + 1]! <= p) { line++; }
    return line;
  }
  // A capability is read with the module's own kinds (CatalogParser.declare).
  private static capability(f: Field): boolean {
    return f.field === 'entity' && (f.value as { type?: string }).type === 'capability';
  }
  // The declarations' fields, read together, or each alone where together they are not: none for one not read.
  private static fields(head: string, texts: string[]): (Field | undefined)[] {
    return this.read(head, texts) ?? texts.map(t => this.read(head, [t])?.[0]);
  }
  private static read(head: string, texts: string[]): Field[] | undefined {
    try {
      const match = ModuleParser.grammar.match(`${head}\n${texts.join('\n')}\n}`);
      if (match.failed()) { return undefined; }
      const parts = ModuleParser.semantics(match).parts() as Parts;
      return parts.sources.length === texts.length && parts.sources.every((s, j) => s === texts[j])
        ? parts.fields as Field[] : undefined;
    } catch { return undefined; }
  }
  // A part of a field copied, each hole in its strings, keys and numbers put back as its value (and noted used).
  private static walk(v: unknown, marks: readonly Mark[], used: Set<number>): unknown {
    if (typeof v === 'string') { return this.filled(v, marks, used); }
    if (typeof v === 'number') {
      const i = v - this.base, m = marks[i];
      if (Number.isInteger(i) && m?.number) { used.add(i); return Number(m.fill); }
      return v;
    }
    if (Array.isArray(v)) { return v.map(x => this.walk(x, marks, used)); }
    if (v && typeof v === 'object') {
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [this.filled(k, marks, used),
        this.walk(x, marks, used)]));
    }
    return v;
  }
  private static filled(s: string, marks: readonly Mark[], used: Set<number>): string {
    if (s.includes('qz')) {
      s = s.replace(this.mark, (whole, i: string) => {
        const m = marks[+i];
        if (!m || m.number) { return whole; }
        used.add(+i); return m.fill;
      });
    }
    if (s.includes('90909')) {
      s = s.replace(this.numbered, (whole, i: string) => {
        const m = marks[+i];
        if (!m?.number) { return whole; }
        used.add(+i); return m.fill;
      });
    }
    return s;
  }
}
