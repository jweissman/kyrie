#!/usr/bin/env bun
// The prose lint over the words as written (src/presentation/prose-lint.ts; doc/authoring/plain-prose.md): every
// narrated string of the ordinary prose (the shared rules, the voice tables, the generation tables and templates, the
// origins and their road prologues) read for the banned expressions and constructions of
// data/editorial/prose-lint.json, and listed with the watchlist's constructions (data/editorial/watchlist.json) for an
// editor to read. An authored adventure's prose is its author's, and is not read here (a remarkable moment may earn a
// remarkable sentence); nor what another agent owns (the lint's `owned`), which is listed, not failed.
//   bun scripts/prose-lint.ts [--watch] [--all]
import { readFileSync } from 'node:fs';
import { Glob } from 'bun';
import { ProseLint, type ProseFinding } from '../src/presentation/prose-lint';
import lint from '../data/editorial/prose-lint.json';
import watch from '../data/editorial/watchlist.json';

export interface Placed extends ProseFinding { file: string }
interface Watched { pattern: string; why: string; evidence: string }

export class ProseSource {
  static readonly scope = (lint as { scope: string[] }).scope;
  static readonly owned = (lint as { owned: string[] }).owned.map(p => new RegExp(p));
  static readonly watched: Watched[] = (watch as { watch: Watched[] }).watch;
  static files(): string[] {
    return this.scope.flatMap(g => [...new Glob(g).scanSync('.')]).sort();
  }
  static isOwned(file: string): boolean { return this.owned.some(o => o.test(file)); }
  // Every string of a file a player could read: a Kyr file's quoted strings (its comments aside), a table's strings
  // but its author's notes.
  static strings(file: string): string[] {
    const text = readFileSync(file, 'utf8');
    if (/\.kyrt?$/.test(file)) {
      return text.split('\n').filter(l => !/^\s*(\/\/|#)/.test(l))
        .flatMap(l => [...l.matchAll(/"([^"\n]*[a-z][^"\n]* [^"\n]*)"/g)].map(m => m[1]!));
    }
    return this.walk(JSON.parse(text), []);
  }
  private static walk(v: unknown, out: string[]): string[] {
    if (typeof v === 'string') { if (v.includes(' ')) { out.push(v); } return out; }
    if (Array.isArray(v)) { v.forEach(x => this.walk(x, out)); return out; }
    if (v && typeof v === 'object') {
      Object.entries(v).filter(([k]) => !/^(about|note|notes|why|evidence|_.*)$/.test(k)).forEach(([, x]) => {
        this.walk(x, out);
      });
    }
    return out;
  }
  static banned(): Placed[] {
    return this.files().flatMap(file => this.strings(file)
      .flatMap(s => ProseLint.source(s).map(f => ({ ...f, file }))));
  }
  static watchlist(): Placed[] {
    const res = this.watched.map(w => ({ w, re: new RegExp(w.pattern, 'i') }));
    return this.files().flatMap(file => this.strings(file).flatMap(s => res.filter(r => r.re.test(s))
      .map(r => ({ rule: `watch: ${r.w.pattern}`, text: s, match: r.re.exec(s)![0], file }))));
  }
  static main(args: string[]): number {
    const banned = this.banned(), failing = banned.filter(f => !this.isOwned(f.file));
    for (const f of banned) {
      console.log(`${this.isOwned(f.file) ? 'owned ' : 'FAIL  '}${f.file}: ${f.rule}: ${f.text.slice(0, 140)}`);
    }
    if (args.includes('--watch')) {
      const w = this.watchlist();
      const by = new Map<string, Placed[]>();
      for (const f of w) { by.set(f.rule, [...by.get(f.rule) ?? [], f]); }
      for (const [rule, list] of by) {
        console.log(`\n${rule} (${list.length})`);
        for (const f of list.slice(0, args.includes('--all') ? Infinity : 6)) { console.log(`  ${f.file}: ${f.text.slice(0, 150)}`); }
      }
    }
    console.log(`${failing.length} banned in ${this.files().length} files${banned.length > failing.length
      ? `; ${banned.length - failing.length} in files another owns, listed` : ''}`);
    return failing.length ? 1 : 0;
  }
}
if (import.meta.main) { process.exit(ProseSource.main(process.argv.slice(2))); }
