import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import { PlaySession } from '../src/session/play-session';
import { Digest } from '../src/session/digest';
import type { Frame, Message } from '../src/creation/protocol';

// OR-120, OR-121: Set out now in under a second from the click to the first playable frame. The country a new game
// will begin in is drawn while the title shows (ahead, by the seed the game will use), and the start Set out now asks
// made ready behind it (EngineForesight, EngineStarts.foresee). The click asks for the world by the same seed (the one
// drawn, never drawn again) and sets out rolled, the life drawn whole from creation's defaults; the first frame is the
// start made ready, taken. Measured once the start is made ready, as it is by the time a player has read the title
// (warm: the worker has drawn and placed it); the budget is the owner's second, against about 0.1 s measured here (a
// tenfold headroom for CI). Determinism: the game set out on is the very one a cold Set out now on the same seed makes,
// its whole checkpoint alike.
class Now {
  static readonly seed = 'bakoru';
  static readonly budget = 1000;
  static host() {
    const said: string[] = [];
    const host = new EngineHost((m: Message) => { if (m.kind === 'progress' && !m.step) { said.push(m.stage); } });
    return { host, said };
  }
  // The click: the world asked for by the seed, and set out rolled, as the page's Set out now asks (ReaderOpening.now).
  static async click(host: EngineHost): Promise<{ frame: Frame; ms: number }> {
    const began = performance.now();
    await host.handle({ kind: 'world', seed: Now.seed });
    await host.handle({ kind: 'creation' });
    const frame = await host.handle({ kind: 'set-out', rolled: true, apart: true }) as Frame;
    return { frame, ms: performance.now() - began };
  }
  static kept(host: EngineHost) {
    const session = host.played!;
    return { checkpoint: JSON.stringify(session.checkpoint()), digest: Digest.of(session.campaign) };
  }
}

describe('Set out now', () => {
  afterEach(() => { mock.restore(); });
  it('is in the world within a second of the click, the start drawn ahead taken, and the very game a cold one is',
    async () => {
      const started = spyOn(PlaySession, 'start');
      const ahead = Now.host();
      await ahead.host.handle({ kind: 'ahead', seed: Now.seed });
      // The title is up: the country is drawn, and the start made ready behind it (the worker idle again).
      await ahead.host.idle();
      expect(started.mock.calls.length).toBe(1);
      const { frame, ms } = await Now.click(ahead.host);
      console.log(`  Set out now: ${ms.toFixed(0)} ms from the click to the first frame (${JSON.stringify(frame.timing)})`);
      expect(ms).toBeLessThan(Now.budget);
      // Taken, not begun again: nothing drawn afresh, no second start.
      expect(ahead.said).toEqual(['Placing its people', 'Telling where you are']);
      expect(started.mock.calls.length).toBe(1);
      expect(frame.leaf.prologue).toBeDefined();
      // The life drawn whole: its calling's way, the weapon it strikes best with and its name, not the bare protagonist
      // the country was drawn with (its trade here the reason for coming's own, which the world gives it).
      const life = frame.transcript.drawn?.party?.[0];
      expect([!!life?.traits?.length, !!life?.weapon, !!life?.name]).toEqual([true, true, true]);
      const prepared = Now.kept(ahead.host);
      // Cold: the same click on the same seed with nothing drawn ahead.
      const cold = Now.host();
      await Now.click(cold.host);
      expect(cold.said[0]).toBe('Drawing the world');
      const fresh = Now.kept(cold.host);
      expect(prepared.digest).toBe(fresh.digest);
      expect(prepared.checkpoint === fresh.checkpoint).toBe(true);
    }, 120000);
});
