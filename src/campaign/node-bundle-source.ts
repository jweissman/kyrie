import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { BundleSource } from './bundle-source';

export class NodeBundleSource implements BundleSource {
  static readonly shared = new NodeBundleSource();
  resolve(relative: string, from?: string): string {
    return from ? resolve(dirname(from), relative) : resolve(relative);
  }
  read(path: string): Promise<string> { return readFile(path, 'utf8'); }
}
