import type { Module } from './module';
import type { Declared } from './module-source';
import { ModuleDeclarations } from './module-declarations';
import type { VocabularyContext } from './vocabulary';

type Into = Parameters<typeof ModuleDeclarations.declare>[3];
// A value as the module's sites tell it (DeclarationSites): what it is, its name, where its line was and who made it.
export interface Placed { kind: 'passage' | 'observation' | 'action' | 'initial'; name: string; at: number; generator: string }
// What a generator declared for a text as values, declared as the parser comes to where each line was (ModuleSource;
// AX-04, generated-ir.md): before the first of the text's declarations that begins after it, the rest after the last.
// So a file's observations and actions are in the order its lines were written, with nothing of the values in the
// text to parse.
export class DeclaredValues {
  // The values of the text being parsed now (see during).
  private static placing: readonly Declared[] = [];
  // A parse with these values to declare (ModuleParser.parse), and none after it.
  static during<T>(values: readonly Declared[], parse: () => T): T {
    this.placing = values;
    try { return parse(); } finally { this.placing = []; }
  }
  // starts: where each of the text's declarations begins, by the character; declare: the text's i-th declared;
  // placed: each value declared, told what it is.
  static interleave(starts: number[], at: { context: VocabularyContext; module: Module; into: Into },
    declare: (i: number) => void, placed: (value: Placed, place: () => void) => void) {
    const sorted = [...this.placing].sort((a, b) => (a.at ?? 0) - (b.at ?? 0));
    let next = 0;
    starts.forEach((start, i) => {
      for (; next < sorted.length && (sorted[next]!.at ?? 0) <= start; next++) {
        const d = sorted[next]!;
        placed(this.told(d), () => this.place(at.context, at.module, d, at.into));
      }
      declare(i);
    });
    for (; next < sorted.length; next++) {
      const d = sorted[next]!;
      placed(this.told(d), () => this.place(at.context, at.module, d, at.into));
    }
  }
  private static told(d: Declared): Placed {
    const generator = `${d.provenance.generator}/${d.provenance.construct}`, at = d.at ?? 0;
    if ('passage' in d) { return { kind: 'passage', name: d.passage.id, at, generator }; }
    if ('observation' in d) { return { kind: 'observation', name: d.observation.id, at, generator }; }
    // (An Initially names nothing of its own, as its line does not: DeclarationSites.named.)
    if ('initial' in d) { return { kind: 'initial', name: '', at, generator }; }
    return { kind: 'action', name: d.action.id, at, generator };
  }
  // A passage as its line's field is declared; an observation, a topic or an initial fact as the Module element its
  // line makes; a copy each, the value being the generator's.
  private static place(context: VocabularyContext, module: Module, d: Declared, into: Into) {
    if ('passage' in d) { ModuleDeclarations.declare(context, module,
      { field: 'passage', value: structuredClone(d.passage) }, into); }
    else if ('observation' in d) { (module.observations ??= []).push(structuredClone(d.observation)); }
    else if ('initial' in d) { module.initial.push(structuredClone(d.initial)); }
    else { module.actions.push(structuredClone(d.action)); }
  }
}
