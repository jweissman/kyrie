import { describe, expect, it } from 'bun:test';
import { Pellam } from './support/pellam';
import { Glanced } from './support/glanced';

// An authored place at a glance (OWN-18, OWN-19): Freezeland Street in the Liberty of the Ice, whose full telling ran
// to some four hundred words (the bill on the Glove Post, the pillory, the mast, the street, a lean-to, a sermon). The
// glance leads with the street's own line, someone at their doings, and a few things to do; come back to, the street
// is told by its authored "again" line, whole, and that is not said to have changed.
class Fair {
  static async freezeland(p: Pellam, g: Glanced) {
    const hops = p.route('freezeland');
    for (const hop of hops.slice(0, -1)) { await p.play(hop); }
    return g.perform(hops.at(-1)!.slice(1));
  }
}
describe('the Liberty of the Ice at a glance', () => {
  it('opens on the North Road, and comes to Freezeland Street by its own line, and back by its again line', async () => {
    const p = await Pellam.start(), g = Glanced.of(p.j.session);
    expect(g.glance).toMatchObject({ arrival: 'opening', sight: { id: 'pellam__north_road_scene' } });
    await p.play('go:swan_lane', 'Shake on a penny a stair', 'go:swan_foot', '=9:00');
    const street = await Fair.freezeland(p, g);
    expect(street.arrival).toBe('first');
    expect(street.sight?.id).toBe('pellam__freezeland_scene');
    expect(Glanced.sentences(street.sight!.text)).toBeLessThanOrEqual(2);
    expect(g.screen.people.map(x => x.id)).toContain(street.life?.subject ?? 'no one');
    expect(street.acts.length).toBeGreaterThan(0);
    expect(street.acts.length).toBeLessThanOrEqual(3);
    expect(street.acts.filter(a => a.why === 'own').length).toBeLessThanOrEqual(1);
    const menu = new Set(g.menu());
    expect([...street.acts.map(a => a.choice), ...street.ways].filter(id => !menu.has(id))).toEqual([]);
    const words = g.words();
    expect(words.glance).toBeLessThan(words.full / 3);
    const reachable = g.reachable();
    expect(g.legal().filter(c => !reachable.has(c))).toEqual([]);
    // Back from the stairs' foot: the street's again line, whole, and no change made of it.
    await p.play('go:swan_foot');
    const again = await Fair.freezeland(p, g);
    expect(again.arrival).toBe('return');
    expect(again.sight?.id).toBe('pellam__freezeland_again');
    expect(again.changed).not.toContain(again.sight!.text);
    expect(g.words().glance).toBeLessThan(words.glance);
  }, 300000);
});
