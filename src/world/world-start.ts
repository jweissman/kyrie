import type { BundleSource } from '../campaign/bundle-source';
import type { BundleRequest } from '../campaign/module-bundle';
import type { CreatureGenerationContext } from '../content';
import type { Contact, Region } from './region-writer';
import type { Placement } from './world-assembler';
import { Origins } from './origins';
import { StockOpenings } from './stock-openings';
import { Career } from './career';
import { FirstAims } from './first-aims';
import { RegionRecruits } from './region-recruits';

type Begun = NonNullable<ReturnType<typeof Origins.write>>;
interface At { seed: string; region: Region; placements: Placement[]; party: CreatureGenerationContext[];
  contacts: Contact[]; root: string; files: Record<string, string>; modules: BundleRequest[] }

// Where one life begins in a drawn world, as the assembler installs it (WorldAssembler.built): its origin's module; a
// stock opening chosen at creation, begun in ahead of it (StockOpenings: none, unless chosen); the Rì's commission on
// the notice of the town the life begins in (Career); the First Aims, an undertaking it may take up (FirstAims,
// OR-443); and, for one who comes alone, who at the first inn would come along (RegionRecruits.arrival, PT-11).
export class WorldStart {
  // A company for tests and tools that supply none, never a player's life.
  static readonly fixture: CreatureGenerationContext[] = [
    { name: 'Elen', raceId: 'elf', classId: 'ranger', backgroundId: 'hunter' },
    { name: 'Bran', raceId: 'human', classId: 'warrior', backgroundId: 'locksmith', traits: ['toughness'] },
    { name: 'Dori', raceId: 'dwarf', classId: 'cleric', backgroundId: 'medic', traits: ['vitalist'],
      spells: ['cure', 'bless', 'anoint', 'prayer', 'cure_moderate', 'cure_serious'] }];
  static async begun(base: BundleSource, origin: Parameters<typeof Origins.write>[0] | undefined,
    opening: string | undefined, at: At): Promise<Begun | undefined> {
    const stock = origin && opening ? await StockOpenings.load(base, opening) : undefined;
    const written = origin && Origins.write(origin, { region: at.region, placements: at.placements,
      protagonist: at.party[0]!.name ?? 'you', root: at.root, files: at.files, ...stock ? { opening: stock } : {} });
    const opened = stock && written && StockOpenings.write(stock, { region: at.region, start: written.start,
      root: at.root, files: at.files });
    const told = opened ? { ...written!, start: opened.start } : written;
    const career = Career.first(at.seed, at.region, { root: at.root, files: at.files, start: told?.start });
    const home = FirstAims.home(at.region, told?.start), aims = told && FirstAims.write(at.region, home,
      { root: at.root, files: at.files, career: career.length > 0 });
    at.modules.push(...opened ? [opened.request] : [], ...told ? [told.request] : [], ...career, ...aims ? [aims] : []);
    if (!told || at.party.length === 1) { this.arrival(at.region, { size: at.party.length, contacts: at.contacts,
      start: told?.start.place }, at); }
    return told;
  }
  // Why the company came, written as a module of its own (see RegionRecruits.arrival).
  private static arrival(region: Region, company: { size: number; contacts: Contact[]; start?: string },
    at: { files: Record<string, string>; root: string; modules: BundleRequest[] }) {
    const arrival = RegionRecruits.arrival(region, company);
    if (!arrival) { return; }
    at.files[`${at.root}/arrival/module.json`] = JSON.stringify(arrival.manifest);
    at.files[`${at.root}/arrival/arrival.kyr`] = arrival.source;
    at.modules.push({ id: 'arrival', bundle: `${at.root}/arrival/module.json`, imports: arrival.imports });
  }
}
