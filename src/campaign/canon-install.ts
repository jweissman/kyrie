import type { BundleSource } from './bundle-source';
import { ModuleBundle, type BundleRequest, type CampaignManifest } from './module-bundle';
import type { Dated } from './campaign-types';
import { ModuleCanon } from './module-canon';
import { ModuleInstallations } from './module-installations';
import type { InstalledInstance } from './installed-instance';

// A world as the canon is installed into it: what it has installed, what it could not take, and how it takes more.
interface Host {
  readonly installed: string[]; readonly conflicts: readonly string[];
  readonly tickState?: { current: { canonless?: true } };
  install(request: BundleRequest, source: BundleSource): Promise<void>;
  conflict(note: string): void;
}
// The canon (data/imbar, see ModuleCanon) is every world's first installation, before its company's module and
// whatever is drawn after it, so that its planes, thresholds and names are there before any module names them, and
// are one and the same in every world. A world kept from before there was a canon is given it before its next
// module, if it can take it; one that cannot is left as it is, and says so among its conflicts (the lint's
// "identity" errors), and is not asked again.
export class CanonInstall {
  static readonly refused = 'The canon (data/imbar) could not be installed in this world';
  // The canon alone, as the base the first module of a campaign is installed on; nothing, for a source without one.
  // Never for a campaign of a setting of its own ("canon": false: BX-01, the setting/framework boundary).
  static async first(seed: string, source: BundleSource, manifest?: CampaignManifest)
    : Promise<InstalledInstance | undefined> {
    if (manifest?.canon === false || !await ModuleCanon.declarations(source)) { return undefined; }
    const draft = await ModuleBundle.load(ModuleCanon.request(source), { seed }, source);
    return ModuleInstallations.prepare(undefined, draft, 0, false);
  }
  // What a campaign's state keeps of its manifest as it begins: its date, its night, and whether it is of a setting
  // of its own (kept, so that no module installed into it later, nor its save, brings the canon in).
  static dated(m: CampaignManifest): Dated {
    return { calendar: m.calendar, night: m.night, ...m.canon === false ? { canonless: true as const } : {} };
  }
  // Before a module is installed into a world without the canon: the canon, if the world will take it.
  static async before(host: Host, request: BundleRequest, source: BundleSource): Promise<void> {
    if (host.tickState?.current.canonless || request.id === ModuleCanon.id || host.installed.includes(ModuleCanon.id)
      || host.conflicts.some(c => c.startsWith(CanonInstall.refused))) { return; }
    if (!await ModuleCanon.declarations(source)) { return; }
    try { await host.install(ModuleCanon.request(source), source); } catch (error) {
      host.conflict(`${CanonInstall.refused}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
