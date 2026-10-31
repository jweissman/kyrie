import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import type { Frame, Message } from '../web/engine/protocol';
import { MenuModel } from '../web/reader/menu-model';

// The glance as the host carries it to the page (OWN-18, OWN-19): on every frame's leaf; a journey set out on and not
// yet come to the end of is gone on with first of what the aim asks ("Go on to …"), by the very choice the page draws
// for it; and a journey made is one line where it ends.
class Hosted {
  static async begin(): Promise<{ host: EngineHost; first: Frame }> {
    const host = new EngineHost((_: Message) => undefined);
    const first = await host.handle({ kind: 'begin', campaign: 'world', seed: 'kite', origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'ranger' }] }) as Frame;
    return { host, first };
  }
  static inner(host: EngineHost) { return host as unknown as { bound?: string; frame(): Frame }; }
}
describe('the glance on the frame', () => {
  it('opens the game, goes on with a journey held, and tells a journey made in a line', async () => {
    const { host, first } = await Hosted.begin(), inner = Hosted.inner(host);
    expect(first.leaf.glance?.arrival).toBe('opening');
    const known = [...first.screen.destinations ?? [], ...first.screen.roads ?? []], far = known.at(-1)!;
    inner.bound = far.id;
    const held = inner.frame(), glance = held.leaf.glance!;
    const on = glance.acts.find(a => a.why === 'bound')!;
    expect(on).toMatchObject({ choice: `travel:${far.id}`, tier: 1, label: `Go on to ${held.bound!.name}` });
    const at = glance.acts.indexOf(on);
    expect(glance.acts.filter(a => a.tier === 0).every(a => glance.acts.indexOf(a) < at)).toBe(true);
    expect(glance.acts.length).toBeLessThanOrEqual(3);
    // Drawn among the choices, or in a town as going out to the country (see MenuModel.place).
    const menu = MenuModel.build(held, 'here', []);
    expect([...menu.choices.map(c => c.id), ...menu.overland ?? []]).toContain(on.choice);
    expect(glance.ways).not.toContain(on.choice);
    inner.bound = undefined;
    const went = await host.handle({ kind: 'travel', destination: known[0]!.id }) as Frame;
    expect(went.travel!.legs.length).toBeGreaterThan(0);
    expect(went.leaf.glance?.came).toEqual(expect.any(String));
  }, 120000);
});
