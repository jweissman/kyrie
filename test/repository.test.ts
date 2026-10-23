import { describe, expect, it } from 'bun:test';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

// The repository's standing layout (doc/CONTRACT.md): bin/ holds only the kyrie command; development utilities live
// in scripts/; the command's tools live in src/cli. What package.json runs exists, and nothing still sends a reader or
// a script to a bin/ file that is not there.
class Layout {
  static readonly root = resolve(import.meta.dir, '..');
  static files(dir: string): string[] {
    return readdirSync(join(this.root, dir), { withFileTypes: true }).flatMap(e => e.isDirectory()
      ? this.files(join(dir, e.name)) : [join(dir, e.name)]);
  }
  // Where a stale bin/ path would mislead: code, tests, scripts, data, and the living documentation.
  static readonly living = ['src', 'test', 'scripts', 'data', 'web/reader', 'web/engine', 'doc/authoring', 'doc/handbook'];
}

describe('the repository', () => {
  it('keeps only the kyrie command in bin/, executable, launching src/cli', () => {
    expect(readdirSync(join(Layout.root, 'bin'))).toEqual(['kyrie']);
    const kyrie = join(Layout.root, 'bin/kyrie');
    expect(statSync(kyrie).mode & 0o111).not.toBe(0);
    expect(readFileSync(kyrie, 'utf8')).toMatch(/^#!\/usr\/bin\/env bun\n[\s\S]*src\/cli\/kyrie\.ts/);
  });
  it('runs from package.json only files that exist', () => {
    const pkg = JSON.parse(readFileSync(join(Layout.root, 'package.json'), 'utf8')) as
      { scripts: Record<string, string>; bin: Record<string, string> };
    const named = [...Object.values(pkg.scripts), ...Object.values(pkg.bin)]
      .flatMap(s => [...s.matchAll(/(?:^|\s|\.\/)((?:bin|scripts|src)\/[\w./-]+)/g)].map(m => m[1]!));
    expect(named.filter(path => !existsSync(join(Layout.root, path)))).toEqual([]);
  });
  it('sends nobody to a bin/ script that is not there', () => {
    const stale = Layout.living.flatMap(dir => Layout.files(dir))
      .filter(f => /\.(ts|tsx|json|md|sh|kyr|kyrt)$/.test(f) && !f.endsWith('bundles.generated.json'))
      .filter(f => /\bbin\/(?!kyrie\b)[\w-]+\.ts\b/.test(readFileSync(join(Layout.root, f), 'utf8')));
    expect(stale).toEqual([]);
  });
});
