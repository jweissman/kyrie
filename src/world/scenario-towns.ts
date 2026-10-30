import { Expressions } from '../expressions';
import { Terrain } from './land/terrain';
import { RegionGeography } from './region-geography';
import { RegionGrowth } from './region-growth';
import { RegionWriter, type Region, type Settlement } from './region-writer';
import { SettlementWriter } from './settlement-writer';
import type { ScenarioManifest } from './world-assembler';

// Which settlement a scenario set in one is placed in: one that has the rooms its modules name (not every settlement
// has an inn, a shop or a shrine), nearest a site the scenario took, the one a side's road leaves from, or free, or
// the first.
export class ScenarioTowns {
  // The rooms of a settlement a scenario's modules name (its taproom, its shop, its shrine): only a settlement that has
  // them will do, since not every settlement has an inn, a shop or a shrine of its own.
  static parts(s: ScenarioManifest, role: string): ('taproom' | 'shrine' | 'shop')[] {
    const named = s.modules.flatMap(m => Object.values(m.imports))
      .map(v => new RegExp(`^@${role}\\.(taproom|shrine|shop)$`).exec(v)?.[1]).filter(x => x !== undefined);
    return [...new Set(named)] as ('taproom' | 'shrine' | 'shop')[];
  }
  // The settlement a scenario is set in, of those with the rooms it needs: the one nearest a site it took, any one no
  // other has taken, or the first.
  static town(need: string, at: { region: Region; bindings: Record<string, string>; claimed: Set<string>;
    key: string; parts: ('taproom' | 'shrine' | 'shop')[] }): string {
    const { region, bindings, claimed } = at;
    const fit = region.settlements.filter(t => at.parts.every(p => SettlementWriter.rooms(region, t)[p]));
    // The town a side's road leaves from (toward:west): where what lies that way is told of, and set out for.
    if (need.startsWith('toward:')) {
      const border = (RegionGeography.atlas(region).borders ?? []).find(b => b.side === need.slice(7));
      const seat = border && region.settlements[border.seat];
      if (seat && fit.includes(seat)) { claimed.add(seat.id); return seat.id; }
    }
    // What goes round the country (a circus, a pedlar) is shared with whatever else is there, and claims nothing.
    if (need === 'largest') { return this.largest(fit.length ? fit : region.settlements).id; }
    if (need.startsWith('along:')) { return this.along(region, bindings, bindings[need.slice(6)], fit).id; }
    const near = need.startsWith('near:') ? region.sites.find(w => w.id === bindings[need.slice(5)]) : undefined;
    if (near) {
      const nearest = RegionWriter.near(region, near);
      return fit.includes(nearest) || near.cell === undefined ? nearest.id
        : [...fit].sort((a, b) => this.apart(region, a, near.cell!) - this.apart(region, b, near.cell!))[0]!.id;
    }
    if (need !== 'any') { return (fit[0] ?? region.settlements[0]!).id; }
    const open = fit.filter(t => !claimed.has(t.id));
    const town = open.length ? open[new Expressions(at.key).number(`1d${open.length}`) - 1]! : region.settlements[0]!;
    claimed.add(town.id);
    return town.id;
  }
  static readonly sizes: Record<string, number> = { town: 3, village: 2, hamlet: 1 };
  // The biggest settlement, the first of those as big.
  static largest(towns: Settlement[]): Settlement {
    return towns.reduce((best, t) => (this.sizes[t.size] ?? 0) > (this.sizes[best.size] ?? 0) ? t : best, towns[0]!);
  }
  // The next settlement along the roads from one: one a road joins it to that this placement has not bound already
  // (the next stop of a round), or else any it has not; the first of them.
  static along(region: Region, bindings: Record<string, string>, from: string | undefined, fit: Settlement[]) {
    const bound = new Set(Object.values(bindings));
    const pool = (fit.length ? fit : region.settlements).filter(t => !bound.has(t.id));
    const joined = RegionGeography.roads(region).filter(r => this.touches(r, from))
      .map(r => r.from.id === from ? r.to : r.from).filter(t => pool.includes(t));
    return joined[0] ?? pool[0] ?? region.settlements.find(t => t.id !== from) ?? region.settlements[0]!;
  }
  // The stretch of road a scenario needs: the road out of a settlement (near:role), by the water if one runs by water
  // (what happens on a road by a stream, a cart in the ditch, willows for a fever, is where people say it is); or the
  // road between two (between:role,role), or else a road into the second, or out of the first, not taken already.
  static way(region: Region, need: string, bindings: Record<string, string>): string | undefined {
    const roads = RegionGeography.roads(region);
    if (!need.startsWith('between:')) {
      const town = bindings[need.replace(/^near:/, '')], out = roads.filter(r => this.touches(r, town));
      return (out.find(r => RegionGrowth.habitats(region, r.route.cells).has('riverbank')) ?? out[0])?.way;
    }
    const [a, b] = need.slice(8).split(',').map(role => bindings[role]), taken = Object.values(bindings);
    return (roads.find(r => this.touches(r, a) && this.touches(r, b))
      ?? roads.find(r => this.touches(r, b) && !taken.includes(r.way))
      ?? roads.find(r => this.touches(r, a) && !taken.includes(r.way))
      ?? roads.find(r => this.touches(r, a)))?.way;
  }
  private static touches(r: { from: Settlement; to: Settlement }, town?: string): boolean {
    return r.from.id === town || r.to.id === town;
  }
  private static apart(region: Region, t: Settlement, cell: number): number {
    return Terrain.distance(RegionGeography.atlas(region).land, t.cell!, cell);
  }
}
