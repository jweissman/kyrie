import type { Campaign } from '../campaign/campaign';
import type { Screen } from '../ui/screen-types';
import { Undertakings } from '../presentation/undertakings';
import { Stakes } from '../ui/stakes';
import { EntityIndex } from '../lang/entity-index';
import { Spatial } from '../spatial';

// Whether the company stands in, or at the door of, the site its followed aim is about: what the aim names, or where
// it is pursued, lies in that site. There, with no gold, the site's rooms not yet seen are what serves the aim, and a
// walker that explores them is not blocked (the lead's ruling, 13 November, PL-23). Said with the turn (Said.amid).
export class RunnerAmid {
  static of(campaign: Campaign, screen: Screen): boolean {
    const def = Undertakings.followed(campaign);
    if (!def) { return false; }
    const byId = EntityIndex.of(campaign.module.entities).byId, w = campaign.world;
    const sites = new Set([screen.place.id, ...screen.exits.map(e => e.destination.id)]
      .flatMap(id => RunnerAmid.site(byId, id) ?? []));
    if (!sites.size) { return false; }
    const t = Stakes.target(campaign, def);
    const named = [...Stakes.named(campaign, def), ...t.actionAt ? [t.actionAt] : []];
    return named.some(id => {
      const at = byId.get(id)?.space ? id : w.one('at', id);
      return !!at && sites.has(RunnerAmid.site(byId, at) ?? '');
    });
  }
  private static site(byId: ReturnType<typeof EntityIndex.of>['byId'], id: string): string | undefined {
    return Spatial.ancestry(byId, id).find(e => e.space?.kind === 'site')?.id;
  }
}
