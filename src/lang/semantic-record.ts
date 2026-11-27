import type * as ohm from 'ohm-js';
import type { Call, Change, Module, Predicate, Value } from './module';
import type { Provenance } from './module-source';

// A high-level declaration as the author wrote it, kept beside what it was lowered into (MT-30; the language review
// of 20 November, §3.1, Phase A; doc/architecture/mission-22/semantic-tracing.md). Made by the lowering itself, so the
// two cannot disagree; read by the tools (inspect --why process, the compatibility snapshot), never by the runtime,
// which runs the lowered rules as before. The compiler's output, never current truth: a save does not keep it.
export type SemanticKind = 'route' | 'promise' | 'occasion' | 'situation';
// Where it is written: the file (set as a module's files are joined), its line and column; or, generated, by whom.
export interface Span { file?: string; line: number; column: number }
// A state of the process, in the author's words, and the condition over the lowered facts that says it holds.
export interface Phase { id: string; said: string; holds: Predicate }
export interface SemanticRecord {
  // kind:name as written (occasion:hearing); installed, kind:installation/name (occasion:quittance/hearing).
  id: string; kind: SemanticKind; name: string; words: string;
  span?: Span; provenance?: Provenance;
  participants: { role: string; id: string }[];
  phases: Phase[];
  // The authored conditions and changes, as written.
  requires: Predicate[]; effects: Change[];
  // What it became: supporting detail, named only after the author's terms.
  lowered: { rules: string[]; pursuits: string[]; objectives: string[]; entities: string[] };
  // The relations and measures its conditions read and its changes write: what can affect it, and what came of it.
  reads: string[]; writes: string[];
  // The facts a choice serving it makes or asks (a promise made by a topic's promiseMade; a matter open).
  serves: Call[];
}
export type RecordSpec = Omit<SemanticRecord, 'id' | 'reads' | 'writes'>;
export class SemanticRecords {
  // Where a declaration begins in the text read.
  static span(node: ohm.Node): Span {
    const at = node.source.getLineAndColumn();
    return { line: at.lineNum, column: at.colNum };
  }
  static add(module: Module, spec: RecordSpec) {
    const reads = new Set<string>(), writes = new Set<string>();
    for (const p of [...spec.requires, ...spec.phases.map(ph => ph.holds)]) { SemanticRecords.called(p, reads); }
    for (const c of spec.effects) { writes.add(c.call.name); }
    (module.semantic ??= []).push({ id: `${spec.kind}:${spec.name}`, ...spec, reads: [...reads].sort(),
      writes: [...writes].sort() });
  }
  // A module without its records, or where its names were declared: what a save keeps (they are read again from
  // source).
  static unwritten(module: Module): Module {
    if (!module.semantic && !module.sites) { return module; }
    const kept = { ...module };
    delete kept.semantic; delete kept.sites;
    return kept;
  }
  // Each record of a module's file told the file it is written in.
  static filed(module: Module, file: string): Module {
    if (!module.semantic?.length) { return module; }
    return { ...module, semantic: module.semantic.map(r => r.span ? { ...r, span: { ...r.span, file } } : r) };
  }
  // The names a condition calls.
  static called(p: Predicate | Value, into: Set<string>) {
    switch (p.kind) {
      case 'call': into.add(p.name); break;
      case 'not': SemanticRecords.called(p.value, into); break;
      case 'count': SemanticRecords.called(p.of, into); break;
      case 'and': case 'or': case 'compare': case 'arith':
        SemanticRecords.called(p.left, into); SemanticRecords.called(p.right, into); break;
      default:
    }
  }
  static call(name: string, ...args: string[]): Call { return { kind: 'call', name, args }; }
  static all(...parts: Predicate[]): Predicate {
    return parts.reduceRight((right, left) => ({ kind: 'and', left, right }));
  }
  static not(value: Predicate): Predicate { return { kind: 'not', value }; }
}
