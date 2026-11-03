import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, renameSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { deserialize, serialize } from 'node:v8';
import type { Module } from './module';

// Parsed Kyr kept on disk between processes (Mission 18's measure of the test suite: a session's start was nine to
// eleven seconds, most of it parsing the same shared rules and adventures in every one of a suite's isolated workers).
// Each text is kept by what it was read with: the grammar and the code that reads it (the language's own sources, and
// the catalogs a module's kinds are read among), so that any change to the language reads every text afresh. For a
// process with a file system; the browser parses as it always has.
export class ParseStore {
  private constructor(private readonly dir: string, private readonly version: string) {}
  static readonly sources = ['src/lang', 'src/information', 'src/canon', 'data/catalog'];
  static open(root = process.cwd()): ParseStore | undefined {
    if (process.env.KYRIE_PARSE_STORE === '0' || !existsSync(join(root, 'src/lang/Kyr.ohm'))) { return undefined; }
    const hash = createHash('sha1');
    for (const file of this.sources.flatMap(d => this.files(join(root, d))).sort()) {
      hash.update(file).update(readFileSync(file));
    }
    const dir = resolve(root, 'node_modules/.cache/kyrie-parse');
    mkdirSync(dir, { recursive: true });
    return new ParseStore(dir, hash.digest('hex'));
  }
  private static files(dir: string): string[] {
    if (!existsSync(dir)) { return []; }
    return readdirSync(dir).flatMap(name => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? this.files(path) : /\.(ts|ohm|json)$/.test(name) ? [path] : [];
    });
  }
  private path(key: string): string {
    return join(this.dir, createHash('sha1').update(this.version).update(key).digest('hex'));
  }
  get(key: string): Module | undefined {
    try { return deserialize(readFileSync(this.path(key))) as Module; } catch { return undefined; }
  }
  // Written whole, then moved into place, so that a worker reading at the same moment reads all of it or none.
  set(key: string, module: Module) {
    try {
      const path = this.path(key), part = `${path}.${process.pid}`;
      writeFileSync(part, serialize(module));
      renameSync(part, path);
    } catch { /* A store that cannot be written is only slower. */ }
  }
}
