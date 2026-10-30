import type { Campaign } from '../campaign/campaign';
import type { Entity, Objective, Predicate } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import { EntityIndex } from '../lang/entity-index';

// Whom and what the company has a stake in, met first wherever they are: its own family, and whoever and wherever an
// aim it holds now turns on, as the aim's condition or its words name them (Garret held in the vault; the bridge the
// father went out by). In a gate-yard of a chandler, a herb-wife, a whaler and the protagonist's brother, the brother
// had been fourth of four alike, and the bridge one of twelve ways (Mission 17, the place by salience).
export class Stakes {
  static of(campaign: Campaign): Set<string> {
    const w = campaign.world, ids = new Set<string>();
    for (const name of ['kinship', 'kin'].filter(n => w.relates(n))) {
      for (const r of w.related(name)) { ids.add(name === 'kin' ? r.args[1]! : r.args[0]!); }
    }
    for (const o of (campaign.module.objectives ?? []).filter(x => w.test(x.when))) {
      for (const id of Stakes.named(campaign, o)) { ids.add(id); }
    }
    return ids;
  }
  // What one aim names, in its condition or its words, and the places of a site it names, however deep: the way to
  // its mouth is the way to it.
  static named(campaign: Campaign, o: Objective): Set<string> {
    const ids = new Set<string>(), byId = EntityIndex.of(campaign.module.entities).byId;
    ModuleWriter.conditionCalls(o.when, call => { call.args.forEach(a => ids.add(a)); return call; });
    ObservationText.map(o.text, call => { call.args.forEach(a => ids.add(a)); return ''; }, id => { ids.add(id); return ''; });
    for (const e of campaign.module.entities.filter(x => x.space?.parent && Stakes.inside(x.id, ids, byId))) {
      ids.add(e.id);
    }
    return ids;
  }
  // The aims, the one that names where the company stands first: in the king-barrow, the crown it holds, not the debt
  // that sent it there (play 13). Then the company's own errand, before whatever the country has told it of since: at
  // the bridge-foot of Brightbridge the father's cart, not the hobs' hold the innkeeper spoke of (the bell had come to
  // lead the page as soon as it was heard of: OWN-28). Otherwise as they were.
  static here<A extends { id: string }>(campaign: Campaign, aims: A[], place?: string): A[] {
    const defs = new Map((campaign.module.objectives ?? []).map(o => [o.id, o]));
    return aims.map(a => [Stakes.rank(campaign, defs.get(a.id), place), a] as const)
      .toSorted((x, y) => x[0] - y[0]).map(([, a]) => a);
  }
  private static rank(campaign: Campaign, def: Objective | undefined, place?: string): number {
    if (def && place && Stakes.named(campaign, def).has(place)) { return 0; }
    return def && Stakes.own(def) ? 1 : 2;
  }
  // The company's own errand: the aim its origin sets, or one that holds while it has kin in the matter (the kin
  // origin's errand is the drover's going-on, asked of the drover's wife as the company's mother).
  static own(o: Objective): boolean { return /^origin__/.test(o.id) || Stakes.kin(o.when); }
  private static kin(p: Predicate): boolean {
    switch (p.kind) {
      case 'call': return p.name === 'kin' || p.name === 'kinship';
      case 'and': case 'or': return Stakes.kin(p.left) || Stakes.kin(p.right);
      default: return false;
    }
  }
  private static inside(id: string, ids: Set<string>, byId: Map<string, Entity>): boolean {
    for (let p = byId.get(id)?.space?.parent; p; p = byId.get(p)?.space?.parent) { if (ids.has(p)) { return true; } }
    return false;
  }
}
