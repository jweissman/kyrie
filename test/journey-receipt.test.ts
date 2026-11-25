import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import type { Frame, Message } from '../src/creation/protocol';
import type { PlaySession } from '../src/session/play-session';
import { Digest } from '../src/session/digest';
import { Costs } from '../src/costs';

// A journey's leg told by its receipt, its frame built only where the journey ends (AX-05; platform-separation.md,
// the trust thread's second step), against the journey as it was, every leg's frame built whole (EngineHost.wholeLegs,
// the oracle). The brief's rule: no performance shortcut may break simulation truth. The same journeys, set out on
// from the same world, come to the same frames (the route, each leg as the page tells it, the stop and why, the place,
// the threats and marks, the time, the purse, the narration and the story) and the same game (its digest), and with
// fewer screens built. Played on through arrivals and every kind of stop kite's roads meet in a dozen journeys: pikes
// let down across the road, danger where it comes, night, and the company set upon on the way, and the journey held
// gone on with after each stop. (Wren's fifteen had met a bar, danger and the set-upon; in today's world it
// meets the first two only in some twenty-five, and the set-upon not in forty-five.)
class Both {
  static async begin(whole: boolean): Promise<{ host: EngineHost; frame: Frame }> {
    // A fight on the way is the page's to choose in: pressed through by the company's own tactics, as the page can.
    const host: EngineHost = new EngineHost((m: Message) => {
      if (m.kind === 'frame' && m.frame.combat) { setTimeout(() => void host.handle({ kind: 'fight', through: true }), 0); }
    });
    host.wholeLegs = whole;
    const frame = await host.handle({ kind: 'begin', campaign: 'world', seed: 'kite', origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }) as Frame;
    return { host, frame };
  }
  static digest(host: EngineHost): string {
    return Digest.of((host as unknown as { session: PlaySession }).session.campaign);
  }
  // The frame as the page is given it, but for how long its parts took to build.
  static shown(frame: Frame): string { return JSON.stringify({ ...frame, timing: undefined }); }
  // Where a journey from here sets out for: the way held, gone on with; else one of the places the map offers.
  static whither(frame: Frame, n: number): string | undefined {
    const offered = [...frame.screen.roads ?? [], ...frame.screen.destinations ?? []];
    return frame.bound?.id ?? offered[(n * 7) % Math.max(1, offered.length)]?.id;
  }
}

describe('a journey told leg by leg from its receipts', () => {
  it('comes to the frames and the game the journey built leg by leg came to, with fewer screens', async () => {
    const whole = await Both.begin(true), told = await Both.begin(false);
    expect(Both.shown(told.frame)).toBe(Both.shown(whole.frame));
    const stops = new Set<string>(), screens = { whole: 0, told: 0 };
    let [a, b] = [whole.frame, told.frame], legs = 0, held = 0;
    for (let n = 0; n < 15 && a.screen.running; n++) {
      const to = Both.whither(a, n);
      if (!to) { break; }
      if (a.bound) { held++; }
      const before = Costs.mark();
      a = await whole.host.handle({ kind: 'travel', destination: to }) as Frame;
      const between = Costs.mark();
      b = await told.host.handle({ kind: 'travel', destination: to }) as Frame;
      screens.whole += Costs.since(before).screen!.n - (Costs.since(between).screen?.n ?? 0);
      screens.told += Costs.since(between).screen!.n;
      expect([n, Both.shown(b)]).toEqual([n, Both.shown(a)]);
      expect([n, Both.digest(told.host)]).toEqual([n, Both.digest(whole.host)]);
      stops.add((a.travel!.stopped ?? (a.travel!.arrived ? 'arrived' : '')).split(/[,.:]/)[0]!);
      legs += a.travel!.legs.length;
    }
    // Each kind of stop met (so that the equality is not of arrivals alone), and legs told without their frames.
    expect([...stops]).toEqual(expect.arrayContaining(['arrived', 'Pikes come down across the road',
      'There is danger here', 'Night has come on', 'You were set upon on the way']));
    expect(held).toBeGreaterThan(0);
    expect(legs).toBeGreaterThan(30);
    expect(screens.told).toBeLessThan(screens.whole - legs / 2);
  }, 600000);
});
