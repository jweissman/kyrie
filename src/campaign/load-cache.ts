import type { BundleSource } from './bundle-source';
import type { CreatureGenerationContext } from '../content';

// Who a campaign is loaded for, and what is told as each of its modules is taken in (see Campaign.load): waited on,
// so that one that yields lets its host hear what has been asked meanwhile.
export interface Assembly {
  party?: CreatureGenerationContext[]; step?: (done: number, of: number) => void | Promise<void>;
  // The placements its manifest offers held back until first neared (see PendingPlacements): the life's choice.
  lazy?: boolean;
}

// Memoizes deterministic loads per bundle source. Sources are assumed not to change underneath a running process.
export class LoadCache<T> {
  private loaded = new WeakMap<BundleSource, Map<string, Promise<T>>>();
  // Loads within one installation can interleave; distinct installations wait for each other because the browser
  // cannot carry Installed.during across awaits independently.
  private active?: { id: string; count: number; done: Promise<void>; finish: () => void };
  async take<R>(source: BundleSource, at: { key: string; installation: string }, load: () => Promise<T>,
    use: (loaded: T) => R): Promise<R> {
    while (this.active && this.active.id !== at.installation) { await this.active.done; }
    if (!this.active) {
      let finish!: () => void;
      const done = new Promise<void>(resolve => { finish = resolve; });
      this.active = { id: at.installation, count: 0, done, finish };
    }
    const active = this.active;
    active.count++;
    try { return use(await this.get(source, at.key, load)); }
    finally {
      if (--active.count === 0) { this.active = undefined; active.finish(); }
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
      pending.catch(() => entries.delete(key));
    }
    return pending;
  }
}
