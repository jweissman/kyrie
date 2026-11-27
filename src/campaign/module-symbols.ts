import { SymbolTable, type SymbolDeclaration, type SymbolImport, type SymbolInstallation, type SymbolSource,
  type VocabularyContext }
  from '../lang/index';
import type { SourceFile, FileSource } from '../lang';
import { ModuleExports, type ExportEntry } from './module-exports';
import type { InstalledModule } from './definition';
import type { ModuleDraft } from './module-namespace';
import type { Module } from '../lang';

type Unit = SymbolInstallation['modules'][number];
export interface InstalledSymbols {
  unit: Unit; exports: Record<string, SymbolImport>; bindings: Record<string, SymbolDeclaration>;
}

export class ModuleSymbols {
  private static needed(module: Module, imports: Record<string, string>,
    exports: Record<string, ExportEntry> | undefined): boolean {
    return [...Object.keys(imports), ...Object.values(ModuleExports.locals(exports))]
      .some(name => ModuleExports.vocabulary(name, module) !== undefined);
  }
  static prepare(draft: ModuleDraft, at: Omit<Parameters<typeof ModuleSymbols.bind>[0], 'own' | 'shared'> & {
    module: Module; unbound?: boolean; mine: Module[]; files: SourceFile[]; rules: SourceFile[];
    declared: (FileSource | undefined)[];
    parse(context: VocabularyContext, file: SourceFile): Module;
    parseOwn(context: VocabularyContext, files: SourceFile[], values: (FileSource | undefined)[]): Module[];
  }): void {
    if (this.needed(at.module, at.imports, at.exports)) {
      const originals = at.mine.length ? at.mine : at.parseOwn(at.context, at.files, at.declared);
      const own = originals.map((module, i) => ({ module, file: at.files[i]!.path }));
      const shared = at.rules.map(file => ({ module: at.parse(at.context.fork(), file), file: file.path }));
      draft.symbols = this.bind({ ...at, own, shared });
    }
    if (at.unbound) { return; }
    const declared = ModuleExports.declared(at.exports);
    if (!Object.keys(declared).length) { return; }
    ModuleExports.check(at.id, ModuleExports.read(at.exports, draft.exports, draft.instance.module));
    draft.exported = declared;
  }
  static bind(at: { id: string; context: VocabularyContext; own: SymbolSource[]; shared: SymbolSource[];
    imports: Record<string, string>; requested: Record<string, string> | undefined;
    exports: Record<string, ExportEntry> | undefined; installed: InstalledModule[] | undefined }): InstalledSymbols {
    const imports: Record<string, SymbolImport> = {};
    for (const local of Object.keys(at.imports)) {
      const namespace = this.vocabulary(local, at.own);
      if (!namespace) { continue; }
      const [owner, name] = (at.requested?.[local] ?? '').split('.');
      const target = at.installed?.find(m => m.id === owner)?.symbols?.exports[name ?? ''];
      if (!target || target.namespace !== namespace) {
        throw new Error(`Import ${local} has no matching installed declaration`);
      }
      imports[local] = target;
    }
    const unit: Unit = { id: at.id, files: at.own, imports };
    const units = [...at.installed?.flatMap(m => m.symbols ? [m.symbols.unit] : []) ?? [], unit];
    const table = SymbolTable.of(at.context, { shared: at.shared, modules: units });
    const bindings: Record<string, SymbolDeclaration> = {};
    for (const local of Object.keys(imports)) {
      const binding = table.resolve(at.id, local, 'function');
      if (binding.status !== 'bound') { throw new Error(`Import ${local} did not bind to a declaration`); }
      bindings[local] = binding.to;
    }
    const exports: Record<string, SymbolImport> = {};
    for (const [exported, local] of Object.entries(ModuleExports.locals(at.exports))) {
      const own = this.vocabulary(local, at.own);
      const binding = table.resolve(at.id, local, 'function');
      if (own) { exports[exported] = { unit: at.id, name: local, namespace: own }; }
      else if (binding.status === 'bound' && binding.to.scope === 'shared'
        && (binding.to.namespace === 'relation' || binding.to.namespace === 'measure')) {
        exports[exported] = { unit: binding.to.unit, name: local, namespace: binding.to.namespace, scope: 'shared' };
      }
    }
    return { unit: { ...unit, files: unit.files.map(this.signatures) }, exports, bindings };
  }
  private static signatures(source: SymbolSource): SymbolSource {
    const m = source.module, sites = m.sites;
    return { file: source.file, module: { id: m.id, name: m.name, description: m.description,
      kinds: m.kinds, relations: m.relations, measures: m.measures, entities: [], queries: [], initial: [], actions: [],
      goal: { kind: 'boolean', value: false }, budget: { kind: 'number', value: 0 },
      ...m.catalog ? { catalog: m.catalog } : {},
      ...sites ? { sites: { spans: sites.spans, declared: sites.declared.filter(d =>
        ['kind', 'relation', 'measure'].includes(d.namespace)), facts: [], ...sites.signatureTypes
        ? { signatureTypes: sites.signatureTypes } : {} } } : {} } };
  }
  private static vocabulary(name: string, sources: SymbolSource[]): 'relation' | 'measure' | undefined {
    return sources.map(s => ModuleExports.vocabulary(name, s.module)).find(Boolean);
  }
}
