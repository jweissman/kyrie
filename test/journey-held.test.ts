import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import { SaveCodec } from '../web/engine/save-codec';
import type { Frame, Message } from '../web/engine/protocol';

// A journey set out on is held until the company comes to the place (the owner's interim report: a destination set out
// for was forgotten as soon as the journey stopped, and the player went round in circles): every page says where the
// company is bound, the next way and how long in all; it is kept with the game; it is gone on arriving, and at a word.
class Held {
  static saves: string[] = [];
  static async begin(): Promise<{ host: EngineHost; first: Frame }> {
    const host = new EngineHost((m: Message) => { if (m.kind === 'saved') { Held.saves.push(m.save); } });
    const first = await host.handle({ kind: 'begin', campaign: 'world', seed: 'kite', origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'ranger' }] }) as Frame;
    return { host, first };
  }
  static inner(host: EngineHost) {
    return host as unknown as { bound?: string; frame(): Frame; keep(): Promise<void> };
  }
}

describe('a journey held', () => {
  it('is said on every page until it is come to, kept with the game, and given up at a word', async () => {
    const { host, first } = await Held.begin(), inner = Held.inner(host);
    const [near, far] = [...first.screen.destinations ?? [], ...first.screen.roads ?? []];
    expect(first.bound).toBeUndefined();
    // Bound somewhere and stopped on the way (as a journey stops for someone in the road): the page says where to.
    inner.bound = far!.id;
    const held = inner.frame().bound!;
    expect([held.name, held.legs.length > 0, held.minutes > 0]).toEqual([far!.name, true, true]);
    await inner.keep();
    expect((JSON.parse(await SaveCodec.unpack(Held.saves.at(-1)!)) as { bound?: string }).bound).toBe(far!.id);
    // Gone once the company comes there, by setting out for it.
    const arrived = await host.handle({ kind: 'travel', destination: near!.id }) as Frame;
    expect(arrived.travel?.arrived ? arrived.bound : 'stopped').toBeUndefined();
    // And given up.
    inner.bound = far!.id;
    expect((await host.handle({ kind: 'unbind' }) as Frame).bound).toBeUndefined();
  }, 120000);
});
