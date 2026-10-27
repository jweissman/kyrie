import { EntityIndex } from '../lang/entity-index';
import { ModuleWriter } from '../lang/module-writer';
import { Spatial } from '../spatial';
import { VisitedPlaces } from './visited-places';
import type { Campaign } from '../campaign/campaign';
import type { PlayerSnapshot } from './player-view';

// The company's map: the places it has been and the ways it knows of from them, each said available from here,
// blocked from here, or known and to be checked from there.
export class CompanyMap {
  static of(campaign: Campaign, actor: string, routes: { bindings?: Record<string, string> }[]): PlayerSnapshot['map'] {
    const visited = VisitedPlaces.of(campaign, actor), world = campaign.world;
    // The exits it knows from where it has been. (The relations ways were written with before passages, route, gate and
    // the rest, are no module's any longer, and are not read: Mission 17, the architecture review's H3.)
    const links: { from: string; to: string }[] = [];
    const here = world.one('at', actor);
    const index = EntityIndex.of(campaign.module.entities);
    links.push(...index.ordered([...visited].flatMap(v => index.exitsFrom(v).map(e => e.id)))
      .filter(e => Spatial.visible(world, actor, e)).map(e => ({ from: e.exit!.origin, to: e.exit!.destination })));
    const described = links.map(l => ({ ...l, status: l.from !== here ? 'known connection; check it from there' :
      routes.some(a => a.bindings?.destination === l.to
        || ('movement' in a && (a.movement as { destination?: string })?.destination === l.to)) ? 'available from here' : 'blocked from here' }));
    // And what it has been told of (a site named to it, leadsTo), before it has been there or knows the way.
    const told = world.relates('leadsTo') ? world.related('leadsTo')
      .filter(r => world.test(ModuleWriter.call('knows', actor, r.args[0]!))).map(r => r.args[1]!) : [];
    const known = new Set([...visited, ...links.map(l => l.to), ...told]);
    return { places: index.ordered(known).filter(e => e.type === 'place')
      .map(e => ({ id: e.id, name: e.name, visited: visited.has(e.id), ...(e.space ? { kind: e.space.kind } : {}) })),
    links: described };
  }
}
