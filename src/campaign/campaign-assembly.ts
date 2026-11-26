import { LocalKinds } from '../canon/local-catalog';
import type { BundleSource } from './bundle-source';
import { Campaign } from './campaign';
import { CanonInstall } from './canon-install';
import { CompanyChoices } from './company-choices';
import { EngineDeclarations } from './engine-declarations';
import type { Assembly } from './load-cache';
import { ModuleBundle } from './module-bundle';
import { ModuleInstallations } from './module-installations';

// A campaign made from its manifest, module by module (Campaign.load's cold path): the canon first, so that what it
// names is there before any module names it (see CanonInstall); each module checked as it is compiled; the joined
// whole, once, when the last is in.
export class CampaignAssembly {
  static async assemble(path: string, seed: string, source: BundleSource, at: Assembly): Promise<Campaign> {
    LocalKinds.reset(); const manifest = await ModuleBundle.campaign(path, source, seed);
    const party = at.party ?? manifest.party, step = at.step;
    const canon = await CanonInstall.first(seed, source, manifest); let campaign: Campaign | undefined;
    for (const [i, request] of manifest.modules.entries()) {
      await step?.(i, manifest.modules.length);
      if (campaign) { await campaign.install(request, source, false, i === manifest.modules.length - 1); continue; }
      const draft = await ModuleBundle.load(request, { seed, installed: canon?.campaign.installations,
        party: party?.length, canonless: manifest.canon === false, kinds: canon?.module.catalog }, source);
      if (party) { CompanyChoices.apply(draft, party, manifest.canon === false); }
      EngineDeclarations.declare(draft, Campaign.catalogAmong(canon?.module.catalog, draft.instance.module.catalog));
      const first = ModuleInstallations.prepare(canon, draft, 0, false);
      campaign = new Campaign(seed, first, undefined, CanonInstall.dated(manifest));
    }
    // Settled when the last is in: everyone's facts projected once (as the last is taken in, before its rules settle;
    // here again only what settling changed), and the joined whole checked.
    campaign!.refreshProjection(); ModuleInstallations.check(campaign!.module, campaign!.world);
    CanonInstall.named(campaign!, manifest); return campaign!;
  }
}
