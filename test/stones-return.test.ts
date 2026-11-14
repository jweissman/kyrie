import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Undertakings } from '../src/presentation/undertakings';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import type { PlaySession } from '../src/session/play-session';

// Where what the aim waits on is found by searching, the place it is searched for is never idle until it has been: a
// company that came to the inn's back garden over the boundary stones and wandered off to the shrine unsearched had
// had nothing lead it back (Gate 1's generated tier, a1's wanderer, 15 November).
class Offered {
  static of(s: PlaySession) { return Narrator.leaf(s.campaign, ScreenModel.build(s.campaign)).glance!.offer!; }
  static async take(s: PlaySession, label: RegExp) {
    const o = [...this.of(s).primary, ...this.of(s).rest].find(x => label.test(x.label))!;
    await s.leg(o.command ?? o.choice);
  }
}
describe('the boundary stones', () => {
  it('lead back to the garden from the shrine, the garden left unsearched', async () => {
    const s = await DrawnWorld.start('a1', { origin: 'wanderer', party: [{ name: 'Wynn', raceId: 'human',
      classId: 'bard' }] }, NodeBundleSource.shared);
    const c = s.campaign;
    Undertakings.follow(c, Undertakings.held(c).find(o => /boundary stones/.test(o.text))!.id);
    for (const to of [/^To the landing/, /^Into the Lucky Phoenix/, /^Out to the inn's back garden/,
      /^To the shrine/]) {
      await Offered.take(s, to);
    }
    expect(ScreenModel.build(c).place.name).toBe('the shrine of Nodens');
    expect(Offered.of(s).primary.filter(o => o.aspects.includes('undertaking')).map(o => o.label))
      .toEqual(['To the inn\'s back garden']);
  }, 120000);
});
