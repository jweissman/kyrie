import type { BundleSource } from './bundle-source';

// Memoizes deterministic loads per bundle source. Sources are assumed not to change underneath a running process.
export class LoadCache<T> {
  private loaded = new WeakMap<BundleSource, Map<string, Promise<T>>>();
  // One at a time, through to its use: what is loaded joins catalogs the process shares, and two campaigns loaded at
  // once, each declaring a token, met in them and failed (the architecture review's H7).
  private queue: Promise<unknown> = Promise.resolve();
  take<R>(source: BundleSource, key: string, load: () => Promise<T>, use: (loaded: T) => R): Promise<R> {
    const run = this.queue.then(() => this.get(source, key, load)).then(use);
    this.queue = run.catch(() => undefined);
    return run;
  }
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
