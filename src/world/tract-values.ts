import { ModuleSource, type Predicate } from './kyr-values';

// The country's stretches declared as values (ModuleSource; AX-04, generated-ir.md): a stretch's ways across country
// and onto its road and what stands on it, and what is seen there, each the parser's field or element for its line
// (the next of a country's constructs by bytes after the keepers' topics: RegionTracts' Passage and Observe, an
// eighth of its Kyr), with that line beside it for inspection.
export class TractValues {
  private static readonly provenance = (construct: string) => ({ generator: 'region-tracts', construct });
  // `Passage <id> "<name>" is overland between <a> and <b> taking <minutes> minutes.`, as the parser reads it (a way
  // under ten minutes in minutes, a longer in whole watches: ModuleParser.Taking).
  static way(id: string, name: string, [a, b]: [string, string], minutes: number): string {
    const kyr = `  Passage ${id} ${JSON.stringify(name)} is overland between ${a} and ${b} taking ${minutes} minutes.`;
    return ModuleSource.passage({ id, name, sides: [a, b], oneWay: false, kind: 'overland',
      ticks: Math.max(1, Math.ceil(minutes / 10)), ...minutes < 10 ? { minutes } : {} }, kyr,
    this.provenance('Passage'));
  }
  // `Observe <id> at <place> as <aspect> when <when> "<text>"[ teaches <fact>].`
  static seen(id: string, place: string, o: { aspect: 'fixture' | 'sign'; when?: [string, string]; text: string;
    teaches?: string }): string {
    const when: Predicate = o.when ? { kind: 'call', name: o.when[0], args: o.when[1].split(', ') }
      : { kind: 'boolean', value: true };
    const kyr = `  Observe ${id} at ${place} as ${o.aspect} when ${o.when ? `${o.when[0]}(${o.when[1]})` : 'true'} `
      + `${JSON.stringify(o.text)}${o.teaches ? ` teaches ${o.teaches}` : ''}.`;
    return ModuleSource.observe({ id, place, when, text: o.text, aspect: o.aspect, ...o.teaches ? { teaches: o.teaches }
      : {} }, kyr, this.provenance('Observe'));
  }
}
