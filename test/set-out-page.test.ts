import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import type { Frame } from '../web/engine/protocol';
import { MenuModel } from '../web/reader/menu-model';
import { Words } from '../web/reader/words';
import { PlayerView } from '../src/presentation/player-view';
import type { PlaySession } from '../src/session/play-session';

// The page of a game in a generated world, as the web engine gives it: where it offers to set out for, and where the
// company is bound.
class Page {
  static async begin(origin: string): Promise<{ host: EngineHost; first: Frame }> {
    const host = new EngineHost(() => undefined);
    const first = await host.handle({ kind: 'begin', campaign: 'world', seed: 'kite', origin,
      party: [{ name: 'Aud', raceId: 'human', classId: 'ranger' }] }) as Frame;
    return { host, first };
  }
  static inner(host: EngineHost) {
    return host as unknown as { bound?: string; frame(): Frame; session: PlaySession };
  }
  static going(frame: Frame): string[] { return (MenuModel.build(frame, 'here', []).destinations ?? []).map(c => c.label); }
  // Takes the first way on whose name matches.
  static async take(host: EngineHost, pattern: RegExp): Promise<Frame> {
    const c = PlayerView.choices(Page.inner(host).session.campaign)
      .find(x => x.choice.id.startsWith('go(') && pattern.test(x.choice.name))!;
    return await host.handle({ kind: 'perform', command: c.choice.id }) as Frame;
  }
}

// The first town offers somewhere to set out for: the nearest towns the roads go to and the march-stones at their
// ends, a few, by the roads (the navigation review: every first town's page had nowhere to set out for, though four
// towns were a day or less away by known roads).
describe('the page of the first town', () => {
  it('offers the nearest towns and march-stones by the roads, a few, none a single way off', async () => {
    const { host, first } = await Page.begin('wanderer');
    const green = await Page.take(host, /market-place/);
    for (const frame of [first, green]) {
      // In a town the page goes out to the country, where the map sets out by the roads it plans (see MenuModel.place).
      const menu = MenuModel.build(frame, 'here', []), inside = MenuModel.inside(frame.screen);
      if (inside) { expect(menu.choices.map(c => c.id)).toContain(MenuModel.country.id); }
      const going = inside ? MenuModel.destinations(frame.screen).filter(c => c.id !== MenuModel.country.id)
        : menu.destinations ?? [];
      expect(going.length).toBeGreaterThan(0);
      expect(going.length).toBeLessThanOrEqual(MenuModel.near);
      expect(going.every(c => /^Set out for /.test(c.label) && / by the roads/.test(c.note ?? ''))).toBe(true);
      const roads = frame.screen.roads ?? [];
      expect(going.every(c => (roads.find(d => `travel:${d.id}` === c.command)?.legs.length ?? 0) > 1)).toBe(true);
    }
  }, 180000);
});

// Where the company is bound: nothing is held where no way is known (the page had said "Go on to region__t177
// (0 minutes)", and going on said again that there was no way); and the legs are told as the page tells them, one
// stretch of a wood after another one leg, and no way named by its template ("the track to {region__w9}").
describe('a journey held, as the page tells it', () => {
  it('holds nothing where there is no way, and tells each leg once and by its name', async () => {
    const { host, first } = await Page.begin('debt'), inner = Page.inner(host);
    const sea = await host.handle({ kind: 'travel', destination: 'region__t177' }) as Frame;
    expect([sea.bound, sea.travel?.stopped]).toEqual([undefined, 'You know no way there']);
    expect(Page.going(sea).some(l => /^Go on to /.test(l))).toBe(false);
    for (const m of first.screen.region!.land!.marks) {
      inner.bound = m.id;
      const legs = inner.frame().bound?.legs ?? [];
      expect([m.id, legs.filter(l => /[{}]/.test(`${l.way} ${l.to}`))]).toEqual([m.id, []]);
      expect([m.id, legs.some((l, i) => i > 0 && l.way === legs[i - 1]!.way && l.to === legs[i - 1]!.to)])
        .toEqual([m.id, false]);
    }
    await Page.take(host, /./);
    const land = inner.frame().screen.region!.land!, wood = land.known.filter(c => land.cover[c] === 'w').at(-1)!;
    inner.bound = `${land.tracts}${wood}`;
    const across = inner.frame().bound!.legs;
    expect(across.length).toBeGreaterThan(0);
    expect(across.some((l, i) => i > 0 && l.way === across[i - 1]!.way && l.to === across[i - 1]!.to)).toBe(false);
  }, 180000);
  it('says a way that is the place it comes to, or that the place names, once', () => {
    expect(Words.leg('the road', 'the road between Weligtún and Fearnglaed')).toBe('By the road between Weligtún and Fearnglaed');
    expect(Words.leg('the bridge over the Reodex', 'the bridge over the Reodex')).toBe('By the bridge over the Reodex');
    expect(Words.leg('the track to a lone tower', 'a lone tower')).toBe('By the track to a lone tower');
    expect(Words.leg('the old road east', 'the march-stone of Faenn')).toBe('By the old road east to the march-stone of Faenn');
  });
});
