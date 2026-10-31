import type { BundleSource } from './bundle-source';
import { ModuleBundle, type BundleRequest } from './module-bundle';
import { ModuleCanon } from './module-canon';
import { ModuleInstallations } from './module-installations';
import type { InstalledInstance } from './installed-instance';

// A world as the canon is installed into it: what it has installed, what it could not take, and how it takes more.
interface Host {
  readonly installed: string[]; readonly conflicts: readonly string[];
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
  static async first(seed: string, source: BundleSource): Promise<InstalledInstance | undefined> {
    if (!await ModuleCanon.declarations(source)) { return undefined; }
    const draft = await ModuleBundle.load(ModuleCanon.request(source), { seed }, source);
    return ModuleInstallations.prepare(undefined, draft, 0, false);
  }
  // Before a module is installed into a world without the canon: the canon, if the world will take it.
  static async before(host: Host, request: BundleRequest, source: BundleSource): Promise<void> {
    if (request.id === ModuleCanon.id || host.installed.includes(ModuleCanon.id)
      || host.conflicts.some(c => c.startsWith(CanonInstall.refused))) { return; }
    if (!await ModuleCanon.declarations(source)) { return; }
    try { await host.install(ModuleCanon.request(source), source); } catch (error) {
      host.conflict(`${CanonInstall.refused}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
