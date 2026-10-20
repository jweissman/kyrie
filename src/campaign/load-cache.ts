import type { BundleSource } from './bundle-source';

// Memoizes deterministic loads per bundle source. Sources are assumed not to change underneath a running process.
export class LoadCache<T> {
  private loaded = new WeakMap<BundleSource, Map<string, Promise<T>>>();
  get(source: BundleSource, key: string, load: () => Promise<T>): Promise<T> {
    let bySource = this.loaded.get(source);
    if (!bySource) { bySource = new Map(); this.loaded.set(source, bySource); }
    let pending = bySource.get(key);
    if (!pending) {
      const entries = bySource;
      pending = load();
      entries.set(key, pending);
      pending.catch(() => entries.delete(key));
    }
    return pending;
  }
}
