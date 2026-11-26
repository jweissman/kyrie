import type * as ohm from 'ohm-js';
import { Grammars, type Module } from '../../src/lang/index';
import type { Finding } from '../../src/cli/kyr-lint';

type Kind = 'module' | 'relation' | 'measure' | 'query' | 'action' | 'entity' | 'kind' | 'state'
  | 'rule' | 'observation' | 'objective' | 'pursuit' | 'route' | 'topic' | 'ending' | 'chapter'
  | 'promise' | 'occasion' | 'situation' | 'matter' | 'incident' | 'passage' | 'species';
type Node = ohm.Node;
export interface SourceModule { file: string; text: string; module: Module }
export interface Context { modules: readonly SourceModule[]; catalog: ReadonlyMap<string, Symbol> }
export interface Symbol {
  file: string; module: string; kind: Kind; name: string; signature: string;
  start: number; end: number; line: number; column: number;
}
export interface Occurrence {
  file: string; module: string; name: string; mode: 'read' | 'write' | 'mention';
  start: number; end: number; line: number; column: number; target?: Symbol;
}

// An isolated experiment, not the compiler's binding authority. It records identifiers and a subset of declarations.
export class SymbolTableSpike {
  readonly symbols: Symbol[] = [];
  readonly occurrences: Occurrence[] = [];
  identifiers = 0;
  constructor(readonly context: Context) {
    for (const source of context.modules) { this.index(source); }
    for (const occurrence of this.occurrences.filter(o => o.mode !== 'mention')) {
      occurrence.target = this.symbols.find(s => s.module === occurrence.module && s.name === occurrence.name
        && this.function(s.kind)) ?? this.symbols.find(s => s.file.startsWith('data/rules/')
          && s.name === occurrence.name && this.function(s.kind)) ?? context.catalog.get(occurrence.name);
    }
  }
  private index(source: SourceModule) {
    const match = Grammars.quick.match(source.text);
    if (match.failed()) { throw new Error(`Invalid Kyr in ${source.file}: ${match.message}`); }
    const writes = new Set<number>(), names = new Set<number>(), table = this;
    let identifiers = 0;
    const symbolStart = this.symbols.length, occurrenceStart = this.occurrences.length;
    const declarations: Record<string, { kind: Kind; index: number }> = {
      Module: { kind: 'module', index: 1 }, Relation: { kind: 'relation', index: 1 },
      Measure: { kind: 'measure', index: 1 }, Query: { kind: 'query', index: 1 },
      Action: { kind: 'action', index: 1 }, Kind: { kind: 'kind', index: 1 },
      LocalKind: { kind: 'kind', index: 1 }, LocalSpecies: { kind: 'species', index: 1 },
      Entity: { kind: 'entity', index: 1 }, Place: { kind: 'entity', index: 1 },
      Person: { kind: 'entity', index: 1 }, Thing: { kind: 'entity', index: 1 },
      ItemDecl: { kind: 'entity', index: 1 }, Passage: { kind: 'passage', index: 1 },
      Exit: { kind: 'entity', index: 1 }, HazardDecl: { kind: 'entity', index: 1 },
      WorldRule: { kind: 'rule', index: 1 }, Event: { kind: 'rule', index: 1 },
      Observation: { kind: 'observation', index: 1 }, Objective: { kind: 'objective', index: 1 },
      Pursuit: { kind: 'pursuit', index: 1 }, Topic: { kind: 'topic', index: 1 },
      Ending: { kind: 'ending', index: 1 }, Chapter: { kind: 'chapter', index: 1 },
      StatePart: { kind: 'state', index: 1 }, RouteHead: { kind: 'route', index: 0 },
      PromiseHead: { kind: 'promise', index: 0 }, OccasionHead: { kind: 'occasion', index: 0 },
      SituationHead: { kind: 'situation', index: 0 }, OccasionMatter: { kind: 'matter', index: 1 },
      SituationIncident: { kind: 'incident', index: 1 },
    };
    const semantics = Grammars.quick.createSemantics().addOperation<void>('collect', {
      _nonterminal(this: ohm.NonterminalNode, ...children: Node[]) {
        const declaration = declarations[this.ctorName];
        if (declaration) {
          const node = children[declaration.index]!;
          names.add(node.source.startIdx);
          table.declaration(source, declaration.kind, node);
        }
        if (['Assert', 'Retract', 'Set', 'Increase', 'Decrease'].includes(this.ctorName)) {
          writes.add(children[1]!.source.startIdx);
        }
        if (this.ctorName === 'Call') {
          names.add(children[0]!.source.startIdx);
          table.call(source, children[0]!, writes.has(this.source.startIdx));
        }
        if (this.ctorName === 'ident') {
          identifiers++;
          table.identifiers++;
          if (!names.has(this.source.startIdx)) { table.mention(source, this); }
        }
        children.forEach(c => (c as Node & { collect(): void }).collect());
      },
      _iter(...children: Node[]) { children.forEach(c => (c as Node & { collect(): void }).collect()); },
      _terminal() { return undefined; },
    });
    (semantics(match) as Node & { collect(): void }).collect();
    const recorded = this.symbols.length - symbolStart + this.occurrences.length - occurrenceStart;
    if (recorded !== identifiers) {
      throw new Error(`${source.file}: captured ${recorded} of ${identifiers} identifier nodes`);
    }
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
  private mention(source: SourceModule, node: Node) {
    this.occurrences.push({ file: source.file, module: source.module.id, name: node.sourceString,
      mode: 'mention', ...this.span(node) });
  }
  private function(kind: Kind): boolean { return ['relation', 'measure', 'query'].includes(kind); }
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
  shadowFindings(where: string, installedId: string): Finding[] {
    const shared = this.symbols.filter(s => s.file.startsWith('data/rules/'));
    const functions = new Set(shared.filter(s => s.kind !== 'action').map(s => s.name));
    const actions = new Set(shared.filter(s => s.kind === 'action').map(s => s.name));
    return this.context.modules.filter(s => !s.file.startsWith('data/rules/')).flatMap(source => {
      const local = this.symbols.filter(s => s.file === source.file);
      return local.flatMap(symbol => {
        const action = symbol.kind === 'action' && actions.has(symbol.name);
        const func = symbol.kind !== 'action' && functions.has(symbol.name);
        if (!action && !func) { return []; }
        const description = action
          ? `action ${symbol.name} is one of the shared rules' too; in this module it is the module's own`
          : `${symbol.name} is a name of the shared rules too; in this module it is the module's own`;
        return [{ level: 'warning' as const, check: 'shadow', where,
          message: `${installedId}: ${description}, ${installedId}__own_${symbol.name} to a spec or a save`
            + ` (${symbol.file}:${symbol.line})` }];
      });
    });
  }
}
