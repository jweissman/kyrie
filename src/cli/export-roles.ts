import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { KyrLint, type Finding } from './kyr-lint';
import { ModuleBundle, type BundleManifest } from '../campaign/module-bundle';
import { ModuleExports, type ExportReading } from '../campaign/module-exports';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { ModuleCanon } from '../campaign/module-canon';
import { CanonVocabulary } from '../canon/canon-vocabulary';
import type { Module } from '../lang/module';
import type { ModuleDraft } from '../campaign/module-namespace';

// `kyrie lint --exports`: every module's exports in data/, each with the role its entity plays (inferred from the
// module as it is compiled, read on its own: see ModuleExports.infer) and the role declared, where one is. A declared
// role its entity cannot play is an error; an export with no role, advice (the maturity track's step 3).
export interface ModuleReading { module: string; readings: ExportReading[]; error?: string }

export class ExportRoles {
  static manifests(): string[] {
    return KyrLint.walk(join(KyrLint.root, 'data'), f => f === 'module.json')
      .filter(p => (JSON.parse(readFileSync(p, 'utf8')) as BundleManifest).exports);
  }
  // The kinds of the canon (data/imbar), which every module of a world is read among, as it is installed first.
  private static canon?: Promise<Module['catalog']>;
  private static kinds(): Promise<Module['catalog']> {
    const vocabulary = CanonVocabulary.context();
    this.canon ??= ModuleBundle.load(ModuleCanon.request(NodeBundleSource.shared),
      { seed: 'exports', unbound: true, vocabulary },
      NodeBundleSource.shared).then(d => d.instance.module.catalog);
    return this.canon;
  }
  static async read(path: string): Promise<ModuleReading> {
    const module = path.startsWith(KyrLint.root) ? path.slice(KyrLint.root.length + 1) : path;
    const manifest = JSON.parse(readFileSync(path, 'utf8')) as BundleManifest;
    const draft = await this.draft(path);
    return 'error' in draft ? { module, readings: [], error: draft.error }
      : { module, readings: ModuleExports.read(manifest.exports, draft.exports, draft.instance.module) };
  }
  // A module read on its own, among the canon's kinds, its imports unbound; or why it could not be.
  static async draft(path: string): Promise<ModuleDraft | { error: string }> {
    const module = path.startsWith(KyrLint.root) ? path.slice(KyrLint.root.length + 1) : path;
    const id = basename(dirname(path)).replace(/[^A-Za-z0-9-]/g, '-').replace(/^[^A-Za-z]/, 'm');
    const kinds = await this.kinds(), vocabulary = CanonVocabulary.context();
    vocabulary.install(kinds);
    try {
      return await ModuleBundle.load({ id, bundle: module }, { seed: 'exports', unbound: true, kinds, vocabulary },
        NodeBundleSource.shared);
    } catch (e) {
      return { error: (e instanceof Error ? e.message : String(e)).split('\n')[0]! };
    }
  }
  // Its module as installed alone (its declarations as written among it: MT-30's SemanticIds).
  static async module(path: string): Promise<Module | { error: string }> {
    const draft = await this.draft(path);
    return 'error' in draft ? draft : draft.instance.module;
  }
  static findings(read: ModuleReading[]): Finding[] {
    return read.flatMap(({ module, readings, error }) => [
      ...error ? [{ level: 'error' as const, check: 'exports', where: module, message: `not read: ${error}` }] : [],
      ...readings.flatMap((r): Finding[] => {
        if (r.declared && !ModuleExports.admits(r.declared, r.type)) {
          return [{ level: 'error', check: 'exports', where: module,
            message: `${r.name} declared ${r.declared}, but ${r.local} is a ${r.type} (inferred ${r.inferred ?? 'none'})` }];
        }
        return r.declared ? [] : [{ level: 'advice', check: 'exports', where: module,
          message: `${r.name} has no role (inferred ${r.inferred ?? `none: ${r.local} is a ${r.type}`})` }];
      })]);
  }
  static counts(read: ModuleReading[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const r of read.flatMap(m => m.readings)) {
      const key = r.inferred ?? `none (${r.type})`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }
  static async main(args: string[]): Promise<number> {
    const paths = args.filter(a => !a.startsWith('--'));
    const read: ModuleReading[] = [];
    for (const p of paths.length ? paths.map(x => join(KyrLint.root, x)) : this.manifests()) {
      read.push(await this.read(p));
    }
    for (const { module, readings } of read) {
      for (const r of readings) {
        console.log(`${module}  ${r.name} = ${r.local}: ${r.type} -> ${r.inferred ?? 'none'}`
          + `${r.declared ? ` (declared ${r.declared})` : ''}`);
      }
    }
    const findings = this.findings(read), errors = findings.filter(f => f.level === 'error');
    const declared = read.flatMap(m => m.readings).filter(r => r.declared).length;
    console.log(`\n${read.length} modules, ${read.flatMap(m => m.readings).length} exports, ${declared} declared; `
      + `inferred: ${Object.entries(this.counts(read)).map(([k, n]) => `${k} ${n}`).join(', ')}`);
    for (const f of args.includes('--verbose') ? findings : errors) {
      console.log(`  ${f.level} ${f.check}: ${f.where}: ${f.message}`);
    }
    return errors.length ? 1 : 0;
  }
}
