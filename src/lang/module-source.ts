import type { Change, Entity, Observation, Operator, Predicate } from './module';
import type { PassageSpec } from './world-constructs';
import { ModuleParser } from './module-parser';
import { TemplatedPredicates } from './templated-predicates';
import { TemplateShapes } from './template-shapes';
import type { Field } from './module-made';

// What a generator declares as typed values rather than Kyr text (AX-04; doc/architecture/mission-22/generated-ir.md,
// the review of generated parsing's §1): lowered into the same Module elements the parser makes of the text, before
// the module's files are joined, so that binding, declaring, validation, compiling and installing run on both alike,
// downstream of one point. The settlement writer's Observe first; then, by bytes, a Topic of the lands beyond (each
// town's keeper asked of a province or a country over the march: a fifth of a drawn country's Kyr).
// A generator still writes lines (the country's other declarations): a declaration made here is a line marked as
// such, carrying its value and the Kyr it stands for (written apart, for inspection), never parsed; then, of its
// RegionTracts, each stretch's Passage and Observe (the next by bytes, an eighth of a country between them). Then, by
// the declarations the grammar still matched on a fresh world (scripts/performance/fresh-start.ts --shapes: Initially
// Assert 1 683, Observe 1 126 on s0), the facts a country begins with (Initially, the design's second construct).
// provenance: which generator made it, of which construct (diagnostics name it where no source line does).
export interface Provenance { generator: string; construct: string }
// at: where its line was in the file's text, by the character (see parted); a passage is the parser's own field for
// it, declared as the line would be, an observation and a topic the Module elements their lines make.
// An initial, the Change its Initially line makes; a field, a declaration's as the parser makes it of its line (a
// Topic put once, a Place), declared as the line's is (ModuleDeclarations.declare: a topic's latch, its asking again);
// or any declaration of a template's, its field filled from the template's holes (TemplateShapes).
export type DeclaredField = { field: 'action'; value: Operator & { once: true } } | { field: 'place'; value: Entity }
  | Field;
export type Declared = ({ observation: Observation } | { action: Operator } | { passage: PassageSpec }
  | { initial: Change } | { field: DeclaredField })
  & { kyr: string; provenance: Provenance; at?: number };
// One file's declarations made here. Each keeps its place among the file's own by where its line was (at): a file's
// observations and actions are made by many of its declarations (a thing's states, a discovery's finds, a thing's
// changes), in the order they are written, so the parser declares each value as it comes to that place, between the
// text's declarations (ModuleParser.parse), and the text holds nothing for it. (It had held a stub declaration for
// each, which kept the order and the parse's cost, which goes by declarations: generated-ir.md.)
export interface FileSource { file: string; declared: Declared[] }
// A topic as a generator says it: the parser's Topic, without its optional parts (travelling, answering, grave). when:
// its condition as Kyr (read once for each text) or made; once: put once; then: what discussing it does, where that
// is not to teach what it knows (each fact known, and told by its keeper).
export interface TopicSpec {
  id: string; keeper: string; title: string; when: string | Predicate; says: string; knows: string[]; once?: boolean;
  then?: Change[];
}
export class ModuleSource {
  private static readonly mark = '\u0000kyr-ir ';
  // Written as their Kyr instead, to be parsed as before: the text the values stand for, for the differential
  // harness that holds the two to one module (test/generated-ir), and for nothing in play.
  static asText = false;
  // Lines filled from a template are made values only while a module's files are written so (written: RegionWriter.
  // files), where each file is parted and its values written beside it; anywhere else (a fixture, a tool that reads the
  // lines as words) they are their text.
  private static writing = 0;
  // How many of a template family's declarations have been made as values (by its generator's first word: what
  // test/generated-ir reads).
  static readonly templated = new Map<string, number>();
  static written<T>(run: () => T): T {
    ModuleSource.writing++;
    try { return run(); } finally { ModuleSource.writing--; }
  }
  // A line standing for an Observe made as a value.
  static observe(observation: Observation, kyr: string, provenance: Provenance): string {
    return ModuleSource.asText ? kyr : ModuleSource.line({ observation, kyr, provenance });
  }
  // A line standing for a Passage made as a value: the parser's field for its line.
  static passage(passage: PassageSpec, kyr: string, provenance: Provenance): string {
    return ModuleSource.asText ? kyr : ModuleSource.line({ passage, kyr, provenance });
  }
  // A line standing for a declaration made as the parser's field for its line.
  static field(field: DeclaredField, kyr: string, provenance: Provenance): string {
    return ModuleSource.asText ? kyr : ModuleSource.line({ field, kyr, provenance });
  }
  // A line standing for an Initially made as a value: the Change its line makes.
  static initially(initial: Change, kyr: string, provenance: Provenance): string {
    return ModuleSource.asText ? kyr : ModuleSource.line({ initial, kyr, provenance });
  }
  // Lines a generator filled from a template (filled: KyrTemplates.fill's, line for line), each declaration in them
  // made as the field its text parses to, from the template's own Kyr read once with its placeholders as holes
  // (TemplateShapes; OR-1900), where it is one; the rest as their text.
  static filled(lines: readonly string[], values: Record<string, string>, filled: string[], provenance: Provenance):
    string[] {
    const held = ModuleSource.asText || !ModuleSource.writing ? undefined : TemplateShapes.declared(lines, values);
    if (!held) { return filled; }
    const family = provenance.generator.split(' ')[0]!, made = held.filter(h => h.field).length;
    ModuleSource.templated.set(family, (ModuleSource.templated.get(family) ?? 0) + made);
    return held.flatMap(h => h.field ? [ModuleSource.line({ field: h.field,
      kyr: filled.slice(h.from, h.to + 1).join('\n'), provenance })] : filled.slice(h.from, h.to + 1));
  }
  // `Initially Assert <name>(<args>).`, made as the fact its line asserts.
  static asserted(provenance: Provenance, name: string, ...args: string[]): string {
    return ModuleSource.initially(ModuleSource.assert(name, ...args), `  Initially Assert ${name}(${args.join(', ')}).`,
      provenance);
  }
  // The lines standing for a Topic made as a value: its condition is the generator's few words, read as the parser
  // reads a predicate, once for each text (each keeper of the country asked of one land beyond has the same: fifteen
  // parses of each had put a cold set-out over its predicate budget, 1072 of 1000); its words and what it teaches
  // given whole (the bytes were its words).
  static topic(t: TopicSpec, kyr: string[], provenance: Provenance): string[] {
    if (ModuleSource.asText) { return kyr; }
    const told: Change[] = t.then ?? t.knows.flatMap(k => [ModuleSource.assert('knows', 'actor', k),
      ModuleSource.assert('toldBy', 'actor', t.keeper, k)]);
    const when = typeof t.when === 'string' ? TemplatedPredicates.of(t.when, '', ModuleParser.predicate) : t.when;
    const action = { id: t.id, name: t.title, description: '', speaker: t.keeper, topic: true, report: t.says,
      ...t.once ? { once: true } : {}, parameters: [{ name: 'actor', type: 'group' }, { name: 'site', type: 'place' }],
      requires: { kind: 'and', left: TemplatedPredicates.topic(t.keeper, false, ModuleParser.predicate), right: when },
      success: told, failure: [], cost: 1, time: 0 } as unknown as Operator & { once: true };
    return [ModuleSource.line({ ...t.once ? { field: { field: 'action' as const, value: action } } : { action },
      kyr: kyr.join('\n'), provenance })];
  }
  // A change of one fact, as the parser makes `Assert <name>(<args>).` (or Retract).
  static change(kind: 'assert' | 'retract', name: string, ...args: string[]): Change {
    return { kind, call: { kind: 'call', name, args } };
  }
  // Conditions all to hold, as the parser makes `a and b and c` (to the right: a and (b and c)).
  static all(...conditions: Predicate[]): Predicate {
    return conditions.reduceRight((right, left) => ({ kind: 'and', left, right }));
  }
  private static assert(name: string, ...args: string[]): Change { return ModuleSource.change('assert', name, ...args); }
  private static line(d: Declared): string { return `${ModuleSource.mark}${JSON.stringify(d)}`; }
  static is(line: string): boolean { return line.startsWith(ModuleSource.mark); }
  static read(line: string): Declared { return JSON.parse(line.slice(ModuleSource.mark.length)) as Declared; }
  // A writer's lines as Kyr, each value written as its line (for inspection, and for what reads a writer's words).
  static text(lines: readonly string[]): string[] {
    return lines.map(l => ModuleSource.is(l) ? ModuleSource.read(l).kyr : l);
  }
  // A file's lines parted: the text to be parsed, and what was declared, each at the character where its line would
  // have begun (start: where the first line begins in the file, after its head). A declaration's lines are kept in the
  // text as empty ones, so that what follows it keeps its line (a situation's record says the line it was written on:
  // SemanticRecords), and the grammar has only white space to pass over for it.
  static parted(file: string, lines: string[], start = 0): { text: string[]; source: FileSource } {
    const text: string[] = [], declared: Declared[] = [];
    let at = start;
    for (const line of lines) {
      if (ModuleSource.is(line)) {
        const d = ModuleSource.read(line), n = d.kyr.split('\n').length;
        declared.push({ ...d, at });
        for (let i = 0; i < n; i++) { text.push(''); }
        at += n; continue;
      }
      text.push(line); at += line.length + 1;
    }
    return { text, source: { file, declared } };
  }
  // What was declared for each of a module's own files as values, in their order (none where nothing was), read from
  // beside them as its manifest names them (ir): for its loading, and for the composer reading its places and ways.
  static sources(manifest: { source: string | string[]; ir?: Record<string, string> }, path: string,
    source: { read(path: string): Promise<string>; resolve(relative: string, from?: string): string }):
    Promise<(FileSource | undefined)[]> {
    const files = typeof manifest.source === 'string' ? [manifest.source] : manifest.source;
    return Promise.all(files.map(async f => manifest.ir?.[f]
      ? JSON.parse(await source.read(source.resolve(manifest.ir[f], path))) as FileSource : undefined));
  }
  // A file's text with what was declared beside it put back where its lines were (see parted): the file as its writer
  // wrote it, for what reads a file's words (who the country's people are, as they come).
  static whole(text: string, source: FileSource | undefined): string {
    let out = text;
    for (const d of [...source?.declared ?? []].sort((a, b) => (b.at ?? 0) - (a.at ?? 0))) {
      const at = d.at ?? 0;
      out = `${out.slice(0, at)}${d.kyr}\n${out.slice(at + d.kyr.split('\n').length)}`;
    }
    return out;
  }
  // The Kyr the declarations stand for, as a file to read (never parsed in play).
  static kyr(source: FileSource): string { return source.declared.map(d => d.kyr).join('\n'); }
}
