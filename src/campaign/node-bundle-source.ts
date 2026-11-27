import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import type { BundleSource } from './bundle-source';
import { ParseCache } from '../lang/parse-cache';
import { ParseStore } from './parse-store';

// A process that reads bundles from disk keeps what it parses there too (see ParseStore).
ParseCache.store ??= ParseStore.open();

export class NodeBundleSource implements BundleSource {
  static readonly shared = new NodeBundleSource();
  // Where the game is installed: the shared rules and catalogs under data/ are its, wherever the command is run from.
  static readonly root = resolve(import.meta.dir, '../..');
  resolve(relative: string, from?: string): string {
    if (from) { return resolve(dirname(from), relative); }
    const here = resolve(relative);
    return relative.startsWith('data/') && !existsSync(here) ? resolve(NodeBundleSource.root, relative) : here;
  }
  identity(path: string): string | undefined {
    const id = relative(NodeBundleSource.root, path);
    return id && id !== '..' && !id.startsWith(`..${sep}`) && !isAbsolute(id) ? id.split(sep).join('/') : undefined;
  }
  read(path: string): Promise<string> { return readFile(path, 'utf8'); }
}
