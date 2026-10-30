import type { Memorial } from '../../src/world/memorial';
import partyExamples from '../../data/campaigns/companies.json';
import { Canon } from '../../src/canon/canon';
import { Rolls } from '../../src/rules/rolls';
import { Content } from '../../src/content';
import { Overlays } from '../../src/overlays';
import { CompanyPreview } from '../../src/presentation/company-preview';
import { WorldAssembler } from '../../src/world/world-assembler';
import { DrawnWorld } from '../../src/world/drawn-world';
import type { BundleSource } from '../../src/campaign/bundle-source';
import { ModuleBundle, type CampaignManifest } from '../../src/campaign/module-bundle';
import { Scenarios } from '../scenarios';
import { Origins } from '../../src/world/origins';
import type { Catalog, CompanyView, Member, Setting } from './protocol';
import { CreatureSchema } from '../../src/creature';
import { CharacterSheets } from '../../src/presentation/character-sheet';
import { Fighting } from '../../src/rules/fighting';
import { Creation as RulesCreation } from '../../src/rules/creation';
import { MechanicsText } from '../../src/presentation/mechanics-text';
import type { Trait } from '../../src/canon/schema';
import { ProtagonistNames } from '../../src/world/protagonist-names';
import { FirstSpells } from './first-spells';
import { CardLines } from './card-lines';


// The engine's side of forming a company: what there is to choose from, what a campaign asks of the company, a
// generated region drawn for it, and what a draft company would bring.
export class Creation {
  static readonly generated = 'world';
  static catalog(): Catalog {
    const companies = (partyExamples as { companies: Catalog['presets'] }).companies;
    const backgrounds = Object.keys(Overlays.catalog).filter(id => Overlays.has(id, 'background'));
    return {
      ancestries: (Content.playableRaces as string[]).map(id => ({ id, name: Canon.ancestries[id]?.name ?? id,
        text: Canon.ancestries[id]?.description ?? '', line: CardLines.line(id),
        callings: (Content.playableClasses as string[])
          .filter(c => Canon.ancestries[id]?.classes.includes(c) ?? true),
        forbids: [...Canon.ancestries[id]?.forbiddenTraits ?? []],
        qualities: { ...Canon.ancestries[id]?.attributes ?? {} } as Record<string, number>, gifts: this.gifts(id) })),
      callings: (Content.playableClasses as string[]).map(id => this.calling(id)),
      qualities: CreatureSchema.attributes.map(id => ({ id, name: CharacterSheets.names[id],
        rests: CharacterSheets.rests[id] })),
      worth: Array.from({ length: 31 }, (_, score) => score ? Fighting.statMod(score) : 0),
      backgrounds: backgrounds.map(id => ({ id, name: Overlays.get(id).name, kind: Canon.backgrounds[id]?.kind ?? '',
        text: this.brings(id), qualities: { ...Canon.backgrounds[id]?.attributes ?? {} } as Record<string, number>,
        coin: Canon.backgrounds[id]?.gold ?? 0,
        gear: (Canon.backgrounds[id]?.gear ?? []).map(g => Canon.items[g]?.name.toLowerCase() ?? g),
        ...Canon.backgrounds[id]?.requiredClass ? { calling: Canon.backgrounds[id].requiredClass } : {} }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      // Each kind of background, and what the skill its people know is for.
      kinds: Object.entries(Canon.backgroundKinds).map(([id, k]) => ({ id, name: k.name,
        does: (k.skills ?? []).map(s => `${Canon.skills[s]?.name ?? s}: ${Canon.skills[s]?.description ?? ''}`).join(' ') })),
      presets: companies.map(c => ({ ...c, members: structuredClone(c.members) })),
      campaigns: [...Scenarios.list.map(s => ({ id: s.manifest, title: s.title, note: s.note, detail: s.detail,
        seed: s.seed, ...s.recommended ? { recommended: true } : {} })),
      { id: this.generated, title: 'A generated region', seed: 'thorn',
        note: 'Deem draws a region (its towns, people, faith and wild places) and the assembler sets adventures in it.',
        detail: 'Three settlements and three adventures' }],
    };
  }
  private static calling(id: string): Catalog['callings'][number] {
    const c = Canon.classes[Canon.resolve('classes', id)];
    return { id, name: c?.name ?? id, text: c?.practice ?? c?.description ?? '', line: CardLines.line(id),
      ...CardLines.trades[id] ? { trade: CardLines.trades[id] } : {},
      specializations: (c?.specializations ?? []).map(t => this.specialization(id, t)),
      qualities: { ...c?.attributes ?? {} } as Record<string, number>,
      hitDie: c?.hitDie ?? 4, armour: this.armour(id),
      skills: (c?.skills ?? []).map(k => Canon.skills[k]?.name ?? k),
      ...c?.spellcasting ? { casts: c.spellcasting.attribute } : {},
      ...c?.abilities.includes('set_spear') ? { braces: true } : {},
      weapons: this.arms(id) };
  }
  // A school, a god's domain or a way: a school by its name without "Specialist" and its specialist ("Abjurer"), a
  // domain by its own name ("Life", not "Vitalist", which is its clerics' title), a way by its name, with a sentence
  // of its own and its rules in plain words; and, for one that casts, the spells it sets out knowing and the picks
  // among them (see FirstSpells).
  private static specialization(calling: string, id: string): Catalog['callings'][number]['specializations'][number] {
    const t = Canon.traits[id], own = FirstSpells.own(calling), access = t?.spellAccess;
    const named = (t?.name ?? id).replace(/ Specialist$/, ''), domain = access?.domain && Creation.upper(access.domain);
    const callingName = (Canon.classes[Canon.resolve('classes', calling)]?.name ?? calling).toLowerCase();
    const picks = access ? FirstSpells.picks(id, own) : [];
    const way = { name: domain || named, text: CardLines.sentences[id] ?? t?.description ?? '',
      line: CardLines.line(id), of: access?.domain ?? access?.school ?? '',
      rules: CardLines.plain(MechanicsText.modifiers(t?.modifiers ?? {})) };
    const who = domain ? { title: named, who: `${callingName} of ${domain}` }
      : access ? { title: Creation.upper(id), who: id }
        : { who: `${callingName}, ${CardLines.manners[id] ?? named.toLowerCase()}` };
    return { id, ...way, ...who, ...access ? { picks, spells: FirstSpells.shown(id, own, picks) } : {} };
  }
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
  // The weapons a protagonist of a calling may set out with: its own, and every ordinary weapon of the kinds and
  // weights it is trained to (a warrior, any), each with what it is by the rules. Not a treasure or a thing of one
  // adventure (the Wardens' blade, the longsword of flames): those are found.
  static arms(calling: string): Catalog['callings'][number]['weapons'] {
    const c = Canon.classes[Canon.resolve('classes', calling)], own = c?.weapons ?? [];
    return Object.entries(Canon.items).filter(([id, i]) => i.weapon && !i.weapon.natural && i.slot === 'weapon'
      && (own.includes(id) || (/^weapon:/.test(i.source.orsino ?? '') && RulesCreation.canEquip(calling, id))))
      .map(([id, i]) => ({ id, name: i.name, damage: i.weapon!.damage, type: i.weapon!.type, kind: i.weapon!.kind ?? '',
        weight: i.weapon!.weight ?? '', missile: i.weapon!.missile === true, ...i.weapon!.intercept ? { intercept: true } : {},
        ...own.includes(id) ? { own: true } : {}, value: i.value ?? 0 }));
  }
  // The armour a calling may wear, in words: "any armour", or the kinds it is trained to.
  // A people's gifts by birth, each with what it does in Kyr ("Keen Senses: +4 to search checks"); a gift Kyr does not
  // do yet is not offered (the creation page had said of each people only what it adds to the rolls).
  private static gifts(id: string): string[] {
    return (Canon.ancestries[id]?.traits ?? []).map(t => Canon.traits[t]).filter((t): t is Trait =>
      t?.category === 'lineage' && !t.unsupported).map(t => `${t.name}: ${this.gift(t)}`);
  }
  private static gift(t: Trait): string {
    const said = /\d/.test(t.description ?? '') && !t.omits ? t.description!.replace(/\.$/, '') : '';
    const bonuses = (t.perks ?? []).flatMap(p => Object.entries(p.bonuses ?? {}).map(([k, n]) =>
      `${n > 0 ? '+' : '−'}${Math.abs(n as number)} to ${(Canon.skills[k]?.name ?? k).toLowerCase()}`));
    return said || [...MechanicsText.modifiers(t.modifiers), ...bonuses].join(', ') || (t.description ?? '').replace(/\.$/, '');
  }
  private static armour(calling: string): string {
    const c = Canon.classes[Canon.resolve('classes', calling)], p = c?.proficiencies.armor;
    if (!p || p.all) { return 'any armour'; }
    const worn = Object.entries(Canon.items).filter(([id, i]) => i.armor && RulesCreation.canEquip(calling, id))
      .map(([, i]) => i.name.toLowerCase());
    return worn.length ? worn.join(', ') : 'no armour';
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
    const file = Scenarios.files[campaign];
    if (!file) { throw new Error(`There is no campaign called ${campaign}.`); }
    const manifest = JSON.parse(file) as Partial<CampaignManifest>;
    const title = manifest.name ?? 'Kyr';
    return { title, pitch: manifest.pitch ?? { heading: title, text: 'Choose three companions.' },
      party: structuredClone(manifest.party ?? Creation.preset('fellowship')), generated: false };
  }
  static preset(id: string): Member[] {
    const companies = (partyExamples as { companies: Catalog['presets'] }).companies;
    return structuredClone((companies.find(c => c.id === id) ?? companies[0]!).members);
  }
  // A region drawn from a seed, with adventures set in it; kept so the company can set out into it.
  async generate(seed: string, terrain?: string, party?: Member[], at: { origin?: string; memorial?: Memorial } = {}):
    Promise<Setting> {
    const world = await WorldAssembler.assemble(seed, Scenarios.source(),
      { ...terrain ? { region: { terrain } } : {}, ...party ? { party } : {}, ...at.origin ? { origin: at.origin } : {},
        ...at.memorial ? { memorial: at.memorial } : {} });
    const campaign = JSON.parse(await world.source.read(world.path)) as CampaignManifest;
    // While the protagonist is chosen, the country is read: it is the same whoever comes into it.
    if (!party) { setTimeout(() => void Creation.warm(world.path, world.source), 200); }
    const title = campaign.name, region = world.report.region;
    const origins = Origins.choices(await Origins.load(Scenarios.source()), region, world.report.placements);
    const names = ProtagonistNames.drawn(region, seed);
    return { title, generated: true, origins, terrain: region.terrain, names,
      pitch: { heading: `Who comes to ${title}?`, text: `${title} is ${Creation.country(region.terrain)} country. `
        + 'You come into it alone, for a reason of your own; whoever goes with you, you will meet on the way.' },
      party: [Creation.protagonist(region.ancestry, seed, names)] };
  }
  // The country first, then what is set in it.
  private static async warm(path: string, source: BundleSource) {
    const campaign = JSON.parse(await source.read(path)) as CampaignManifest;
    const bundles = campaign.modules.flatMap(m => 'bundle' in m ? [String(m.bundle)] : [])
      .sort((a, b) => Number(/\/region\//.test(b)) - Number(/\/region\//.test(a)));
    for (const bundle of bundles) { await ModuleBundle.warm(source.resolve(bundle, path), source); }
  }
  static country(terrain: string): string {
    return ({ marsh: 'fen', forest: 'forest', mountain: 'high', frost: 'cold northern' } as Record<string, string>)[terrain] ?? terrain;
  }
  // Who comes into a drawn country, until the player says otherwise: of its people where they may be a protagonist, a
  // woman or a man as drawn for the country, named as their people name their own (the first of the country's names
  // for them), with six rolls of three dice to place on the qualities (the same for the same country). Every part of
  // them can be changed.
  static protagonist(ancestry: string, seed: string, names: NonNullable<Setting['names']> = {}): Member {
    const playable = (Content.playableRaces as string[]).includes(ancestry) ? ancestry : 'human';
    const pronouns = ProtagonistNames.presenting(seed);
    return { name: names[playable]?.[pronouns]?.[0] ?? 'Wenna', raceId: playable as Member['raceId'], classId: 'warrior',
      pronouns, rolled: Rolls.suited(Content.rolls(seed), Canon.classes.warrior?.attributes ?? {}) };
  }
  // Where a company sets out: an authored campaign from the bundled files, or the generated region drawn again for
  // this company (its backgrounds place old friends in the region).
  async origin(campaign: string, seed: string, party: Member[],
    at: { terrain?: string; origin?: string; memorial?: Memorial } = {}) {
    if (campaign !== Creation.generated) { return { path: campaign, source: Scenarios.source() }; }
    // Its own world, whatever else is being drawn meanwhile (a start made ready in advance, a new country).
    const world = await WorldAssembler.assemble(seed, Scenarios.source(), DrawnWorld.options({ party, ...at }));
    return { path: world.path, source: world.source };
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
