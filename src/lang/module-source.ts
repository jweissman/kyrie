import type { Module, Observation } from './module';

// What a generator declares as typed values rather than Kyr text (AX-04; doc/architecture/mission-22/generated-ir.md,
// the review of generated parsing's §1): lowered into the same Module elements the parser makes of the text, before
// the module's files are joined, so that binding, declaring, validation, compiling and installing run on both alike,
// downstream of one point. First, the Observe of the settlement writer.
// A generator still writes lines (the country's other declarations): a declaration made here is a line marked as
// such, carrying its value and the Kyr it stands for (written apart, for inspection), never parsed.
// provenance: which generator made it, of which construct (diagnostics name it where no source line does).
export interface Provenance { generator: string; construct: string }
export interface Declared { observation: Observation; kyr: string; provenance: Provenance }
// One file's declarations made here. Each keeps its place among the file's observations by a stub the text holds
// where its line was (`Observe <id> at <place> when true "".`): the observations of a file are made by many of its
// declarations (a thing's states, an ending, a promise), in the order they are written, and the stub is what keeps the
// joined module the one the text would have made, its words, condition and what it teaches the value's. The stub goes
// when the IR owns the order of all that makes observations (generated-ir.md).
export interface FileSource { file: string; observations: Declared[] }
export class ModuleSource {
  private static readonly mark = '\u0000kyr-ir ';
  // Written as their Kyr instead, to be parsed as before: the text the values stand for, for the differential
  // harness that holds the two to one module (test/generated-ir), and for nothing in play.
  static asText = false;
  // A line standing for an Observe made as a value.
  static observe(observation: Observation, kyr: string, provenance: Provenance): string {
    if (ModuleSource.asText) { return kyr; }
    return `${ModuleSource.mark}${JSON.stringify({ observation, kyr, provenance } satisfies Declared)}`;
  }
  static is(line: string): boolean { return line.startsWith(ModuleSource.mark); }
  static read(line: string): Declared { return JSON.parse(line.slice(ModuleSource.mark.length)) as Declared; }
  // A file's lines parted: the text to be parsed (a stub where a declaration made here was), and what was declared.
  static parted(file: string, lines: string[]): { text: string[]; source: FileSource } {
    const text: string[] = [], observations: Declared[] = [];
    for (const line of lines) {
      if (!ModuleSource.is(line)) { text.push(line); continue; }
      const d = ModuleSource.read(line);
      observations.push(d);
      text.push(`  Observe ${d.observation.id} at ${d.observation.place} when true "".`);
    }
    return { text, source: { file, observations } };
  }
  // A file's module with what was declared for it in its stubs' places: a module of its own, the parsed one unchanged.
  static lowered(module: Module, source: FileSource | undefined): Module {
    if (!source?.observations.length) { return module; }
    const by = new Map(source.observations.map(d => [d.observation.id, d.observation]));
    return { ...module, observations: (module.observations ?? []).map(o => by.has(o.id)
      ? structuredClone(by.get(o.id)!) : o) };
  }
  // The Kyr the declarations stand for, as a file to read (never parsed in play).
  static kyr(source: FileSource): string { return source.observations.map(o => o.kyr).join('\n'); }
}
