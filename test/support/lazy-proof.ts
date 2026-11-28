import type { Campaign } from '../../src/campaign/campaign';
import type { CampaignEvent } from '../../src/campaign/campaign-types';
import type { PlaySession } from '../../src/session/play-session';
import { PendingPlacements } from '../../src/campaign/pending-placements';

// A world played eagerly and lazily, read side by side (PendingPlacements, lazy-provinces.md's proof): what the player
// can know of it (where the company stands, the rows it is offered, what it is told, the company itself), and what
// the modules a placement brings own of it (their entities, their facts and measures, their people's bodies). The
// facts of modules the lazy world still holds back are left out of the first: the eager world holds them, and the
// lazy one does not.
export class LazyProof {
  // What the company can know after a command (or as the life begins): where it is, the rows offered, its own people.
  static seen(s: PlaySession, event?: CampaignEvent) {
    const c = s.campaign, party = new Set(c.readout.partyIds);
    return { at: c.world.one('at', 'party'), elapsed: c.readout.elapsed,
      rows: c.offered().map(o => o.id).sort(), told: (event?.voiced ?? []).map(v => JSON.stringify(v)),
      company: c.readout.creatures.filter(x => party.has(x.id)).map(x => JSON.stringify(x)) };
  }
  // What the named modules own of a world: what is theirs by its id.
  static owned(c: Campaign, modules: readonly string[]) {
    const prefixes = modules.map(id => `${id}__`), mine = (x: string) => prefixes.some(p => x.startsWith(p));
    const view = c.world.view;
    return {
      entities: c.module.entities.filter(e => mine(e.id)).map(e => `${e.id} ${e.name}`).sort(),
      facts: view.relations.filter(r => mine(r.name) || r.args.some(mine))
        .map(r => `${r.name}(${r.args.join(', ')})`).sort(),
      measures: view.measures.filter(({ call: m }) => mine(m.name) || m.args.some(mine))
        .map(({ call: m, value }) => `${m.name}(${m.args.join(', ')}) = ${value}`).sort(),
      creatures: c.readout.creatures.filter(x => mine(x.id)).map(x => JSON.stringify(x)).sort() };
  }
  // Every module held back, by id.
  static pending(c: Campaign): string[] { return PendingPlacements.held(c).flatMap(p => p.requests.map(r => r.id)); }
}
