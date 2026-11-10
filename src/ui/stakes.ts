import type { Campaign } from '../campaign/campaign';
import type { Objective, Predicate } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import { EntityIndex } from '../lang/entity-index';
import { Spatial } from '../spatial';
import { ObjectiveTarget, type ResolvedTarget } from './objective-target';

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
  // What one aim is about: what its words name, or its condition when its words name nothing, at its most particular.
  // A place named only as where something else it names is ("the cellar, under the old corn-store at Fearnmaere";
  // "Lothar at Brockfield") is that thing's address, not the aim (see addresses): the corn-store above the cellar
  // and every lane of Brockfield had been "your aim", and the page had led out of the cellar and about the town (the
  // owner, 9 November: aims that lead out of the structure the goal is in, every route lit gold). What its condition
  // holds of is what it waits on, not what it is about once its words say (the rats' run stopped had stayed "your
  // aim" after it was packed).
  // Where its author says what it is pursued toward (Objective … toward keeper), that, and nothing else it names: "You
  // owe Tuck … ask Aiden at the inn" is Aiden's, not the creditor's whose yard the page had led back to.
  static named(campaign: Campaign, o: Objective): Set<string> {
    if (o.toward?.length) { return new Set(o.toward); }
    return Stakes.read(campaign, o);
  }
  // The aim's target, resolved once (see ObjectiveTarget).
  static target(campaign: Campaign, o: Objective): ResolvedTarget {
    return ObjectiveTarget.of(campaign, o, () => Stakes.read(campaign, o));
  }
  // An aim its author gave no target, read from its words (see named).
  private static read(campaign: Campaign, o: Objective): Set<string> {
    const ids = Stakes.said(campaign, o), addresses = Stakes.addresses(campaign, o);
    return new Set([...ids].filter(id => !addresses.has(id)));
  }
  // The places an aim names only as where something else it names stands: those holding another thing it names, or
  // the place someone it names is at.
  // Toward someone its author names, wherever they are is where they are sought.
  static addresses(campaign: Campaign, o: Objective): Set<string> {
    const ids = o.toward?.length ? new Set(o.toward) : Stakes.said(campaign, o);
    const byId = EntityIndex.of(campaign.module.entities).byId, w = campaign.world;
    const under = [...ids].flatMap(id => {
      const at = byId.get(id)?.space ? id : w.one('at', id);
      return at ? Spatial.ancestry(byId, at).filter(e => e.id !== id).map(e => e.id) : [];
    });
    return new Set(o.toward?.length ? under : under.filter(id => ids.has(id)));
  }
  private static said(campaign: Campaign, o: Objective): Set<string> {
    const ids = new Set<string>();
    ObservationText.map(o.text, call => { call.args.forEach(a => ids.add(a)); return ''; }, id => { ids.add(id); return ''; });
    if (!ids.size) {
      ModuleWriter.conditionCalls(o.when, call => { call.args.forEach(a => ids.add(a)); return call; });
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
  // origin's errand is the drover's going-on, asked of the drover's wife as the company's mother), or while someone
  // is waiting on the company (expects(mother, party): the herb-wife's feverwort, carried to the fever's mother, had
  // been one aim among the town's, and the page had led to the rats).
  static own(o: Objective): boolean { return /^origin__/.test(o.id) || Stakes.kin(o.when); }
  private static kin(p: Predicate): boolean {
    switch (p.kind) {
      case 'call': return p.name === 'kin' || p.name === 'kinship' || (p.name === 'expects' && p.args[1] === 'party');
      case 'and': case 'or': return Stakes.kin(p.left) || Stakes.kin(p.right);
      default: return false;
    }
  }
}
