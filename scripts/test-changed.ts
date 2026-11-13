#!/usr/bin/env bun
// What a change touches: the spec files whose imports reach code changed since a commit, and the specs that name a
// changed data file's adventure, module or fixture (data is read at run time, so imports cannot show it); of those, the
// quick ones (test/small, and the specs under two seconds by test/timings.json), on six workers. What it reaches and
// leaves to CI is said, with its kept CI time: nearly every source file is reached by nearly every spec (the median
// by 99 % of the suite: Mission 21's fast-loop.md), so "every spec it reaches" had been the whole suite here.
// With --all, every spec it reaches, however slow (one heavy job at a time).
//   bun scripts/test-changed.ts [since=HEAD] [--workers=6] [--all] [--list]
import { Glob } from 'bun';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

class ChangedSpecs {
  private static readonly transpiler = new Bun.Transpiler({ loader: 'tsx' });
  private static readonly imports = new Map<string, string[]>();
  static run(args: string[]): number {
    const since = args.find(a => !a.startsWith('--')) ?? 'HEAD', all = args.includes('--all');
    const workers = /^--workers=(\d+)$/.exec(args.find(a => a.startsWith('--workers=')) ?? '')?.[1] ?? '6';
    const changed = this.changed(since), specs = [...new Glob('test/**/*.test.ts').scanSync('.')].sort();
    const kept = (JSON.parse(readFileSync('test/timings.json', 'utf8')) as { files: Record<string, number> }).files;
    const code = new Set(changed.filter(f => /\.(ts|tsx)$/.test(f)));
    const reached = specs.filter(s => code.has(s) || [...this.reach(s)].some(f => code.has(f)));
    const touched = [...new Set([...reached, ...this.named(changed, specs)])];
    const run = all ? touched : touched.filter(s => this.quick(s, kept)), left = touched.filter(s => !run.includes(s));
    const minutes = left.reduce((n, s) => n + (kept[s] ?? 0), 0) / 60000;
    console.log(`changed since ${since}: ${changed.length} files; ${touched.length} specs reach them, ${run.length} run here`
      + (left.length ? `; ${left.length} left to CI (${minutes.toFixed(0)} kept CI-minutes; --all runs them)` : ''));
    if (changed.some(f => /^data\/rules\//.test(f))) {
      console.log('the shared rules changed: what they move is CI\'s to find');
    }
    if (args.includes('--list')) { for (const s of run) { console.log(`  ${s}`); } return 0; }
    if (!run.length) { return 0; }
    return Bun.spawnSync(['bun', 'test', `--parallel=${workers}`, '--no-isolate', ...run.map(s => `./${s}`)],
      { stdout: 'inherit', stderr: 'inherit' }).exitCode ?? 1;
  }
  // As the quick suite has them: the small worlds, and the specs under two seconds when the timings were kept.
  private static quick(spec: string, kept: Record<string, number>): boolean {
    return spec.startsWith('test/small/') || (kept[spec] !== undefined && kept[spec] < 2000);
  }
  // What differs from the commit, in it since and in the tree now.
  private static changed(since: string): string[] {
    return [...new Set([...this.lines(['git', 'diff', '--name-only', since]),
      ...this.lines(['git', 'ls-files', '--others', '--exclude-standard'])])];
  }
  private static lines(cmd: string[]): string[] {
    return new TextDecoder().decode(Bun.spawnSync(cmd).stdout).split('\n').filter(Boolean);
  }
  // Every file a spec imports, through what those import (relative imports only: the packages do not change here).
  private static reach(spec: string): Set<string> {
    const seen = new Set<string>(), stack = [spec];
    while (stack.length) {
      const f = stack.pop()!;
      if (seen.has(f)) { continue; }
      seen.add(f);
      stack.push(...this.deps(f));
    }
    return seen;
  }
  private static deps(file: string): string[] {
    const known = this.imports.get(file);
    if (known) { return known; }
    let found: string[] = [];
    try {
      found = this.transpiler.scanImports(readFileSync(file, 'utf8')).flatMap(i => {
        const to = this.resolved(file, i.path);
        return to ? [to] : [];
      });
    } catch { found = []; }
    this.imports.set(file, found);
    return found;
  }
  private static resolved(from: string, spec: string): string | undefined {
    if (!spec.startsWith('.')) { return undefined; }
    const base = resolve(dirname(from), spec);
    const file = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`].find(c => /\.tsx?$/.test(c) && existsSync(c));
    return file && relative(process.cwd(), file);
  }
  // The specs that name a changed data file's adventure, module or fixture directory, or the file itself.
  private static named(changed: string[], specs: string[]): string[] {
    const keys = new Set(changed.filter(f => /^(data|test\/fixtures)\//.test(f)).flatMap(f => {
      const parts = f.split('/');
      return [parts.slice(0, -1).join('/'), parts.at(-2)!, parts.at(-1)!.replace(/\.\w+$/, '')]
        .filter(k => k.length > 3 && !['rules', 'adventures', 'fixtures', 'probes', 'catalog', 'generation'].includes(k));
    }));
    return specs.filter(s => { const text = readFileSync(s, 'utf8'); return [...keys].some(k => text.includes(k)); });
  }
}
process.exit(ChangedSpecs.run(process.argv.slice(2)));
