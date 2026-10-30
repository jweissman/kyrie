import type { DeemValue } from 'deem';
import type { BundleSource } from '../../campaign/bundle-source';

// A slot is a place (or power) a kit must be given. `is` names what can fill it, as a Kyr predicate over the slot's
// own variable (?road for the slot road); `requires` are hard constraints that may also name earlier slots;
// `prefers` add their weight to a candidate that meets them. Nothing outside these is consulted.
export interface SlotSpec {
  is: string; requires?: string[]; prefers?: { when: string; weight: number }[];
}
// A dimension Deem proposes: a row of a kit table, drawn by the region's context. A row may carry `_requires`
// (Kyr predicates over the bound slots that must hold for it to be accepted) and `_why` (what it means).
export interface ProposalSpec { table: string; by?: string }
// A module the kit installs when its proposals match `when`; imports name slots (?slot), the company (@party), a
// kit entity (@name), or another of the kit's modules (module.export).
export interface KitModule {
  id: string; bundle: string; when?: Record<string, string>; imports: Record<string, string>;
}
// What people say about a placement, to be carried by word of mouth: a fact one of the kit's modules exports
// (module.export), the topic it is asked about ("the bell the hobs took": Ask Aspen about the bell the hobs took), and
// the slot of the settlement whose people know it; `when` as a module's. Who keeps the inn there and in the settlement
// nearest it tell it, and knowing it leads to the place the placement claims (see KitWord).
export interface KitHook { fact: string; topic: string; heard: string; when?: Record<string, string> }
export interface KitManifest {
  version: 1; id: string; name: string; about: string;
  slots: Record<string, SlotSpec>;
  proposals?: Record<string, ProposalSpec>;
  // Facts in the assembly vocabulary the placement establishes (?slot, @entity and #dimension are substituted).
  provides: string[];
  // Slots this placement takes for its own, which no other placement may claim.
  claims?: string[];
  modules: KitModule[];
  hooks?: KitHook[];
  tables?: string;
}
export interface Kit { path: string; manifest: KitManifest; tables: Record<string, DeemValue> }

export class Kits {
  static async load(source: BundleSource, path: string): Promise<Kit> {
    const manifest = JSON.parse(await source.read(path)) as KitManifest;
    if (manifest.version !== 1 || !manifest.id || !manifest.slots || !Array.isArray(manifest.modules)) {
      throw new Error(`Invalid kit manifest ${path}`);
    }
    const tables = manifest.tables ? JSON.parse(await source.read(source.resolve(manifest.tables, path))) as
      Record<string, DeemValue> : {};
    if (manifest.hooks?.length && !manifest.claims?.length) {
      throw new Error(`Kit ${manifest.id} has hooks, which lead to the place it claims, and claims none`);
    }
    for (const [dimension, spec] of Object.entries(manifest.proposals ?? {})) {
      if (!tables[spec.table]) { throw new Error(`Kit ${manifest.id} proposes ${dimension} from a missing table ${spec.table}`); }
    }
    return { path, manifest, tables };
  }
}
