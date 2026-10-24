// `kyrie lint`: checks worlds against the canonical vocabulary (doc/architecture/ontology.md). Recommended content
// must be clean; legacy campaigns are reported so the migration can be measured, not hidden.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ModuleParser } from '../lang/module-parser';
import { PlaySession } from '../session/play-session';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import type { BundleSource } from '../campaign/bundle-source';
import { CampaignLint } from './campaign-lint';
import type { Module } from '../lang/module';

export interface Finding { level: 'error' | 'warning'; check: string; where: string; message: string }

export class KyrLint {
  static readonly root = resolve(import.meta.dir, '../..');
  // Every campaign the game offers is held to the canonical vocabulary.
  static get recommended(): string[] { return this.campaigns(); }
  static walk(dir: string, keep: (file: string) => boolean): string[] {
    return readdirSync(dir).flatMap(f => {
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
  // Vocabulary: one meaning per name; campaigns do not redefine canonical rule vocabulary.
  static vocabulary(): Finding[] {
    const defs = new Map<string, { file: string; sig: string }[]>(), findings: Finding[] = [];
    for (const file of this.files()) {
      let m: Module;
      try { m = ModuleParser.parse(readFileSync(file, 'utf8')); } catch { continue; }
      for (const r of [...m.relations, ...m.measures]) {
        if (/^(once|said)_/.test(r.name)) { continue; }
        defs.set(r.name, [...(defs.get(r.name) ?? []), { file: file.slice(this.root.length + 1), sig: r.types.join(',') }]);
      }
    }
    for (const [name, list] of defs) {
      if (new Set(list.map(d => d.sig)).size > 1) {
        findings.push({ level: 'warning', check: 'vocabulary', where: name,
          message: `defined with different meanings: ${list.map(d => `${d.file}(${d.sig})`).join(', ')}` });
      }
      const canonical = list.some(d => d.file.startsWith('data/rules/'));
      for (const d of list.filter(x => !x.file.startsWith('data/rules/'))) {
        findings.push({ level: canonical ? 'error' : 'warning', check: canonical ? 'redefinition' : 'campaign-vocabulary',
          where: d.file, message: canonical ? `redefines canonical ${name}` : `campaign-local relation ${name}` });
      }
    }
    return findings;
  }
  // The concept inventory: every relation and measure name, how many files declare it and where.
  static inventory(): string[] {
    const where = new Map<string, string[]>();
    for (const file of this.files()) {
      let m: Module;
      try { m = ModuleParser.parse(readFileSync(file, 'utf8')); } catch { continue; }
      for (const r of [...m.relations, ...m.measures]) {
        where.set(r.name, [...(where.get(r.name) ?? []), file.slice(this.root.length + 1)]);
      }
    }
    return [...where].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
      .map(([name, files]) => `${String(files.length).padStart(3)}  ${name}  ${files.join(', ')}`);
  }
  // A source of its own for a process that reads files that change (the preview), since loads are kept per source.
  static async campaign(path: string, source: BundleSource = NodeBundleSource.shared): Promise<Finding[]> {
    const lint = new CampaignLint(path, await PlaySession.start(path, 'lint', source));
    lint.identity(); lint.containment(); lint.passages(); lint.traversal(); lint.geography();
    lint.applicability(); lint.labels(); lint.items(); lint.prose(); lint.domain();
    return lint.findings;
  }
  static async run(paths: string[]) {
    const results: Record<string, Finding[]> = { vocabulary: this.vocabulary() };
    for (const path of paths.length ? paths : this.campaigns()) {
      try { results[path] = await this.campaign(path); }
      catch (e) {
        results[path] = [{ level: 'error', check: 'load', where: path, message: (e instanceof Error ? e.message : String(e)).slice(0, 800) }];
      }
    }
    return results;
  }
  static async main(args: string[]): Promise<number> {
    if (args.includes('--inventory')) { console.log(this.inventory().join('\n')); return 0; }
    const verbose = args.includes('--verbose');
    const results = await this.run(args.filter(a => !a.startsWith('--')));
    let failed = false;
    for (const [where, findings] of Object.entries(results)) {
      const errors = findings.filter(f => f.level === 'error').length, warnings = findings.length - errors;
      const recommended = this.recommended.includes(where);
      const tag = recommended ? 'recommended' : where === 'vocabulary' ? 'repository' : 'legacy';
      console.log(`${where} [${tag}]: ${errors} errors, ${warnings} warnings`);
      for (const f of findings.filter(x => verbose || recommended || x.level === 'error')) {
        console.log(`  ${f.level} ${f.check}: ${f.where === where ? '' : `${f.where}: `}${f.message}`);
      }
      // An error fails the lint in any campaign (an author's own, run as a check before play); recommended content
      // must be clean of warnings too.
      if (errors || (recommended && findings.length)) { failed = true; }
    }
    return failed ? 1 : 0;
  }
}

