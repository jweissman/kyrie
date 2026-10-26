import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import type { Message } from '../web/engine/protocol';
import type { PlaySession } from '../src/session/play-session';
import { KeptGame } from '../web/engine/kept-game';
import { SaveCodec } from '../web/engine/save-codec';
import { GeneratedWorld } from './support/generated';

// A kept state is kept only beside the world it was kept against (the architecture review's A3, from its probe
// persist-stale-world). After a crossing the world grew past what the browser would hold; the engine took the world
// for kept as soon as it had sent it, the next state (smaller) was kept beside the world before, and the game opened
// unchecked without the country the company stood in. Now the page keeps a state only beside its own world and says
// what it kept, and a world not kept goes again with the next state.
class Quota {
  private readonly m = new Map<string, string>();
  constructor(public limit: number) {}
  get used() { let n = 0; for (const [k, v] of this.m) { n += k.length + v.length; } return n; }
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) {
    const was = this.m.get(k)?.length ?? 0;
    if (this.used - was + k.length + v.length > this.limit) { throw new Error('QuotaExceededError'); }
    this.m.set(k, v);
  }
  removeItem(k: string) { this.m.delete(k); }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  get length() { return this.m.size; }
}
describe('a game kept in the browser', () => {
  it('keeps a state only beside its own world, and sends a world again that was not kept', async () => {
    const store = new Quota(Infinity);
    (globalThis as { localStorage?: unknown }).localStorage = store;
    const { ReaderStore } = await import('../web/reader/reader-store');
    const pending: Promise<unknown>[] = [];
    let saves = 0;
    // The page, as reader-app keeps what the engine sends.
    const host: EngineHost = new EngineHost((m: Message) => {
      if (m.kind !== 'saved') { return; }
      const beside = !!m.world || ReaderStore.holds(m.key);
      const saved = beside ? ReaderStore.write(m.save, m.summary, m.world) : undefined;
      if (m.world || !beside) { pending.push(host.handle({ kind: 'kept', key: m.key, ok: !!saved })); }
      saves++;
    });
    // After each command the game is kept (once its frame has gone): wait for that, and for what the page said of it.
    const settle = async () => {
      const was = saves;
      for (let i = 0; i < 600 && saves === was; i++) { await new Promise(r => setTimeout(r, 10)); }
      await Promise.all(pending);
    };
    await host.handle({ kind: 'begin', campaign: 'world', seed: 'thorn', origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    await settle();
    const session = (host as unknown as { session: PlaySession }).session;
    // Out to a march-stone by the ways the page offers, where the country beyond is drawn: the world then grows past
    // what the browser has room for.
    for (const [passage, to] of GeneratedWorld.path(session, 'edge_west')) {
      if (to === 'region__edge_west') { store.limit = store.used + 400_000; }
      await host.handle({ kind: 'perform', command: `go(${passage},${to})` });
      await settle();
    }
    expect(session.campaign.installed.length).toBeGreaterThanOrEqual(18);
    const wait = () => host.handle({ kind: 'perform', command: 'wait' });
    await wait(); await settle();
    // Not kept beside the world before: what the browser has is the game as it last was whole.
    const stale = ReaderStore.read()!, staleState = JSON.parse(await SaveCodec.unpack(stale.text)) as { world: string };
    expect(staleState.world).toBe(KeptGame.key(await SaveCodec.unpack(stale.world!)));
    // Room again: the world goes with the next state, and the two are kept together.
    store.limit = Infinity;
    await wait(); await settle();
    const kept = ReaderStore.read()!, state = JSON.parse(await SaveCodec.unpack(kept.text)) as { world: string };
    expect(state.world).toBe(KeptGame.key(await SaveCodec.unpack(kept.world!)));
    const opened = new EngineHost(() => undefined);
    await opened.handle({ kind: 'resume', saved: kept.text, world: kept.world });
    expect((opened as unknown as { session: PlaySession }).session.campaign.installed.length)
      .toBe(session.campaign.installed.length);
  }, 300000);
});
