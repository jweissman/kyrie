import partyExamples from '../../data/campaigns/companies.json';
import { Canon } from '../../src/canon/canon';
import { Content } from '../../src/content';
import { Overlays } from '../../src/overlays';
import { CompanyPreview } from '../../src/presentation/company-preview';
import { WorldAssembler } from '../../src/world/world-assembler';
import type { BundleSource } from '../../src/campaign/bundle-source';
import type { CampaignManifest } from '../../src/campaign/module-bundle';
import { Scenarios } from '../scenarios';
import type { Catalog, CompanyView, Member, Setting } from './protocol';

interface Assembled { seed: string; terrain?: string; path: string; source: BundleSource; campaign: CampaignManifest }

// The engine's side of forming a company: what there is to choose from, what a campaign asks of the company, a
// generated region drawn for it, and what a draft company would bring.
export class Creation {
  static readonly generated = 'world';
  private assembled?: Assembled;
  static catalog(): Catalog {
    const companies = (partyExamples as { companies: Catalog['presets'] }).companies;
    const backgrounds = Object.keys(Overlays.catalog).filter(id => Overlays.has(id, 'background'));
    return {
      ancestries: (Content.playableRaces as string[]).map(id => ({ id, name: Canon.ancestries[id]?.name ?? id,
        text: Canon.ancestries[id]?.description ?? '' })),
      callings: (Content.playableClasses as string[]).map(id => {
        const c = Canon.classes[Canon.resolve('classes', id)];
        return { id, name: c?.name ?? id, text: c?.practice ?? c?.description ?? '',
          specializations: (c?.specializations ?? []).map(t => ({ id: t, name: Canon.traits[t]?.name ?? t })) };
      }),
      backgrounds: backgrounds.map(id => ({ id, name: Overlays.get(id).name, kind: Canon.backgrounds[id]?.kind ?? '',
        text: this.brings(id), ...Canon.backgrounds[id]?.requiredClass
          ? { calling: Canon.backgrounds[id].requiredClass } : {} }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      kinds: Object.entries(Canon.backgroundKinds).map(([id, k]) => ({ id, name: k.name })),
      presets: companies.map(c => ({ ...c, members: structuredClone(c.members) })),
      campaigns: [...Scenarios.list.map(s => ({ id: s.manifest, title: s.title, note: s.note, detail: s.detail,
        seed: s.seed, ...s.recommended ? { recommended: true } : {} })),
      { id: this.generated, title: 'A generated region', seed: 'thorn',
        note: 'Deem draws a region (its towns, people, faith and wild places) and the assembler sets adventures in it.',
        detail: 'Three settlements and three adventures' }],
    };
  }
  // A background in a phrase: the skills it brings and what it carries.
  private static brings(id: string): string {
    const b = Canon.backgrounds[id];
    const skills = (b?.skills ?? []).map(s => Canon.skills[s]?.name.toLowerCase() ?? s);
    const gear = (b?.gear ?? []).map(g => Canon.items[g]?.name.toLowerCase() ?? g);
    return [skills.length ? `knows ${skills.join(' and ')}` : '', gear.length ? `carries ${gear.join(', ')}` : '']
      .filter(Boolean).join('; ');
  }
  setting(campaign: string): Setting {
    const manifest = JSON.parse(Scenarios.files[campaign] ?? '{}') as Partial<CampaignManifest>;
    const title = manifest.name ?? 'Kyr';
    return { title, pitch: manifest.pitch ?? { heading: title, text: 'Choose three companions.' },
      party: structuredClone(manifest.party ?? Creation.preset('fellowship')), generated: false };
  }
  static preset(id: string): Member[] {
    const companies = (partyExamples as { companies: Catalog['presets'] }).companies;
    return structuredClone((companies.find(c => c.id === id) ?? companies[0]!).members);
  }
  // A region drawn from a seed, with adventures set in it; kept so the company can set out into it.
  async generate(seed: string, terrain?: string, party?: Member[]): Promise<Setting> {
    const world = await WorldAssembler.assemble(seed, Scenarios.source(),
      { ...terrain ? { region: { terrain } } : {}, ...party ? { party } : {} });
    const campaign = JSON.parse(await world.source.read(world.path)) as CampaignManifest;
    this.assembled = { seed, ...terrain ? { terrain } : {}, path: world.path, source: world.source, campaign };
    const title = campaign.name;
    return { title, pitch: campaign.pitch ?? { heading: title, text: 'Choose three companions.' },
      party: structuredClone(campaign.party ?? Creation.preset('fellowship')), generated: true };
  }
  // Where a company sets out: an authored campaign from the bundled files, or the generated region drawn again for
  // this company (its backgrounds place old friends in the region).
  async origin(campaign: string, seed: string, party: Member[], terrain?: string) {
    if (campaign !== Creation.generated) { return { path: campaign, source: Scenarios.source() }; }
    await this.generate(seed, terrain, party);
    return { path: this.assembled!.path, source: this.assembled!.source };
  }
  static preview(party: Member[], generated: boolean): CompanyView {
    const company = CompanyPreview.company(party), formations = CompanyPreview.formations(party);
    return {
      members: party.map(p => {
        const m = CompanyPreview.member(p);
        return { calling: m.calling, practice: m.practice, skills: m.skills.map(s => s.name), gear: m.gear,
          ...m.contact && generated ? { contact: m.contact } : {}, ...m.requires ? { requires: m.requires } : {} };
      }),
      covered: company.covered, missing: company.missing,
      formed: formations.formed.map(f => ({ name: f.name, perks: f.perks })),
      near: formations.near.slice(0, 3).map(f => ({ name: f.name, needs: f.needs ?? '', perks: f.perks })),
    };
  }
}
