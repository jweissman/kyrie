// `kyrie lint`: checks worlds against the canonical vocabulary (doc/history/architecture-2026-10/ontology.md).
// Recommended content
// must be clean; legacy campaigns are reported so the migration can be measured, not hidden.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ModuleParser } from '../lang/module-parser';
import { SymbolTable } from '../lang/index';
import { CanonVocabulary } from '../canon/canon-vocabulary';
import { PlaySession } from '../session/play-session';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import type { BundleSource } from '../campaign/bundle-source';
import { CampaignLint } from './campaign-lint';
import { AuthorLint } from './author-lint';
import { AdventureNames } from './adventure-names';
import type { Module } from '../lang/module';
import { EngineOwned } from '../lang/engine-owned';
import { ExportRoles } from './export-roles';
import { LintSource } from './lint-source';
import { OfficeLint } from './office-lint';
import { CrossingLint } from './crossing-lint';
import { FictionLint } from './fiction-lint';
import { SiteKindLint } from './site-kind-lint';
import { CompoundKindLint } from './compound-kind-lint';
import { FateChainLint } from './fate-chain-lint';
import { WorldAssembler } from '../world/world-assembler';

// An error fails the lint; a warning fails it in recommended content; advice is for the author to look at, and fails
// nothing (a rule that may be meant: see CampaignLint.anchors).
export interface Finding { level: 'error' | 'warning' | 'advice'; check: string; where: string; message: string }

export class KyrLint {
  static readonly root = resolve(import.meta.dir, '../..');
  // Every campaign the game offers is held to the canonical vocabulary.
  static get recommended(): string[] { return this.campaigns(); }
  // In name order, so that every machine reads the files alike (a module's kinds are known to the files after the one
  // that declares them, and the directory's own order had let a file be skipped on one machine and read on another).
  static walk(dir: string, keep: (file: string) => boolean): string[] {
    return readdirSync(dir).sort().flatMap(f => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? this.walk(p, keep) : keep(f) ? [p] : [];
    });
  }
  // Kyr sources of worlds. The assembler's vocabulary (data/assembly) speaks of the same things at another level and
  // is not part of any world.
  static files(): string[] {
    return this.walk(join(this.root, 'data'), f => f.endsWith('.kyr')).filter(f => !f.includes('/data/assembly/'));
  }
  static campaigns(): string[] {
    return this.walk(join(this.root, 'data'), f => /campaign(\.\w+)?\.json$/.test(f)).map(p => p.slice(this.root.length + 1));
  }
  // Vocabulary: one meaning per name among the shared rules, and no module redefining one of theirs. A module's own
  // relations are its own, by its name (kept, broken in two adventures mean what each says), and are not reported:
  // 1,700 warnings of them hid any new one (Liberty of the Ice friction 16, the Banns at Hessel's 17).
  static vocabulary(parsed = this.parsed()): Finding[] {
    const defs = new Map<string, { file: string; sig: string }[]>(), findings: Finding[] = [];
    for (const { file, module: m } of parsed) {
      for (const r of [...m.relations, ...m.measures]) {
        if (/^(once|said)_/.test(r.name)) { continue; }
        defs.set(r.name, [...(defs.get(r.name) ?? []), { file, sig: r.types.join(',') }]);
      }
    }
    findings.push(...this.twins(parsed));
    for (const [name, list] of defs) {
      const shared = list.filter(d => d.file.startsWith('data/rules/'));
      if (new Set(shared.map(d => d.sig)).size > 1) {
        findings.push({ level: 'warning', check: 'vocabulary', where: name,
          message: `defined with different meanings: ${shared.map(d => `${d.file}(${d.sig})`).join(', ')}` });
      }
      for (const d of shared.length ? list.filter(x => !x.file.startsWith('data/rules/')) : []) {
        findings.push({ level: 'error', check: 'redefinition', where: d.file, message: `redefines canonical ${name}` });
      }
    }
    return findings;
  }
  static parsed(): { file: string; module: Module }[] {
    return this.files().flatMap(file => {
      try { return [{ file: file.slice(this.root.length + 1),
        module: ModuleParser.parseWithin(CanonVocabulary.context(), readFileSync(file, 'utf8')) }]; }
      catch { return []; }
    });
  }
  // A module's own query named as a relation, measure or query of the shared rules, its own relation or measure named
  // as a shared query, or its own action named as a shared action: each is the module's own within it (see
  // ModuleShadow), so a shared name added later renames the module's own and changes what its saves and tests know it
  // by. An error, as a relation's twin is (the disputation's settled() beside the camp's settled(place), Mission 17).
  static twins(parsed: { file: string; module: Module }[]): Finding[] {
    const rules = parsed.filter(p => p.file.startsWith('data/rules/'));
    const own = parsed.filter(p => !p.file.startsWith('data/rules/'));
    const table = SymbolTable.of(CanonVocabulary.context(), {
      shared: rules.map(p => ({ file: p.file, module: p.module })),
      modules: own.map(p => ({ id: p.file, files: [{ file: p.file, module: p.module }] })),
    });
    const shared = table.declarations().filter(d => d.scope === 'shared');
    const queryNames = new Set(shared.filter(d => d.namespace === 'query').map(d => d.name));
    return own.flatMap(({ file }) => {
      const declarations = table.declarations(file);
      const queries = declarations.filter(d => d.namespace === 'query');
      const functions = ['query', 'relation', 'measure'] as const;
      const actions = declarations.filter(d => d.namespace === 'act');
      const shadows = [
        ...queries.filter(q => table.lookup(q.name, 'shared', functions).length).map(q => `query ${q.name}`),
        ...declarations.filter(d => d.namespace === 'relation' || d.namespace === 'measure')
          .filter(d => queryNames.has(d.name)).map(d => d.name),
        ...actions.filter(a => table.lookup(a.name, 'shared', ['act']).length).map(a => `action ${a.name}`),
      ];
      return shadows.map(name => ({ level: 'error' as const, check: 'redefinition', where: file,
        message: `redefines canonical ${name}` }));
    });
  }
  // The concept inventory: every relation and measure name, how many files declare it and where.
  static inventory(): string[] {
    const where = new Map<string, string[]>();
    for (const file of this.files()) {
      let m: Module;
      try { m = ModuleParser.parseWithin(CanonVocabulary.context(), readFileSync(file, 'utf8')); } catch { continue; }
      for (const r of [...m.relations, ...m.measures]) {
        where.set(r.name, [...(where.get(r.name) ?? []), file.slice(this.root.length + 1)]);
      }
    }
    // And what the engine keeps, which a module reads and never writes, by kind (Quittance's friction 2: `recorded`
    // and `knows` found only by loading).
    const kept = Object.entries({ clock: EngineOwned.clock, records: EngineOwned.records,
      projected: EngineOwned.projected, held: EngineOwned.held, knowledge: EngineOwned.knowledge })
      .map(([kind, names]) => `engine ${kind}: ${names.join(', ')}`);
    return [...[...where].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
      .map(([name, files]) => `${String(files.length).padStart(3)}  ${name}  ${files.join(', ')}`), ...kept];
  }
  // A source of its own for a process that reads files that change (the preview), since loads are kept per source.
  static async campaign(path: string, source: BundleSource = NodeBundleSource.shared): Promise<Finding[]> {
    const lint = new CampaignLint(path, await PlaySession.start(path, 'lint', source));
    lint.identity(); lint.shadows(); lint.containment(); lint.passages(); lint.traversal(); lint.geography();
    lint.applicability(); lint.labels(); lint.items(); lint.prose(); lint.domain(); lint.hazards(); lint.placeholders();
    lint.roles();
    lint.anchors(); lint.targets(); lint.keeps(); lint.movers(); lint.endings(); lint.writeOnly(); lint.commitments();
    lint.skies(); lint.weathers();
    AuthorLint.run(lint);
    // An act that would put the company in another hex, which the engine never offers (TR-20).
    CrossingLint.run(lint);
    // Fiction standing in for the rules: a blow, a wound, a defeat or a spell told with nothing of it done (OR-147).
    FictionLint.run(lint);
    // A chain of fates told at the close with no case for some state, so that its ending waits for ever (AU-37).
    FateChainLint.run(lint);
    // A drawn world's towns, where generated people and every module placed there each say who holds what.
    if (LintSource.drawn.has(path)) { await OfficeLint.run(lint, source); }
    return lint.findings;
  }
  static async run(paths: string[]) {
    const results: Record<string, Finding[]> = { vocabulary: this.vocabulary(), names: [...AdventureNames.clashes(),
      ...AdventureNames.twice().map(t => `two adventures of one module id, ${t}`)]
      .map(message => ({ level: 'error', check: 'names', where: 'data/adventures', message })),
    sites: SiteKindLint.findings(SiteKindLint.read(this.root)),
    // Compound kinds named where generation draws a creature (OR-158), against the baseline that only shrinks.
    creatures: CompoundKindLint.run(this.root) };
    for (const path of paths.length ? paths : this.campaigns()) {
      try { results[path] = await this.campaign(path); }
      catch (e) {
        results[path] = [{ level: 'error', check: 'load', where: path, message: (e instanceof Error ? e.message : String(e)).slice(0, 800) }];
      }
    }
    return results;
  }
  // Generated worlds, each as drawn from its seed for the assembler's own company, so that the standing scenarios
  // it places (data/situations: the Gathering, the arcology) are linted as they are played, not only the campaigns.
  // (A source of its own for a spec that puts a mistake back: test/drawn-lint.)
  static async worlds(seeds: string[], source: BundleSource = NodeBundleSource.shared)
    : Promise<Record<string, Finding[]>> {
    const results: Record<string, Finding[]> = {};
    for (const seed of seeds) {
      const world = await WorldAssembler.assemble(seed, source, {});
      LintSource.drawn.add(world.path);
      results[world.path] = await this.campaign(world.path, world.source);
    }
    return results;
  }
  static async main(args: string[]): Promise<number> {
    if (args.includes('--inventory')) { console.log(this.inventory().join('\n')); return 0; }
    // Every module's exports and the role each plays (see ExportRoles).
    if (args.includes('--exports')) { return ExportRoles.main(args); }
    // Errors only, for an author who wants to know whether it loads and plays (the Book of Faces' BOF-14).
    const verbose = args.includes('--verbose'), only = args.includes('--errors');
    const seeds = args.flatMap((a, i) => args[i - 1] === '--world' ? [a] : []);
    const results = seeds.length ? await this.worlds(seeds)
      : await this.run(args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--world'));
    let failed = false;
    for (const [where, findings] of Object.entries(results)) {
      const errors = findings.filter(f => f.level === 'error').length;
      const warnings = findings.filter(f => f.level === 'warning').length, advice = findings.length - errors - warnings;
      // A drawn world is told in full, as recommended content is, but held to its errors only.
      const recommended = this.recommended.includes(where), drawn = seeds.length > 0;
      const tag = recommended ? 'recommended' : drawn ? 'drawn'
        : ['vocabulary', 'sites', 'creatures'].includes(where) ? 'repository' : 'legacy';
      console.log(`${where} [${tag}]: ${errors} errors, ${warnings} warnings${advice ? `, ${advice} to look at` : ''}`);
      for (const f of findings.filter(x => x.level === 'error' || (!only && (verbose || recommended || drawn)))) {
        console.log(`  ${f.level} ${f.check}: ${f.where === where ? '' : `${f.where}: `}${f.message}`);
      }
      // An error fails the lint in any campaign (an author's own, run as a check before play); recommended content
      // must be clean of warnings too.
      if (errors || (recommended && warnings)) { failed = true; }
    }
    return failed ? 1 : 0;
  }
}

