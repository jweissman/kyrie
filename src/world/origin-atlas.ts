import type { Region, Settlement } from './region-writer';
import type { Placement } from './world-assembler';
import type { OriginBound } from './origins';

// The lives a country of the strategic atlas begins (data/origins/<id>, binder the same): each a life already in the
// country, bound to what is going on there (StrategicAtlas.goings), not a reason for having come. A country of the
// atlas begins only its own; the rest of the library's lives begin elsewhere (see Origins.bind).
export class AtlasOrigins {
  static readonly binders = ['drove', 'pans', 'weir'];
  static bind(binder: string, region: Region, placements: Placement[]): OriginBound | undefined {
    switch (binder) {
      case 'drove': return this.drove(region, placements);
      case 'pans': return this.pans(region, placements);
      case 'weir': return this.weir(region, placements);
      default: return undefined;
    }
  }
  // Come down the drove road with a Brynach drove whose lead-drover the customs-men took at the march: begun on the
  // town's green, the drove in the pens and the drover behind the customs-house grille.
  private static drove(region: Region, placements: Placement[]): OriginBound | undefined {
    const p = this.placed(placements, 'iscoed-drove'), s = p && this.town(region, p.bindings.town);
    if (!p || !s) { return undefined; }
    const m = p.modules[0]!;
    return { values: this.values(s), start: { place: `${s.id}_green` },
      imports: { green: [`region.${s.id}_green`, 'place'], bran: [`${m}.bran`, 'group'], owain: [`${m}.owain`, 'group'],
        held: [`${m}.held`, 'fact'] } };
  }
  // A hand at the town's salt-pans, a week's wage owed and the fires going out: begun in the salt-house.
  private static pans(region: Region, placements: Placement[]): OriginBound | undefined {
    const p = this.placed(placements, 'iscoed-pans'), s = p && this.town(region, p.bindings.town);
    const fuel = p && this.town(region, p.bindings.fuelvillage);
    if (!p || !s || !fuel) { return undefined; }
    const m = p.modules[0]!;
    return { values: { ...this.values(s), merchant: s.merchant, fuelvillage: fuel.name }, start: { place: `${s.id}_shop` },
      imports: { shop: [`region.${s.id}_shop`, 'place'], salter: [`region.${s.id}_merchant`, 'group'],
        cold: [`${m}.cold`, 'fact'], work: [`${m}.work`, 'fact'] } };
  }
  // An aunt's eel-weir at the hamlet under the failing sea-gate, and its lease: begun on the hamlet's green.
  private static weir(region: Region, placements: Placement[]): OriginBound | undefined {
    const p = this.placed(placements, 'iscoed-gate'), s = p && this.town(region, p.bindings.town);
    const h = p && this.town(region, p.bindings.hamlet);
    if (!p || !s || !h) { return undefined; }
    const m = p.modules[0]!;
    return { values: { ...this.values(s), hamlet: h.name }, start: { place: `${h.id}_green` },
      imports: { hamlet: [`region.${h.id}`, 'place'], hamletgreen: [`region.${h.id}_green`, 'place'],
        reeve: [`${m}.reeve`, 'group'], failing: [`${m}.failing`, 'fact'], tide: [`${m}.tide`, 'fact'],
        cut: [`${m}.cut`, 'fact'], shut: [`${m}.shut`, 'fact'],
        // What came of Ifan Rhys's boat under the shut gate, for Nest to answer.
        letThrough: [`${m}.letThrough`, 'relation'], turnedBack: [`${m}.turnedBack`, 'relation'], named: [`${m}.named`, 'relation'] } };
  }
  private static values(s: Settlement): Record<string, string> {
    return { town: s.name, home: s.name, homename: s.name };
  }
  private static placed(placements: Placement[], scenario: string): Placement | undefined {
    return placements.find(p => p.scenario === scenario && p.rid === 'region');
  }
  private static town(region: Region, id: string | undefined): Settlement | undefined {
    return region.settlements.find(s => s.id === id);
  }
}
