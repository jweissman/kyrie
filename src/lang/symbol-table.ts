import type { Module } from './module';
import type { SymbolNamespace, SiteSpan } from './declaration-sites';
import type { VocabularyContext } from './vocabulary';
import { SymbolReferences, type SymbolOccurrence, type SymbolRole, type SymbolSought } from './symbol-references';
import { ComputedRelations } from './computed-relations';
import { EngineOwned } from './engine-owned';

// One file of an installation, parsed (ModuleParser.parseWithin), and its path.
export interface SymbolSource { module: Module; file: string }
// What a table is built of: the shared rules an installation is read with, and each module installed in it, by its
// installed id, of its files.
export interface SymbolImport { unit: string; namespace: 'relation' | 'measure'; name: string }
export interface SymbolInstallation {
  shared: SymbolSource[];
  modules: { id: string; files: SymbolSource[]; imports?: Record<string, SymbolImport> }[];
}
export interface SymbolSpan extends SiteSpan { file: string }
// authored: written as itself; lowered: made by the lowering of a declaration written (span: that declaration's);
// generated: declared by a generator as a value (span.generator: by whom; no line of the text); unplaced: made by the
// module's lowering as a whole (a discovery's finds, a place's searches), of no one declaration.
export type SymbolOrigin = 'authored' | 'lowered' | 'generated' | 'unplaced';
export interface SymbolDeclaration {
  // unit: the installed module's id, or the shared rules file's module id; module: the id its text declares.
  id: string; namespace: SymbolNamespace; name: string; unit: string; module: string; file: string;
  scope: 'own' | 'shared'; origin: SymbolOrigin; span?: SymbolSpan;
  // What an entity is (place, group, situation…), or that an act is a topic.
  type?: string; meaning?: string;
}
export type SymbolBinding = { status: 'bound'; to: SymbolDeclaration } | { status: 'ambiguous'; candidates: SymbolDeclaration[] }
  | { status: 'language' } | { status: 'catalog' } | { status: 'lexical' } | { status: 'unresolved' };
export interface SymbolReference {
  unit: string; file: string; name: string; sought: SymbolSought; role: SymbolRole;
  // What it is written in (act:light_lamp, fact 3), and where that is: a reference is placed by the declaration that
  // holds it, not yet by its own column.
  within: string; span?: SymbolSpan; binding: SymbolBinding;
}
interface DeclarationInput {
  source: SymbolSource; unit: string; scope: 'own' | 'shared'; namespace: SymbolNamespace; name: string;
  type?: string; meaning?: string;
}
interface DeclarationSite { span: SymbolSpan; lowered: boolean }
const searched: Record<SymbolSought, readonly SymbolNamespace[]> = {
  function: ['relation', 'measure', 'query'], entity: ['entity', 'person'], act: ['act'], kind: ['kind'], rule: ['rule'],
  observation: ['observation'], objective: ['objective'], pursuit: ['pursuit'],
};
const language: ReadonlySet<string> = new Set([...ComputedRelations.names, ...EngineOwned.rules]);

// Kyr's symbol table for one installation (OR-700; doc/architecture/kyr-symbol-table-proposal-2026-11-27.md): every
// name its modules and shared rules declare, once, with its module, namespace, file and where it was declared; and
// each reference, bound to its declaration as Kyr binds it (the module's own first, then the shared rules', then the
// language's own names, then the catalog's kinds), or said to be unresolved or ambiguous. Built from the files' parses
// alone, with where their names were declared (DeclarationSites), and from the catalog context it is given: nothing
// of the process, so two installations' tables never meet. Immutable once built; references are read for a module the
// first time they are asked.
export class SymbolTable {
  private readonly all: SymbolDeclaration[] = [];
  private readonly byUnit = new Map<string, SymbolDeclaration[]>();
  private readonly named = new Map<string, SymbolDeclaration[]>();
  private readonly read = new Map<string, readonly SymbolReference[]>();
  private readonly files = new Map<string, SymbolSource[]>();
  private readonly imports = new Map<string, Map<string, SymbolDeclaration>>();
  private readonly pendingImports = new Map<string, Record<string, SymbolImport>>();
  private readonly siteMaps = new WeakMap<SymbolSource, Map<string, DeclarationSite>>();
  private constructor(private readonly context: VocabularyContext) {}
  static of(context: VocabularyContext, installation: SymbolInstallation): SymbolTable {
    const t = new SymbolTable(context);
    for (const s of installation.shared) { t.declare(s.module.id, 'shared', s); }
    for (const m of installation.modules) {
      for (const f of m.files) { t.declare(m.id, 'own', f); }
      t.pendingImports.set(m.id, m.imports ?? {});
    }
    for (const m of installation.modules) {
      for (const name of Object.keys(m.imports ?? {})) { t.import(m.id, name, []); }
    }
    return t;
  }
  // Every declaration, or a unit's, in the order its files declare them.
  declarations(unit?: string): readonly SymbolDeclaration[] {
    return unit === undefined ? this.all : this.byUnit.get(unit) ?? [];
  }
  // Each declaration of a name in a scope, of the namespaces given.
  lookup(name: string, scope: 'own' | 'shared', namespaces: readonly SymbolNamespace[], unit?: string): SymbolDeclaration[] {
    return (this.named.get(name) ?? []).filter(d => d.scope === scope && namespaces.includes(d.namespace)
      && (unit === undefined || d.unit === unit));
  }
  // A unit's references, each bound.
  references(unit: string): readonly SymbolReference[] {
    let refs = this.read.get(unit);
    if (!refs) { refs = Object.freeze(this.bind(unit)); this.read.set(unit, refs); }
    return refs;
  }
  unresolved(unit: string): SymbolReference[] { return this.references(unit).filter(r => r.binding.status === 'unresolved'); }
  // What a unit declares as its own that the shared rules declare too, of the namespaces given: what it shadows.
  shadowing(unit: string, own: readonly SymbolNamespace[],
    theirs: readonly SymbolNamespace[]): { own: SymbolDeclaration; shared: SymbolDeclaration[] }[] {
    return (this.byUnit.get(unit) ?? []).filter(d => own.includes(d.namespace))
      .map(d => ({ own: d, shared: this.lookup(d.name, 'shared', theirs) })).filter(s => s.shared.length > 0);
  }
  // How a name is bound from a unit: its own, the shared rules', the language's, the catalog's.
  resolve(unit: string, name: string, sought: SymbolSought): SymbolBinding {
    const namespaces = searched[sought];
    const imported = this.imports.get(unit)?.get(name);
    if (imported && namespaces.includes(imported.namespace)) { return { status: 'bound', to: imported }; }
    for (const scope of ['own', 'shared'] as const) {
      const found = this.lookup(name, scope, namespaces, scope === 'own' ? unit : undefined);
      if (found.length) { return SymbolTable.one(found); }
    }
    if (sought === 'function' && language.has(name)) { return { status: 'language' }; }
    if (sought === 'kind' && this.context.kind(name)) { return { status: 'catalog' }; }
    return { status: 'unresolved' };
  }
  // Several declarations of one meaning (a relation declared alike in two files) are one; of several, ambiguous.
  private static one(found: SymbolDeclaration[]): SymbolBinding {
    const meanings = new Set(found.map(d => `${d.namespace}\u0000${d.meaning ?? ''}`));
    return meanings.size === 1 ? { status: 'bound', to: found[0]! } : { status: 'ambiguous', candidates: found };
  }
  private import(unit: string, name: string, stack: string[]): SymbolDeclaration {
    const saved = this.imports.get(unit)?.get(name);
    if (saved) { return saved; }
    const key = `${unit}:${name}`;
    if (stack.includes(key)) { throw new Error(`Cyclic import ${[...stack, key].join(' -> ')}`); }
    const target = this.pendingImports.get(unit)?.[name];
    if (!target) { throw new Error(`Unresolved import ${key}`); }
    const local = this.lookup(name, 'own', [target.namespace], unit);
    const exported = this.lookup(target.name, 'own', [target.namespace], target.unit);
    const left = SymbolTable.one(local), right = SymbolTable.one(exported);
    if (!local.length || !exported.length || left.status !== 'bound' || right.status !== 'bound') {
      throw new Error(`Unresolved or ambiguous import ${unit}:${name} from ${target.unit}:${target.name}`);
    }
    const origin = this.pendingImports.get(target.unit)?.[target.name]
      ? this.import(target.unit, target.name, [...stack, key]) : right.to;
    if (origin.namespace !== target.namespace || left.to.meaning !== origin.meaning) {
      throw new Error(`Incompatible import ${unit}:${name} from ${target.unit}:${target.name}`);
    }
    const imports = this.imports.get(unit) ?? new Map<string, SymbolDeclaration>();
    imports.set(name, origin); this.imports.set(unit, imports);
    return origin;
  }
  private declare(unit: string, scope: 'own' | 'shared', source: SymbolSource) {
    const m = source.module;
    if (!this.byUnit.has(unit)) { this.byUnit.set(unit, []); }
    const files = this.files.get(unit) ?? [];
    files.push(source); this.files.set(unit, files);
    for (const e of m.entities) { this.add({ source, unit, scope, namespace: 'entity', name: e.id, type: e.type }); }
    for (const p of m.people ?? []) { this.add({ source, unit, scope, namespace: 'person', name: p.id, type: 'person' }); }
    for (const r of m.relations) {
      this.add({ source, unit, scope, namespace: 'relation', name: r.name,
        meaning: JSON.stringify({ types: r.types, exclusive: r.exclusive }) });
    }
    for (const r of m.measures) {
      this.add({ source, unit, scope, namespace: 'measure', name: r.name,
        meaning: JSON.stringify({ types: r.types, most: r.most }) });
    }
    for (const q of m.queries) {
      const meaning = q.parameters.map(p => p.type).join(',');
      this.add({ source, unit, scope, namespace: 'query', name: q.name, meaning });
    }
    const kinds = new Set([
      ...m.kinds, ...Object.keys(m.catalog?.items ?? {}), ...Object.keys(m.catalog?.species ?? {}),
    ]);
    for (const k of kinds) {
      this.add({ source, unit, scope, namespace: 'kind', name: k });
    }
    for (const a of m.actions) {
      this.add({ source, unit, scope, namespace: 'act', name: a.id, ...(a.topic ? { type: 'topic' } : {}) });
    }
    for (const r of m.rules ?? []) { this.add({ source, unit, scope, namespace: 'rule', name: r.id }); }
    for (const o of m.observations ?? []) {
      this.add({ source, unit, scope, namespace: 'observation', name: o.id });
    }
    for (const o of m.objectives ?? []) {
      this.add({ source, unit, scope, namespace: 'objective', name: o.id });
    }
    for (const p of m.pursuits ?? []) { this.add({ source, unit, scope, namespace: 'pursuit', name: p.id }); }
  }
  private add(input: DeclarationInput) {
    const { source, unit, scope, namespace, name, ...extra } = input;
    const site = this.sites(source).get(`${namespace}\u0000${name}`);
    const origin: SymbolOrigin = !site ? 'unplaced'
      : site.span.generator ? 'generated' : site.lowered ? 'lowered' : 'authored';
    const n = this.lookup(name, scope, [namespace], unit).length;
    const d: SymbolDeclaration = { id: `${unit}:${namespace}:${name}${n ? `~${n}` : ''}`, namespace, name, unit,
      module: source.module.id, file: source.file, scope, origin, ...site ? { span: site.span } : {}, ...extra };
    this.all.push(d);
    this.byUnit.get(unit)!.push(d);
    const same = this.named.get(name);
    if (same) { same.push(d); } else { this.named.set(name, [d]); }
  }
  // Where each name of a file was declared: the first of each, by namespace and name.
  private sites(source: SymbolSource): Map<string, DeclarationSite> {
    const cached = this.siteMaps.get(source);
    if (cached) { return cached; }
    const sites = new Map<string, DeclarationSite>(), s = source.module.sites;
    for (const d of s?.declared ?? []) {
      const key = `${d.namespace}\u0000${d.name}`;
      if (!sites.has(key)) {
        sites.set(key, { span: { ...s!.spans[d.span]!, file: source.file }, lowered: d.lowered });
      }
    }
    this.siteMaps.set(source, sites);
    return sites;
  }
  private bind(unit: string): SymbolReference[] {
    return (this.files.get(unit) ?? []).flatMap(source => {
      const sites = this.sites(source), facts = source.module.sites;
      return SymbolReferences.of(source.module).map((o: SymbolOccurrence, index): SymbolReference => {
        const subject = o.within;
        const within = 'fact' in subject ? `fact ${subject.fact}` : `${subject.namespace}:${subject.name}`;
        const declaration = 'fact' in subject ? facts?.spans[facts.facts[subject.fact] ?? -1]
          : (o.typeIndex === undefined || subject.namespace !== 'relation' ? undefined
            : facts?.signatureTypes?.find(t => t.index === o.signatureIndex)?.spans[o.typeIndex])
            ?? sites.get(`${subject.namespace}\u0000${subject.name}`)?.span;
        const at = facts?.references?.[index] ?? declaration;
        const span = at ? { ...at, file: source.file } : undefined;
        return { unit, file: source.file, name: o.name, sought: o.sought, role: o.role, within,
          ...span ? { span } : {},
          binding: o.lexical ? { status: 'lexical' } : this.resolve(unit, o.name, o.sought) };
      });
    });
  }
}
