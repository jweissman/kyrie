import type { BundleSource } from '../campaign/bundle-source';
import type { BundleRequest } from '../campaign/module-bundle';
import type { CreatureGenerationContext } from '../content';
import type { Contact, Region } from './region-writer';
import type { Placement } from './world-assembler';
import { Origins } from './origins';
import { StockOpenings } from './stock-openings';
import { Career } from './career';
import { RegionRecruits } from './region-recruits';

type Begun = NonNullable<ReturnType<typeof Origins.write>>;
interface At { seed: string; region: Region; placements: Placement[]; party: CreatureGenerationContext[];
  contacts: Contact[]; root: string; files: Record<string, string>; modules: BundleRequest[] }

// Where one life begins in a drawn world, as the assembler installs it (WorldAssembler.built): its origin's module; a
// stock opening chosen at creation, begun in ahead of it (StockOpenings: none, unless chosen); the Rì's commission on
// the notice of the town the life begins in (Career); and, for one who comes alone, who at the first inn would come
// along (RegionRecruits.arrival, PT-11).
export class WorldStart {
  static async begun(base: BundleSource, origin: Parameters<typeof Origins.write>[0] | undefined,
    opening: string | undefined, at: At): Promise<Begun | undefined> {
    const stock = origin && opening ? await StockOpenings.load(base, opening) : undefined;
    const written = origin && Origins.write(origin, { region: at.region, placements: at.placements,
      protagonist: at.party[0]!.name ?? 'you', root: at.root, files: at.files, ...stock ? { opening: stock } : {} });
    const opened = stock && written && StockOpenings.write(stock, { region: at.region, start: written.start,
      root: at.root, files: at.files });
    const told = opened ? { ...written!, start: opened.start } : written;
    at.modules.push(...opened ? [opened.request] : [], ...told ? [told.request] : [],
      ...Career.first(at.seed, at.region, { root: at.root, files: at.files, start: told?.start }));
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
