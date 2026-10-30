import type { Composed } from './compose/composition';
import { ModuleParser } from '../lang/module-parser';
import { Histories } from './history/histories';
import { RegionWorks } from './region-works';
import { RegionWriter } from './region-writer';
import type { WorldReport } from './world-assembler';
import type { PlacedSite } from './world-audit';

// The sites a world's placements set apart, as the audit reads them (see WorldAudit): each place a kit claims off the
// roads, with the settlements its placement is bound to; and each lesser makers' work, with the settlements whose
// people tell of it. A place on a road is met by whoever goes along it (a toll); a great work is found by putting the
// country's history together, not told of; a deep site is written from what it was for, with word of its own.
export class PlacedSites {
  static of(report: WorldReport, composed?: Composed): PlacedSite[] {
    return [...composed ? this.kits(composed) : [], ...this.works(report)];
  }
  private static kits(composed: Composed): PlacedSite[] {
    const ledger = composed.ledger, square = ModuleParser.predicate('square(?town, ?square)');
    return composed.placements.flatMap(p => {
      const towns = Object.values(p.bindings)
        .filter(b => ledger.holds('settlement', b) || ledger.solve(square, { '?square': b }).length > 0);
      return Object.entries(p.bindings).filter(([, b]) => ledger.holds('taken', b, p.kit) && !ledger.holds('onRoad', b))
        .map(([slot, place]) => ({ subject: `${p.id}.${slot}`, place, towns }));
    });
  }
  private static works(report: WorldReport): PlacedSite[] {
    const region = report.region;
    return region.sites.filter(s => s.work && !Histories.plan(s.work.plan).great && !Histories.plan(s.work.plan).deep)
      .map(s => ({ subject: `work:${s.id}`, place: `${RegionWriter.id}__${s.id}`,
        towns: RegionWorks.towns(region, s).map(t => `${RegionWriter.id}__${t.id}`) }));
  }
}
