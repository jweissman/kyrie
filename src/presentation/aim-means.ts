import type { Campaign } from '../campaign/campaign';
import type { Entity, Objective } from '../lang/module';
import { EntityIndex } from '../lang/entity-index';
import { Spatial } from '../spatial';
import { KnownWays } from '../ui/known-ways';
import { VisitedPlaces } from './visited-places';
import { Means } from './means';
import type { AimLead } from './aim-lead';

// What the aim followed waits on lies in a site the company has come to and found shut to it: every way in it knows
// asks for something it has not got (a climb, without climbing or a rope; a portcullis to heave, without the brawn),
// and nothing open goes further in. Then the step is whoever sells what would open a way, where the company has been
// (OPR-01: a1's debt, a lone mage at Ironkeep, one steel coin found under the gate and the portcullis too heavy; the
// breach in the curtain wall wanted climbing or a rope, Mik sells a coil of rope at the salt-house the debt began in,
// and nothing had led anywhere: the gold walker went out into the open fields and back, gate to mouth and back, for
// sixty acts). Never a seller somewhere the company has not been (the knowledge boundary, AR-21), and not while a way
// it knows and can take goes on in.
export class AimMeans {
  static lead(campaign: Campaign, def: Objective, named: Set<string>): AimLead | undefined {
    const byId = EntityIndex.of(campaign.module.entities).byId, actor = campaign.playerActor ?? 'party';
    const been = VisitedPlaces.of(campaign, actor), graph = KnownWays.graph(campaign);
    // The places of the site the aim names that the company has stood in, and the site.
    const site = [...named].flatMap(id => this.sites(byId, graph, id)).at(0);
    const stood = [...been].filter(p => named.has(p) || this.siteOf(byId, p) === site);
    if (!site || !stood.length) { return undefined; }
    const at = { byId, site, been };
    if (stood.some(p => KnownWays.way(campaign, p, id => this.untried(at, id), { able: true }))) { return undefined; }
    const needs = [...new Set(stood.flatMap(p => (graph.get(p) ?? [])
      .filter(w => w.status === 'needs' && this.untried(at, w.to)).flatMap(w => this.needs(campaign, w.passage))))];
    const here = campaign.world.one('at', actor) ?? '';
    const seller = Means.sources(campaign, needs).filter(s => s.at && been.has(s.at))
      .map(s => ({ s, way: s.at === here ? 0 : KnownWays.way(campaign, here, id => id === s.at)?.minutes }))
      .filter(x => x.way !== undefined).toSorted((a, b) => a.way! - b.way!)[0]?.s;
    return seller ? { aim: def.id, source: 'means', next: [seller.seller] } : undefined;
  }
  // A room of the site not yet been in.
  private static untried(at: { byId: Map<string, Entity>; site: string; been: Set<string> }, id: string): boolean {
    return this.siteOf(at.byId, id) === at.site && !at.been.has(id);
  }
  private static needs(campaign: Campaign, passage: string): string[] {
    return campaign.world.related('needs').filter(r => r.args[0] === passage).map(r => r.args[1]!);
  }
  // The site a place is in, or the one its ways go into (a site's mouth, outside it: Ironkeep's gate-front).
  private static sites(byId: Map<string, Entity>, graph: ReturnType<typeof KnownWays.graph>, id: string): string[] {
    const own = this.siteOf(byId, id);
    return own ? [own] : (graph.get(id) ?? []).flatMap(w => this.siteOf(byId, w.to) ?? []);
  }
  private static siteOf(byId: Map<string, Entity>, id: string): string | undefined {
    return Spatial.ancestry(byId, id).find(e => e.space?.kind === 'site')?.id;
  }
}
