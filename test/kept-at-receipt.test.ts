import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import type { Message } from '../src/creation/protocol';
import { Undertakings } from '../src/presentation/undertakings';

// The game kept at a receipt (MT-24, command-receipt.md's second step): the page's host keeps a game once for each
// command committed (its receipt written), and once as it begins, never again for a message that commits nothing (a
// story asked for, a frame drawn again); it had been kept twice for every act. And a command goes through its phases
// in order, its receipt written at the last (OpenCommand).
class Kept {
  static readonly saved: Message[] = [];
  static readonly host = new EngineHost(m => { if (m.kind === 'saved') { Kept.saved.push(m); } });
  // The keep is made a turn after the frame, and packed: waited for, up to five seconds, until there are as many as
  // expected, and a moment more, so that one too many is seen too.
  static async settle(expected: number) {
    for (let i = 0; i < 50 && Kept.saved.length < expected; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    await new Promise(resolve => setTimeout(resolve, 400));
  }
}
describe('a game kept by the page\'s host', () => {
  it('is kept once as it begins and once for each command committed, and not for what commits nothing', async () => {
    const host = Kept.host;
    await host.handle({ kind: 'world', seed: 'a1' });
    await host.handle({ kind: 'creation' });
    await host.handle({ kind: 'set-out', rolled: true, apart: true });
    await Kept.settle(1);
    expect(Kept.saved.length).toBe(1);
    for (let i = 0; i < 3; i++) { await host.handle({ kind: 'perform', command: 'wait' }); await Kept.settle(i + 2); }
    expect(Kept.saved.length).toBe(4);
    expect(host.played!.receipts.length).toBe(3);
    // An aim followed, kept once (two keeps had been asked for it, and both had kept it).
    const aim = Undertakings.held(host.played!.campaign)[0]!;
    await host.handle({ kind: 'perform', command: `follow:${aim.id}` }); await Kept.settle(5);
    expect(Kept.saved.length).toBe(5);
    await host.handle({ kind: 'story' }); await host.handle({ kind: 'receipts' }); await Kept.settle(6);
    expect(Kept.saved.length).toBe(5);
    await host.handle({ kind: 'perform', command: 'wait' }); await Kept.settle(6);
    expect(host.played!.last!.phases).toEqual(['resolved', 'executed', 'expanded', 'told', 'settled', 'committed']);
  }, 120000);
});
