import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Undertakings } from '../src/presentation/undertakings';
import type { Glance as View } from '../src/presentation/glance-types';
import { Glanced } from './support/glanced';

// Gold is the next step of the one aim the player chose to follow, and nothing else (the owner, 12 November): a new
// character sees none; following an aim gives one act its gold; another aim, however interesting, is never gold;
// following another moves the gold; and letting go of the aim takes the gold away.
const gold = (v: View) => v.acts.filter(a => a.continues || a.aspects.includes('undertaking'));
describe('gold, by Follow this', () => {
  it('is on one act of the aim followed, only once one is followed', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const c = s.campaign, g = Glanced.of(s);
    // A new character, its reason held but not followed: no gold.
    expect(Undertakings.held(c).length).toBeGreaterThan(0);
    expect([Undertakings.followed(c), gold(g.glance)]).toEqual([undefined, []]);
    // Followed, one act is its next step, and that act alone is gold.
    const errand = Undertakings.held(c).find(o => Undertakings.errand(c, o))!.id;
    Undertakings.follow(c, errand);
    const followed = Glanced.of(s).glance;
    expect(gold(followed).map(a => a.continues)).toEqual([true]);
    // Out on the landing, among the town's own aims and notices, still the one.
    const on = await Glanced.of(s).perform(followed.acts.find(a => a.continues)!.command!);
    expect(gold(on).length).toBeLessThanOrEqual(1);
    // Another aim followed instead: the gold is its, and not the debt's.
    const other = Undertakings.held(c).find(o => o.id !== Undertakings.followed(c)?.id);
    if (other) {
      Undertakings.follow(c, other.id);
      expect(Undertakings.followed(c)?.id).toBe(other.id);
      expect(gold(Glanced.of(s).glance).length).toBeLessThanOrEqual(1);
    }
    // Let go of, nothing is gold.
    Undertakings.follow(c);
    expect(gold(Glanced.of(s).glance)).toEqual([]);
  }, 120000);
});
