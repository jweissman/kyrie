import { describe, expect, it } from 'bun:test';
import { ReaderStore } from '../web/reader/reader-store';

// A browser's storage, with a quota (as the browser's own: a few megabytes for the whole origin).
class Quota {
  readonly items = new Map<string, string>();
  constructor(private readonly room: number) {}
  getItem(k: string): string | null { return this.items.get(k) ?? null; }
  setItem(k: string, v: string) {
    const used = [...this.items].reduce((n, [key, val]) => n + (key === k ? 0 : key.length + val.length), 0);
    if (used + k.length + v.length > this.room) { throw new Error('QuotaExceededError'); }
    this.items.set(k, v);
  }
  removeItem(k: string) { this.items.delete(k); }
}
const summary = (where: string) => ({ title: 'Kyr', where, when: 'Day 1', company: 'Wenna' });

// The architecture review of 26 October (N1): three separate writes, the world first, could leave a new world beside an
// old state and a summary naming neither, and the game could not be opened again; and nobody said so.
describe('the game kept in the browser', () => {
  it('is kept whole when a write fails part-way, as it was last kept', () => {
    const storage = new Quota(5_000);
    (globalThis as { localStorage?: unknown }).localStorage = storage;
    expect(ReaderStore.write('state one', summary('the green'), { key: 'W1', text: 'world one' })).toBeTruthy();
    expect(ReaderStore.write('state two', summary('the yard'))).toBeTruthy();
    // A world too big for what is left: the write fails, and says so by keeping nothing.
    expect(ReaderStore.write('state three', summary('the crest'), { key: 'W2', text: 'x'.repeat(9_000) })).toBeUndefined();
    const kept = ReaderStore.read()!;
    expect([kept.text, kept.world, kept.where]).toEqual(['state two', 'world one', 'the yard']);
    // What the failed write left is let go by the next that succeeds, and the world kept beside the state is its own.
    expect(ReaderStore.write('state four', summary('the crest'), { key: 'W3', text: 'world three' })).toBeTruthy();
    expect([ReaderStore.read()!.text, ReaderStore.read()!.world]).toEqual(['state four', 'world three']);
    expect([...storage.items.keys()].filter(k => k.startsWith('kyrie.mono.world')).length).toBe(1);
  });
  it('opens a game kept before slots, and carries it into them', () => {
    const storage = new Quota(10_000);
    (globalThis as { localStorage?: unknown }).localStorage = storage;
    storage.setItem('kyrie.mono.v1', 'old state');
    storage.setItem('kyrie.mono.world', 'W0\nold world');
    storage.setItem('kyrie.mono.v1.summary', JSON.stringify({ ...summary('the quay'), world: 'W0' }));
    expect([ReaderStore.read()!.text, ReaderStore.read()!.world]).toEqual(['old state', 'old world']);
    expect(ReaderStore.write('new state', summary('the quay'))).toBeTruthy();
    expect([ReaderStore.read()!.text, ReaderStore.read()!.world]).toEqual(['new state', 'old world']);
    expect(storage.getItem('kyrie.mono.v1')).toBeNull();
  });
});
