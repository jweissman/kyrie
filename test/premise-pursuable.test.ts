import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Undertakings } from '../src/presentation/undertakings';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { Stakes } from '../src/ui/stakes';
import { EntityIndex } from '../src/lang/entity-index';
import { Spatial } from '../src/spatial';

// Every origin's premise is pursuable from the first page (the blind playtest, 13 November: BP-05). "A dead man's
// map" named Greyhold, the map drew it, and nothing routed to it. On a1, each origin's own errand: where it sends the
// company is on the map with a way planned to it (or is where the company already stands, or in its town), and
// followed, its next step is gold on the first page.
describe('the first page of every origin on a1', () => {
  it('can set out on its premise', async () => {
    const out: string[] = [];
    for (const origin of ['debt', 'kin', 'herbs', 'order', 'wanderer', 'map', 'lost', 'courier']) {
      // An origin this world cannot hold (herbs, with no fever placed) is not offered at creation, and is refused
      // where it is asked for by name (--as): it had set out with "No aim is held".
      const s = await DrawnWorld.start('a1', { origin, party: [{ name: 'Haze', raceId: 'human', classId: 'thief' }] },
        NodeBundleSource.shared).catch((e: Error) => { out.push(`refused: ${e.message}`); return undefined; });
      if (!s) { continue; }
      // The origin's own errand; or, where its premise is a trouble of the country's (the fever's child, the
      // wanderer's first trouble), the first aim it is held by.
      const c = s.campaign, held = Undertakings.held(c), aim = held.find(o => Undertakings.errand(c, o)) ?? held[0];
      if (!aim) { out.push(`${origin}: no aim held on the first page`); continue; }
      const byId = EntityIndex.of(c.module.entities).byId, t = Stakes.target(c, aim);
      const named = [...aim.toward ?? [], t.actionAt, t.subject].filter((x): x is string => !!x)
        .map(id => byId.get(id)?.space ? id : c.world.one('at', id) ?? id);
      const reach = new Set(named.flatMap(id => Spatial.ancestry(byId, id).map(e => e.id)));
      const screen = ScreenModel.build(c), here = new Set(Spatial.ancestry(byId, screen.place.id).map(e => e.id));
      const plans = [...screen.destinations ?? [], ...screen.roads ?? [], ...screen.around ?? [],
        ...screen.mapped ?? []];
      const routed = plans.some(p => reach.has(p.id)) || named.some(id => here.has(id))
        || [...reach].some(id => here.has(id) && byId.get(id)?.space?.kind === 'settlement');
      Undertakings.follow(c, aim.id);
      const gold = Narrator.leaf(c, ScreenModel.build(c)).glance?.acts.find(a => a.continues);
      if (!routed || !gold) {
        out.push(`${origin}: at ${screen.place.id}, toward ${named.join(',')}; routed ${routed}; gold ${gold?.label}`);
      }
    }
    expect(out).toEqual(['refused: no herbs origin in a1']);
  }, 300000);
});
