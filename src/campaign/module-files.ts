import type { BundleSource } from './bundle-source';
import type { BundleManifest } from './module-bundle';

export class ModuleFiles {
  static async read(at: {
    manifest: BundleManifest; path: string; source: BundleSource; situations: string[]; rules: string[];
  }): Promise<string[]> {
    const { manifest, path, source, situations, rules } = at;
    const settled = await Promise.allSettled([...situations, ...rules, manifest.generation?.tables,
      manifest.generation?.templates].map((p, i) => !p ? Promise.resolve('{}')
      : source.read(i < situations.length + rules.length ? p : source.resolve(p, path))));
    return settled.map(result => {
      if (result.status === 'rejected') { throw result.reason; }
      return result.value;
    });
  }
}
