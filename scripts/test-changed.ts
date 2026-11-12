#!/usr/bin/env bun
// What a change touches: the spec files whose imports reach code changed since a commit (bun's --changed), and the
// specs that name a changed data file's adventure, module or fixture (data is read at run time, so --changed cannot
// see it), on six workers. It may be slow when the change is to something everything imports; the quick suite is
// `bun run test:quick`, and the whole suite, the long descents and the browser specs are CI's.
//   bun scripts/test-changed.ts [since=HEAD] [--workers=6]
import { Glob } from 'bun';
import { readFileSync } from 'node:fs';

class ChangedSpecs {
  static run(args: string[]): number {
    const since = args.find(a => !a.startsWith('--')) ?? 'HEAD';
    const workers = /^--workers=(\d+)$/.exec(args.find(a => a.startsWith('--workers=')) ?? '')?.[1] ?? '6';
    const changed = this.changed(since), specs = [...new Glob('test/**/*.test.ts').scanSync('.')].sort();
    const named = this.named(changed, specs);
    console.log(`changed since ${since}: ${changed.length} files; specs naming changed data: ${named.length}`);
    // The shared rules are read by every adventure: no subset finds what a change to them moves.
    if (changed.some(f => /^data\/rules\//.test(f))) {
      console.log('the shared rules changed: what they move is CI\'s to find (or bun run test, alone)');
    }
    const code = Bun.spawnSync(['bun', 'test', `--parallel=${workers}`, '--no-isolate', `--changed=${since}`],
      { stdout: 'inherit', stderr: 'inherit' }).exitCode ?? 1;
    if (!named.length) { return code; }
    const data = Bun.spawnSync(['bun', 'test', `--parallel=${workers}`, '--no-isolate', ...named.map(s => `./${s}`)],
      { stdout: 'inherit', stderr: 'inherit' }).exitCode ?? 1;
    return code || data;
  }
  // What differs from the commit, in it since and in the tree now.
  private static changed(since: string): string[] {
    return [...new Set([...this.lines(['git', 'diff', '--name-only', since]),
      ...this.lines(['git', 'ls-files', '--others', '--exclude-standard'])])];
  }
  private static lines(cmd: string[]): string[] {
    return new TextDecoder().decode(Bun.spawnSync(cmd).stdout).split('\n').filter(Boolean);
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
