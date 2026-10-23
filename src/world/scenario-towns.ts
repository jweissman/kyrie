import { Expressions } from '../expressions';
import { Terrain } from './land/terrain';
import { RegionGeography } from './region-geography';
import { RegionWriter, type Region, type Settlement } from './region-writer';
import { SettlementWriter } from './settlement-writer';
import type { ScenarioManifest } from './world-assembler';

// Which settlement a scenario set in one is placed in: one that has the rooms its modules name (not every settlement
// has an inn, a shop or a shrine), nearest a site the scenario took, or free, or the first.
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
  private static apart(region: Region, t: Settlement, cell: number): number {
    return Terrain.distance(RegionGeography.atlas(region).land, t.cell!, cell);
  }
}
