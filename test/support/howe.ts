import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { Kept } from './kept';
import { Placed } from './placed';
import { WorldAssembler } from '../../src/world/world-assembler';
import { HoweReading, R, FOUR } from './howe-reading';

export { R, company, FOUR, levelled } from './howe-reading';

// What the Bound Howe's specs share: the ids of the module, the companies, where the howe stands in the reference
// country (read from the world, never written), and the Howe class that plays and reads it by the page's labels.
// Where the howe stands in the reference country (kahitude) is read from the world, never written here: the
// settlements and sites scenarios take are numbered in the order they are placed, so a scenario added before this one
// moves them. The town is the one nearest the howe (its clerk, shrine and taproom); the first town tells of it too.
export const PLACED = (await WorldAssembler.assemble('kahitude', NodeBundleSource.shared, {})).report.placements
  .find(x => x.scenario === 'bound-howe')!.bindings;
export const SITE = `region__${PLACED.howe}`;
export const TOWN = (part: string) => `region__${PLACED.town}_${part}`;
// Countries by what they drew (the draw moves with the template; read the world if in doubt): b2 and d4 left the howe
// broken; kahitude, a1, thorn and c3 sealed it from within.

export class Howe extends HoweReading {
  // Drawn once in a spec file for each company and seed, and resumed for each case after (see Kept.drawn): the howe's
  // specs drew kahitude for the same four in nearly every case.
  static async start(party = FOUR, seed = 'kahitude') {
    return (await Kept.drawn(seed, party.length > 1 ? { party } : { origin: 'debt', party })).journey;
  }
  static async at(place: string, party = FOUR, seed = 'kahitude') {
    const j = await this.start(party, seed);
    Placed.at(j, R(place));
    return j;
  }
  static async town(seed: string) {
    const p = (await WorldAssembler.assemble(seed, NodeBundleSource.shared, {})).report.placements.find(x => x.scenario === 'bound-howe')!.bindings;
    return (part: string) => `region__${p.town}_${part}`;
  }
}
