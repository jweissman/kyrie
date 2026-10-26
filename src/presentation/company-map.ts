import { EntityIndex } from '../lang/entity-index';
import { ModuleWriter } from '../lang/module-writer';
import { Spatial } from '../spatial';
import { VisitedPlaces } from './visited-places';
import type { Campaign } from '../campaign/campaign';
import type { PlayerSnapshot, SceneMetadata } from './player-view';

// The company's map: the places it has been and the ways it knows of from them, each said available from here,
// blocked from here, or known and to be checked from there.
export class CompanyMap {
  static of(campaign: Campaign, actor: string, routes: { bindings?: Record<string, string> }[],
    metadata: Map<string, SceneMetadata>): PlayerSnapshot['map'] {
    const visited = VisitedPlaces.of(campaign, actor), world = campaign.world;
    // The ways of each kind, by their relations: not by going through every fact the world holds.
    const ways = ['route', 'gate', 'footway', 'informedPassage', 'climbingPassage', 'hazardPassage']
      .flatMap(name => world.related(name));
    const links = ways.flatMap(r => {
      const from = ['gate', 'hazardPassage'].includes(r.name) ? r.args[1] : r.args[0];
      const to = ['gate', 'hazardPassage'].includes(r.name) ? r.args[2] : r.args[1];
      if (!from || !to || !visited.has(from)
        || (r.name === 'informedPassage'
          && !(world.relates('knows') && world.test(ModuleWriter.call('knows', actor, r.args[2]!))))) {
        return [];
      }
      return [{ from, to }];
    });
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
      .map(e => ({ id: e.id, name: e.name, visited: visited.has(e.id), ...metadata.get(e.id),
        ...(e.space ? { kind: e.space.kind } : {}) })), links: described };
  }
}
