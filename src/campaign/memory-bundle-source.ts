import { BundlePaths, type BundleSource } from './bundle-source';

// Bundled text files keyed by normalized relative path, for browsers and other filesystem-free hosts.
export class MemoryBundleSource implements BundleSource {
  private files: Map<string, string>;
  constructor(files: Record<string, string>) {
    this.files = new Map(Object.entries(files).map(([path, text]) => [BundlePaths.normalize(path), text]));
  }
  get paths(): string[] { return [...this.files.keys()]; }
  resolve(relative: string, from?: string): string {
    return BundlePaths.normalize(from && !relative.startsWith('/') ? `${BundlePaths.dirname(from)}/${relative}` : relative);
  }
  read(path: string): Promise<string> {
    const text = this.files.get(BundlePaths.normalize(path));
    return text === undefined ? Promise.reject(new Error(`Missing bundled file ${path}`)) : Promise.resolve(text);
  }
}
