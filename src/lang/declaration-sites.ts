import type { Module } from './module';

// Where each of a module's names was declared, recorded as the module is made of its declarations (ModuleMade), by
// the lowering itself and never by a second reading of its text: the symbol table's ground (SymbolTable; OR-700,
// doc/architecture/kyr-symbol-table-proposal-2026-11-27.md, increment 2). Kept with the parse, and so with a parse
// kept and copied (ParseCache), whole or a declaration at a time (DeclarationParses) alike; a module of several files
// joined, or installed, keeps none (ModuleBundle.joined; a save keeps none: SemanticRecords.unwritten).
export type SymbolNamespace = 'entity' | 'person' | 'relation' | 'measure' | 'query' | 'kind' | 'act' | 'rule'
  | 'observation' | 'objective' | 'pursuit' | 'verb';
// One declaration of the text: its field (person, passage, relation…), where it begins by the character, and its
// line and column; or a value a generator declared (ModuleSource), which has no line of the text, but the generator
// and construct that made it, and where its line would have been.
export interface SiteSpan {
  field: string; at: number; end?: number; line?: number; column?: number; generator?: string;
}
// A name declared, the declaration it came of (an index into spans), and whether it is that declaration's own name or
// one its lowering made (a Person's acts, a once Rule's latch).
export interface DeclaredSite { namespace: SymbolNamespace; name: string; span: number; lowered: boolean }
// facts: for each of the module's initial facts, the declaration that wrote it (an index into spans), -1 for none.
export interface Sites {
  spans: SiteSpan[]; declared: DeclaredSite[]; facts: number[];
  signatureTypes?: { index: number; spans: SiteSpan[] }[];
  references?: Record<number, SiteSpan>;
}
type Counts = Record<SymbolNamespace | 'initial', number>;

export class DeclarationSites {
  private readonly spans: SiteSpan[] = [];
  private readonly declared: DeclaredSite[] = [];
  private readonly facts: number[] = [];
  private readonly signatureTypes: NonNullable<Sites['signatureTypes']> = [];
  constructor(private readonly module: Module) {}
  // What a declaration adds to the module while it is declared, told it came of that declaration (primary: its own
  // name, where it has one).
  during(span: SiteSpan, primary: string | undefined, types: { at: number; end: number }[] | undefined,
    declare: () => void): void {
    const before = this.counts(), i = this.spans.push(span) - 1;
    declare();
    this.since(before, (_ns, name) => ({ span: i, lowered: primary !== undefined && name !== primary }));
    if (span.field === 'relation' && primary && types) {
      this.signatureTypes.push({ index: before.relation,
        spans: types.map(t => ({ field: span.field, at: span.at + t.at, end: span.at + t.end })) });
    }
  }
  // What one step adds for many declarations at once (a module's own kinds, all declared before the rest): each name
  // told the declaration whose own it is, by name; a fact, the declaration its first argument names.
  together(spans: { span: SiteSpan; name: string }[], declare: () => void): void {
    const before = this.counts();
    const by = new Map(spans.map(s => [s.name, this.spans.push(s.span) - 1]));
    for (const s of spans) { this.declared.push({ namespace: 'kind', name: s.name, span: by.get(s.name)!, lowered: false }); }
    declare();
    this.since(before, (_ns, name) => {
      const span = by.get(name);
      return span === undefined ? undefined : { span, lowered: true };
    });
  }
  // The sites recorded, each declaration's line and column read off the text it was written in.
  finish(text: string, references: { index: number; span: SiteSpan }[] = []): Sites {
    const starts = DeclarationSites.lines(text);
    for (const s of [...this.spans, ...this.signatureTypes.flatMap(t => t.spans), ...references.map(r => r.span)]) {
      if (s.generator) { continue; }
      const line = DeclarationSites.line(starts, s.at);
      s.line = line + 1; s.column = s.at - starts[line]! + 1;
    }
    while (this.facts.length < this.module.initial.length) { this.facts.push(-1); }
    return { spans: this.spans, declared: this.declared, facts: this.facts,
      ...this.signatureTypes.length ? { signatureTypes: this.signatureTypes } : {},
      ...references.length ? { references: Object.fromEntries(references.map(r => [r.index, r.span])) } : {} };
  }
  private since(before: Counts,
    of: (ns: SymbolNamespace, name: string) => { span: number; lowered: boolean } | undefined) {
    const m = this.module, lists: [SymbolNamespace, string[]][] = [['entity', m.entities.map(e => e.id)],
      ['person', (m.people ?? []).map(p => p.id)],
      ['relation', m.relations.map(r => r.name)], ['measure', m.measures.map(r => r.name)],
      ['query', m.queries.map(q => q.name)], ['kind', m.kinds], ['act', m.actions.map(a => a.id)],
      ['verb', (m.verbs ?? []).map(v => v.name)],
      ['rule', (m.rules ?? []).map(r => r.id)], ['observation', (m.observations ?? []).map(o => o.id)],
      ['objective', (m.objectives ?? []).map(o => o.id)], ['pursuit', (m.pursuits ?? []).map(p => p.id)]];
    for (const [namespace, names] of lists) {
      for (const name of names.slice(before[namespace])) {
        const site = of(namespace, name);
        if (site) { this.declared.push({ namespace, name, ...site }); }
      }
    }
    while (this.facts.length < before.initial) { this.facts.push(-1); }
    for (const fact of m.initial.slice(before.initial)) {
      this.facts.push(of('entity', fact.call.args[0] ?? '')?.span ?? -1);
    }
  }
  private counts(): Counts {
    const m = this.module;
    return { entity: m.entities.length, person: m.people?.length ?? 0,
      relation: m.relations.length, measure: m.measures.length,
      query: m.queries.length, kind: m.kinds.length, act: m.actions.length, rule: m.rules?.length ?? 0,
      verb: m.verbs?.length ?? 0,
      observation: m.observations?.length ?? 0, objective: m.objectives?.length ?? 0,
      pursuit: m.pursuits?.length ?? 0, initial: m.initial.length };
  }
  // Where each line of a text begins.
  private static lines(text: string): number[] {
    const starts = [0];
    for (let i = text.indexOf('\n'); i >= 0; i = text.indexOf('\n', i + 1)) { starts.push(i + 1); }
    return starts;
  }
  private static line(starts: number[], at: number): number {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid]! <= at) { lo = mid; } else { hi = mid - 1; }
    }
    return lo;
  }
  // A declaration's own name, where its field says one.
  static named(value: unknown): string | undefined {
    if (typeof value === 'string') { return value; }
    const v = value as { id?: unknown; name?: unknown } | undefined;
    return typeof v?.id === 'string' ? v.id : typeof v?.name === 'string' ? v.name : undefined;
  }
}
