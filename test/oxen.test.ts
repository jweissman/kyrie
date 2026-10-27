import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';
import { Itineraries } from '../src/ui/itinerary';
import type { Change } from '../src/lang/module';
import { GeneratedWorld } from './support/generated';

// A resolution ended in "Nothing more is asked of you" (the play-structure investigation's PT-01): found, the
// drover's cart points on, by the oxen's trail the son read, to the den the country has nearest his town (a link to
// that den's placement: no site is claimed for it, and nothing else moves); dealt with, the den gives
// up his grandfather's yoke, and carried home it hangs over the hearth. kite: a drover at s2, one den.
class Oxen {
  static async start() {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return { w, s: await PlaySession.start(w.path, 'kite', w.source) };
  }
  static set(s: PlaySession, changes: Change[]) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(changes));
  }
  static holds(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No ${pattern}: ${PlayerView.choices(s.campaign).map(x => x.choice.name).join(' | ')}`); }
    return s.perform(c.choice.id);
  }
}

describe('the thing that took the oxen', () => {
  it('is read from the road once the cart is found, leads to the den nearest the town, and ends at the hearth',
    async () => {
      const { w, s } = await Oxen.start(), drover = w.report.placements.find(p => p.scenario === 'drover')!;
      expect(drover.modules).toContain('oxen');
      const lair = `region__${drover.bindings.lair}`, den = drover.linked!.lair!.n > 1 ? `den${drover.linked!.lair!.n}` : 'den';
      expect(w.report.placements.find(p => p.instance === den)!.bindings.den).toBe(drover.bindings.lair);
      Oxen.set(s, [{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'drover__found_cart') }]);
      GeneratedWorld.put(s, `${drover.bindings.town}_green`);
      await s.perform('wait');
      // The son read the trail, and tells it.
      expect((await Oxen.take(s, /what he means to do now$/)).response).toContain('I want the yoke back');
      expect(Oxen.holds(s, 'knows', 'party', 'oxen__trail')).toBe(true);
      expect(ScreenModel.build(s.campaign).objectives.join(' ')).toContain('Whatever took the drover\'s oxen dens at');
      expect(Itineraries.destinations(s.campaign).map(d => d.id)).toContain(lair);
      // Dealt with (driven off, as smoke does), the den gives up the yoke.
      Oxen.set(s, [{ kind: 'assert', call: ModuleWriter.call('peaceable', `${den}__beasts`) }]);
      GeneratedWorld.put(s, drover.bindings.lair!);
      await s.perform('wait');
      await Oxen.take(s, /^Collect the drover's ox-yoke for Wenna$/);
      GeneratedWorld.put(s, `${drover.bindings.town}_taproom`);
      await s.perform('wait');
      const hung = await Oxen.take(s, /^Hang the yoke over the hearth/);
      expect(Oxen.holds(s, 'oxen__hung', 'party')).toBe(true);
      expect(hung.combat.some(e => e.type === 'gain' && e.detail === 'experience: the thing that took the oxen, seen through'))
        .toBe(true);
    }, 120000);
  // The cart was found only by the generic "Search here", though the road speaks of the ruts (PT-08).
  it('follows the ruts the road speaks of, over the edge to the cart', async () => {
    const { w, s } = await Oxen.start(), drover = w.report.placements.find(p => p.scenario === 'drover')!;
    GeneratedWorld.put(s, drover.bindings.road!);
    await s.perform('wait');
    const followed = await Oxen.take(s, /^Follow the ruts over the edge$/);
    expect(Oxen.holds(s, 'knows', 'party', 'drover__found_cart')).toBe(true);
    expect((followed.perceptions ?? []).map(p => p.text).join(' ')).toContain('a cart lies on its side in the ditch');
  }, 120000);
});
