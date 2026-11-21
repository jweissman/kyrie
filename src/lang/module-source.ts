import type { Change, Module, Observation, Operator } from './module';
import { ModuleParser } from './module-parser';
import { TemplatedPredicates } from './templated-predicates';

// What a generator declares as typed values rather than Kyr text (AX-04; doc/architecture/mission-22/generated-ir.md,
// the review of generated parsing's §1): lowered into the same Module elements the parser makes of the text, before
// the module's files are joined, so that binding, declaring, validation, compiling and installing run on both alike,
// downstream of one point. The settlement writer's Observe first; then, by bytes, a Topic of the lands beyond (each
// town's keeper asked of a province or a country over the march: a fifth of a drawn country's Kyr).
// A generator still writes lines (the country's other declarations): a declaration made here is a line marked as
// such, carrying its value and the Kyr it stands for (written apart, for inspection), never parsed.
// provenance: which generator made it, of which construct (diagnostics name it where no source line does).
export interface Provenance { generator: string; construct: string }
export type Declared = ({ observation: Observation } | { action: Operator }) & { kyr: string; provenance: Provenance };
// One file's declarations made here. Each keeps its place among the file's own by a stub the text holds where its
// line was (`Observe <id> at <place> when true "".`, `Topic <id> with <keeper> "" when true { Says "". }`): a file's
// observations and actions are made by many of its declarations (a thing's states, a discovery's finds, a thing's
// changes), in the order they are written, and the stub is what keeps the joined module the one the text would have
// made. The stub goes when the IR owns the order of all that makes them (generated-ir.md).
export interface FileSource { file: string; declared: Declared[] }
// A topic as a generator says it: the parser's Topic, without its optional parts (travelling, answering, once, grave).
export interface TopicSpec { id: string; keeper: string; title: string; when: string; says: string; knows: string[] }
export class ModuleSource {
  private static readonly mark = '\u0000kyr-ir ';
  // Written as their Kyr instead, to be parsed as before: the text the values stand for, for the differential
  // harness that holds the two to one module (test/generated-ir), and for nothing in play.
  static asText = false;
  // A line standing for an Observe made as a value.
  static observe(observation: Observation, kyr: string, provenance: Provenance): string {
    return ModuleSource.asText ? kyr : ModuleSource.line({ observation, kyr, provenance });
  }
  // The lines standing for a Topic made as a value: its condition is the generator's few words, read as the parser
  // reads a predicate; its words and what it teaches given whole (the bytes were its words).
  static topic(t: TopicSpec, kyr: string[], provenance: Provenance): string[] {
    if (ModuleSource.asText) { return kyr; }
    const told: Change[] = t.knows.flatMap(k => [ModuleSource.assert('knows', 'actor', k),
      ModuleSource.assert('toldBy', 'actor', t.keeper, k)]);
    const action = { id: t.id, name: t.title, description: '', speaker: t.keeper, topic: true, report: t.says,
      parameters: [{ name: 'actor', type: 'group' }, { name: 'site', type: 'place' }],
      requires: { kind: 'and', left: TemplatedPredicates.topic(t.keeper, false, ModuleParser.predicate),
        right: ModuleParser.predicate(t.when) }, success: told, failure: [], cost: 1, time: 0 } as unknown as Operator;
    return [ModuleSource.line({ action, kyr: kyr.join('\n'), provenance })];
  }
  private static assert(name: string, ...args: string[]): Change {
    return { kind: 'assert', call: { kind: 'call', name, args } };
  }
  private static line(d: Declared): string { return `${ModuleSource.mark}${JSON.stringify(d)}`; }
  static is(line: string): boolean { return line.startsWith(ModuleSource.mark); }
  static read(line: string): Declared { return JSON.parse(line.slice(ModuleSource.mark.length)) as Declared; }
  // A file's lines parted: the text to be parsed (a stub where a declaration made here was), and what was declared.
  static parted(file: string, lines: string[]): { text: string[]; source: FileSource } {
    const text: string[] = [], declared: Declared[] = [];
    for (const line of lines) {
      if (!ModuleSource.is(line)) { text.push(line); continue; }
      const d = ModuleSource.read(line);
      declared.push(d);
      text.push('observation' in d ? `  Observe ${d.observation.id} at ${d.observation.place} when true "".`
        : `  Topic ${d.action.id} with ${d.action.speaker!} "" when true { Says "". }`);
    }
    return { text, source: { file, declared } };
  }
  // A file's module with what was declared for it in its stubs' places: a module of its own, the parsed one unchanged.
  static lowered(module: Module, source: FileSource | undefined): Module {
    if (!source?.declared.length) { return module; }
    const seen = new Map<string, unknown>(source.declared.map(d => 'observation' in d
      ? [`o:${d.observation.id}`, d.observation] : [`a:${d.action.id}`, d.action]));
    return { ...module, ...module.observations
      ? { observations: module.observations.map(o => ModuleSource.made(seen, `o:${o.id}`, o)) } : {},
    actions: module.actions.map(a => ModuleSource.made(seen, `a:${a.id}`, a)) };
  }
  private static made<T>(seen: Map<string, unknown>, key: string, parsed: T): T {
    return seen.has(key) ? structuredClone(seen.get(key) as T) : parsed;
  }
  // The Kyr the declarations stand for, as a file to read (never parsed in play).
  static kyr(source: FileSource): string { return source.declared.map(d => d.kyr).join('\n'); }
}
