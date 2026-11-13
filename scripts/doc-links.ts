#!/usr/bin/env bun
// The documentation's links, checked: every relative link in a Markdown file under doc/ (and the READMEs) that names
// a file in the repository must name one that is there, and every path into doc/ that the code, specs and scripts
// cite in their comments must be there too. What a move of the documents leaves broken is found here, not by a
// reader (the owner, 14 November: the docs' housecleaning). External links and anchors are not checked; a record's
// links out of the documentation are not held (see records).
//   bun scripts/doc-links.ts [--list]
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';

export interface Broken { file: string; link: string }
export class DocLinks {
  static readonly roots = ['README.md', 'data/README.md', 'doc'];
  static readonly cited = ['src', 'web', 'test', 'scripts', 'bin', '.github'];
  static markdown(): string[] {
    return this.roots.flatMap(r => statSync(r).isDirectory() ? this.walk(r, /\.md$/) : [r]);
  }
  // Every relative link in a Markdown file that names something in the repository and finds nothing there.
  static broken(files = this.markdown()): Broken[] {
    return files.flatMap(file => [...readFileSync(file, 'utf8').matchAll(/\]\(([^)\s]+)\)/g)]
      .map(m => decodeURI(m[1]!.split('#')[0]!))
      .filter(link => link && !/^[a-z]+:/i.test(link) && !link.startsWith('/') && /^[\w./-]+$/.test(link))
      .filter(link => !existsSync(normalize(join(dirname(file), link))) && !this.record(file, link))
      .map(link => ({ file, link })));
  }
  // Every path into doc/ that the code cites and finds nothing at.
  static uncited(): Broken[] {
    return this.cited.filter(existsSync).flatMap(d => this.walk(d, /\.(ts|tsx|js|yml|json|kyr|sh)$/))
      .flatMap(file => [...readFileSync(file, 'utf8').matchAll(/\bdoc\/[\w./-]*[\w/]/g)]
        .map(m => m[0].replace(/[.]$/, ''))
        .filter(link => !link.includes('<') && !existsSync(link) && !this.output(file, link))
        .map(link => ({ file, link })));
  }
  // A record (doc/history) is kept as it was written: what it says of code since removed (the Mono
  // client, Reedwake) is history, and only its links within the documentation are held.
  static readonly records = ['doc/history/', 'doc/history/playtests/'];
  private static record(file: string, link: string): boolean {
    const target = normalize(join(dirname(file), link));
    return this.records.some(r => file.startsWith(r)) && !target.startsWith('doc/');
  }
  // A script's own output: a directory it writes, in a place that is there.
  private static output(file: string, link: string): boolean {
    return file.startsWith('scripts/') && !/\.\w+$/.test(link) && existsSync(dirname(link));
  }
  static main(args: string[]): number {
    const broken = [...this.broken(), ...this.uncited()];
    if (args.includes('--list')) { for (const b of broken) { console.log(`${b.file}: ${b.link}`); } }
    console.log(`${broken.length} broken of the documentation's links`);
    return broken.length ? 1 : 0;
  }
  private static walk(dir: string, re: RegExp): string[] {
    return readdirSync(dir).flatMap(f => {
      const p = join(dir, f);
      if (f === 'node_modules' || f.startsWith('.') && f !== '.github') { return []; }
      return statSync(p).isDirectory() ? this.walk(p, re) : re.test(f) ? [p] : [];
    });
  }
}
if (import.meta.main) { process.exit(DocLinks.main(process.argv.slice(2))); }
