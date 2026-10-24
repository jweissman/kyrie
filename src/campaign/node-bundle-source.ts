import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { BundleSource } from './bundle-source';

export class NodeBundleSource implements BundleSource {
  static readonly shared = new NodeBundleSource();
  // Where the game is installed: the shared rules and catalogs under data/ are its, wherever the command is run from.
  static readonly root = resolve(import.meta.dir, '../..');
  resolve(relative: string, from?: string): string {
    if (from) { return resolve(dirname(from), relative); }
    const here = resolve(relative);
    return relative.startsWith('data/') && !existsSync(here) ? resolve(NodeBundleSource.root, relative) : here;
  }
  read(path: string): Promise<string> { return readFile(path, 'utf8'); }
}
