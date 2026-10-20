import type { BundleSource } from './bundle-source';

// Generated files laid over another source: a generated world's modules beside the authored ones they import.
export class OverlayBundleSource implements BundleSource {
  private files = new Map<string, string>();
  constructor(private readonly base: BundleSource, files: Record<string, string>) {
    for (const [path, text] of Object.entries(files)) { this.files.set(base.resolve(path), text); }
  }
  resolve(relative: string, from?: string): string { return this.base.resolve(relative, from); }
  read(path: string): Promise<string> {
    const text = this.files.get(path);
    return text === undefined ? this.base.read(path) : Promise.resolve(text);
  }
}
