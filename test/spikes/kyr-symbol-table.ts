import type * as ohm from 'ohm-js';
import { Grammars, type Module } from '../../src/lang/index';
import type { Finding } from '../../src/cli/kyr-lint';

type Kind = 'relation' | 'measure' | 'query' | 'action';
type Node = ohm.Node;
export interface SourceModule { file: string; text: string; module: Module }
export interface Context { modules: readonly SourceModule[]; catalog: ReadonlyMap<string, Symbol> }
export interface Symbol {
  file: string; module: string; kind: Kind; name: string; signature: string;
  start: number; end: number; line: number; column: number;
}
export interface Occurrence {
  file: string; module: string; name: string; mode: 'read' | 'write';
  start: number; end: number; line: number; column: number; target?: Symbol;
}

// An isolated experiment, not the compiler's binding authority. Only explicit calls and four declaration forms.
export class SymbolTableSpike {
  readonly symbols: Symbol[] = [];
  readonly occurrences: Occurrence[] = [];
  constructor(readonly context: Context) {
    for (const source of context.modules) { this.index(source); }
    for (const occurrence of this.occurrences) {
      occurrence.target = this.symbols.find(s => s.module === occurrence.module && s.name === occurrence.name
        && s.kind !== 'action') ?? this.symbols.find(s => s.file.startsWith('data/rules/')
          && s.name === occurrence.name && s.kind !== 'action') ?? context.catalog.get(occurrence.name);
    }
  }
  private index(source: SourceModule) {
    const match = Grammars.quick.match(source.text);
    if (match.failed()) { throw new Error(`Invalid Kyr in ${source.file}: ${match.message}`); }
    const writes = new Set<number>(), table = this;
    const semantics = Grammars.quick.createSemantics().addOperation<void>('collect', {
      _nonterminal(this: ohm.NonterminalNode, ...children: Node[]) {
        const kinds: Record<string, Kind> = { Relation: 'relation', Measure: 'measure', Query: 'query', Action: 'action' };
        const kind = kinds[this.ctorName];
        if (kind) { table.declaration(source, kind, children[1]!); }
        if (['Assert', 'Retract', 'Set', 'Increase', 'Decrease'].includes(this.ctorName)) {
          writes.add(children[1]!.source.startIdx);
        }
        if (this.ctorName === 'Call') { table.call(source, children[0]!, writes.has(this.source.startIdx)); }
        children.forEach(c => (c as Node & { collect(): void }).collect());
      },
      _iter(...children: Node[]) { children.forEach(c => (c as Node & { collect(): void }).collect()); },
      _terminal() { return undefined; },
    });
    (semantics(match) as Node & { collect(): void }).collect();
  }
  private declaration(source: SourceModule, kind: Kind, node: Node) {
    const name = node.sourceString;
    const list = kind === 'relation' ? source.module.relations : kind === 'measure' ? source.module.measures : [];
    const signature = list.find(s => s.name === name)?.types.join(',') ?? '';
    this.symbols.push({ file: source.file, module: source.module.id, kind, name, signature, ...this.span(node) });
  }
  private call(source: SourceModule, node: Node, write: boolean) {
    this.occurrences.push({ file: source.file, module: source.module.id, name: node.sourceString,
      mode: write ? 'write' : 'read', ...this.span(node) });
  }
  private span(node: Node) {
    const at = node.source.getLineAndColumn();
    return { start: node.source.startIdx, end: node.source.endIdx, line: at.lineNum, column: at.colNum };
  }
  twins(): Finding[] {
    const shared = this.symbols.filter(s => s.file.startsWith('data/rules/'));
    const queries = new Set(shared.filter(s => s.kind === 'query').map(s => s.name));
    const functions = new Set(shared.filter(s => s.kind !== 'action').map(s => s.name));
    const actions = new Set(shared.filter(s => s.kind === 'action').map(s => s.name));
    return this.context.modules.filter(s => !s.file.startsWith('data/rules/')).flatMap(source => {
      const local = this.symbols.filter(s => s.file === source.file);
      const clashes = [
        ...local.filter(s => s.kind === 'query' && functions.has(s.name)).map(s => `query ${s.name}`),
        ...local.filter(s => (s.kind === 'relation' || s.kind === 'measure') && queries.has(s.name)).map(s => s.name),
        ...local.filter(s => s.kind === 'action' && actions.has(s.name)).map(s => `action ${s.name}`),
      ];
      return clashes.map(name => ({ level: 'error' as const, check: 'redefinition', where: source.file,
        message: `redefines canonical ${name}` }));
    });
  }
  vocabulary(): Finding[] {
    const defs = new Map<string, Symbol[]>(), findings = this.twins();
    for (const source of this.context.modules) {
      for (const s of this.symbols.filter(x => x.file === source.file && x.kind === 'relation')
        .concat(this.symbols.filter(x => x.file === source.file && x.kind === 'measure'))) {
        if (s.name.startsWith('once_') || s.name.startsWith('said_')) { continue; }
        defs.set(s.name, [...defs.get(s.name) ?? [], s]);
      }
    }
    for (const [name, list] of defs) {
      const shared = list.filter(s => s.file.startsWith('data/rules/'));
      if (new Set(shared.map(s => s.signature)).size > 1) {
        findings.push({ level: 'warning', check: 'vocabulary', where: name,
          message: `defined with different meanings: ${shared.map(s => `${s.file}(${s.signature})`).join(', ')}` });
      }
      for (const s of shared.length ? list.filter(x => !x.file.startsWith('data/rules/')) : []) {
        findings.push({ level: 'error', check: 'redefinition', where: s.file, message: `redefines canonical ${name}` });
      }
    }
    return findings;
  }
}
