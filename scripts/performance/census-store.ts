import type { ParseCache } from '../../src/lang';

type Store = NonNullable<typeof ParseCache.store>;
type Module = Parameters<Store['set']>[1];
// The store as a fresh world meets it: asked only what the census heard asked (census: everything, and recorded).
export class CensusStore implements Store {
  constructor(private readonly store: Store, private readonly known: Set<string>, private readonly census: boolean) {}
  static key(key: string): string { return Bun.hash(key).toString(36); }
  get(key: string): Module | undefined {
    if (this.census) { this.known.add(CensusStore.key(key)); return this.store.get(key); }
    return this.known.has(CensusStore.key(key)) ? this.store.get(key) : undefined;
  }
  set(key: string, module: Module): void { if (this.census) { this.store.set(key, module); } }
}
