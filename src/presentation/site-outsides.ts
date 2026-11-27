import type { Call, Entity } from '../lang/module';
import type { World } from '../lang/world';
import { Spatial } from '../lang/spatial';

// A site's outsides: each place outside any site that a way joins to one of its rooms (the barrow's mound beside the
// wood), with the site it leads into. Read once for the ways of a world as they stand (the same list from one world
// to the next while no way is written): the glance had walked up from both ends of every way of the country for every
// act (OR-91: the leaf's largest part).
export class SiteOutsides {
  private static readonly read = new WeakMap<readonly Call[],
    { byId: Map<string, Entity>; outsides: Map<string, string> }>();
  static of(world: World, byId: Map<string, Entity>): Map<string, string> {
    const ways = world.related('connects'), had = this.read.get(ways);
    if (had?.byId === byId) { return had.outsides; }
    const outsides = new Map(ways.flatMap(r => [[r.args[1]!, r.args[2]!], [r.args[2]!, r.args[1]!]] as const)
      .flatMap(([a, b]) => {
        const site = this.siteOf(byId, b);
        return site && !this.siteOf(byId, a) ? [[a, site] as const] : [];
      }));
    this.read.set(ways, { byId, outsides });
    return outsides;
  }
  // Each way's ends, both ways round, from a room of a site to a place not in that site, in the ways' order: what an
  // aim's places reach out to from a site it names (Undertakings.places).
  private static readonly joined = new WeakMap<readonly Call[],
    { byId: Map<string, Entity>; joins: (readonly [string, string])[] }>();
  static joins(world: World, byId: Map<string, Entity>): readonly (readonly [string, string])[] {
    const ways = world.related('connects'), had = this.joined.get(ways);
    if (had?.byId === byId) { return had.joins; }
    const joins = ways.flatMap(r => [[r.args[1]!, r.args[2]!], [r.args[2]!, r.args[1]!]] as const).filter(([a, b]) => {
      const site = this.siteOf(byId, a);
      return !!site && this.siteOf(byId, b) !== site;
    });
    this.joined.set(ways, { byId, joins });
    return joins;
  }
  static siteOf(byId: Map<string, Entity>, id: string): string | undefined {
    return Spatial.ancestry(byId, id).find(a => a.space?.kind === 'site')?.id;
  }
  // Every place within a site, with its site, in the module's order: found once for a module's entities (an aim's
  // keeper looked for had walked up from every entity of the world, ten thousand of them, for every glance).
  private static readonly within = new WeakMap<readonly Entity[], { size: number; sited: [Entity, string][] }>();
  static sited(entities: readonly Entity[], byId: Map<string, Entity>): readonly (readonly [Entity, string])[] {
    const had = this.within.get(entities);
    if (had?.size === entities.length) { return had.sited; }
    const sited = entities.flatMap(e => {
      const site = e.space && this.siteOf(byId, e.id);
      return site ? [[e, site] as [Entity, string]] : [];
    });
    this.within.set(entities, { size: entities.length, sited });
    return sited;
  }
}
