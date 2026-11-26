import type { BundleSource } from './bundle-source';
import type { CreatureGenerationContext } from '../content';
import { Installed } from '../ports/installed';

// Who a campaign is loaded for, and what is told as each of its modules is taken in (see Campaign.load): waited on,
// so that one that yields lets its host hear what has been asked meanwhile.
export interface Assembly {
  party?: CreatureGenerationContext[]; step?: (done: number, of: number) => void | Promise<void>;
}

// Memoizes deterministic loads per bundle source. Sources are assumed not to change underneath a running process.
export class LoadCache<T> {
  private loaded = new WeakMap<BundleSource, Map<string, Promise<T>>>();
  // Loads in one rules installation can interleave. Different installations wait in order, because a browser without
  // an async carrier cannot keep two installations in scope across awaits (Installed.during).
  private tail?: { id: string; pending: number; wait: Promise<void>; done: Promise<void>; release: () => void };
  take<R>(source: BundleSource, key: string, load: () => Promise<T>, use: (loaded: T) => R): Promise<R> {
    const domain = Installed.current();
    if (!this.tail || this.tail.id !== domain.id) {
      let release!: () => void;
      const done = new Promise<void>(resolve => { release = resolve; });
      this.tail = { id: domain.id, pending: 0, wait: this.tail?.done ?? Promise.resolve(), done, release };
    }
    const group = this.tail;
    group.pending++;
    return group.wait.then(() => Installed.during(domain, async () =>
      use(await this.independent(source, key, load)))).finally(() => {
      if (--group.pending === 0) {
        group.release();
        if (this.tail === group) { this.tail = undefined; }
      }
    });
  }
  private async independent(source: BundleSource, key: string, load: () => Promise<T>): Promise<T> {
    const shared = this.loaded.get(source)?.get(key);
    if (!shared) { return this.get(source, key, load); }
    try { return await shared; } catch {
      if (this.loaded.get(source)?.get(key) === shared) { this.loaded.get(source)!.delete(key); }
      return this.independent(source, key, load);
    }
  }
  get(source: BundleSource, key: string, load: () => Promise<T>): Promise<T> {
    let bySource = this.loaded.get(source);
    if (!bySource) { bySource = new Map(); this.loaded.set(source, bySource); }
    let pending = bySource.get(key);
    if (!pending) {
      const entries = bySource;
      pending = load();
      entries.set(key, pending);
      const started = pending;
      pending.catch(() => { if (entries.get(key) === started) { entries.delete(key); } });
    }
    return pending;
  }
}
