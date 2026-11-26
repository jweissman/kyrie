import { describe, expect, it } from 'bun:test';
import { LoadCache } from '../../src/campaign/load-cache';
import type { BundleSource } from '../../src/campaign/bundle-source';

const source: BundleSource = { resolve: p => p, read: async () => '' };

describe('campaign load scheduling', () => {
  it('lets a source await another load under the same installation', async () => {
    const cache = new LoadCache<string>();
    const result = await cache.take(source, { key: 'first', installation: 'same' },
      () => cache.take(source, { key: 'second', installation: 'same' }, async () => 'second', x => x),
      x => x);
    expect(result).toBe('second');
  });
  it('holds a different installation until all current loads finish, including on failure', async () => {
    const cache = new LoadCache<string>(), seen: string[] = [];
    let release!: () => void;
    const pause = new Promise<void>(resolve => { release = resolve; });
    const first = cache.take(source, { key: 'first', installation: 'one' }, async () => {
      seen.push('first'); await pause; throw new Error('failed');
    }, x => x);
    const second = cache.take(source, { key: 'second', installation: 'two' }, async () => {
      seen.push('second'); return 'second';
    }, x => x);
    expect(seen).toEqual(['first']);
    release();
    await expect(first).rejects.toThrow('failed');
    expect(await second).toBe('second');
    expect(seen).toEqual(['first', 'second']);
  });
});
