import text from '../../data/generation/town/undertown.kyrt' with { type: 'text' };
import { KyrTemplates, type KyrSection } from './kyr-template';
import { ModuleSource } from './kyr-values';
import { Outfitters } from './outfitters';
import { SettlementWriter } from './settlement-writer';
import { DeepPurposes } from './deep/deep-purposes';
import { DeepSites } from './deep/deep-sites';
import { Foundings } from './founding';
import { RegionMarket } from './region-market';
import { StrategicAtlas } from './strategic-atlas';
import type { Region, Settlement, Site } from './region-writer';
import { RegionKey } from './region-key';
import { FamilyNames } from './family-names';
import { StoryPeople } from './story-people';
import below from '../../data/generation/town/below.kyrt' with { type: 'text' };
import folk from '../../data/generation/scenes/folk.json';
import { RegionRecruits } from './region-recruits';
import { Draw } from './land/draw';
import { Communities } from './community/community';
import { ReferenceSettlement } from './reference-settlement';
import { RegionWoods } from './region-woods';
import { WoodsCounsel } from './deep/woods-counsel';
import { RegionWeather } from './region-weather';

// What lies under the town the company begins in: an adventure a step from its door, with no journey to make first
// (the owner, 1 November: "we shouldn't have to explore to start an adventuring loop"). What it is, the rooms, the
// troubles, who pays and what they say, is the author's, in data/generation/town/undertown.kyrt; this chooses a
// trouble of each kind for the town, fills in the town, and nails up the notice that gathers what each trouble says
// of itself (the talk of it on the green had been lost under an arrival's news). Read, the notice is an aim for each.
export class RegionUndertown {
  static readonly template = KyrTemplates.parse(text);
  // fix: an option fixed for a group (see KyrTemplates.choose), by default the country's own (StrategicAtlas.fix).
  static lines(region: Region, s: Settlement, company = 3, fix = StrategicAtlas.fix(region, 'undertown')): string[] {
    // The reference game's town has no troubles under it, nor a notice of them: its old woods, and under them the deep
    // place, found there (see RegionWoods).
    if (ReferenceSettlement.is(region, s)) { return this.catacombs(region, s); }
    // Where each who pays is to be found (their own room, or the green), for the aim that says what is owed; and how
    // many of the first foes a trouble sets, for the company that takes it (M19-87).
    const t = s.id, standing = { merchant: SettlementWriter.standing(region, s, 'merchant'),
      priest: SettlementWriter.standing(region, s, 'priest'), innkeeper: SettlementWriter.standing(region, s, 'innkeeper') };
    const sections = KyrTemplates.choose(this.template, `${RegionKey.of(region)}:${t}:undertown`, this.lives(region), fix);
    const values = { ...this.values(t, s.name, company, standing), ratsbane: this.ratsbane(s),
      ...sections.some(x => x.group === 'hand') ? this.hand(region, t) : {} };
    return [...sections.flatMap(x => KyrTemplates.declared(x.lines, values, 'undertown')), ...this.catacombs(region, s),
      ...RegionMarket.home(region, s), ...this.notice(t, sections, values)];
  }
  // The name of whoever on the green would come along (OR-304: a joiner had been "the drover's lad" and nothing more),
  // of the town's people and drawn by the town alone, apart from the names the country's people have: {handhe} or
  // {handshe}, as the one drawn presents.
  static hand(region: Region, t: string): Record<'handhe' | 'handshe', string> {
    return this.named(`${RegionKey.of(region)}:${t}:hand`, StoryPeople.country(region));
  }
  // The names, drawn by a key alone (a laboratory's town has no country: scripts/laboratory.ts).
  static named(key: string, taken: string[] = []): Record<'handhe' | 'handshe', string> {
    const [he, she] = ['he', 'she'].map(as => FamilyNames.household({ key, people: 'human', roster: `${as}:hand`,
      taken }).hand!);
    return { handhe: he!, handshe: she! };
  }
  // How the company's life began, for the sections drawn only for one (who is on the green: "if fromdrove").
  static lives(region: Region): Record<string, string> { return region.origin ? { [`from${region.origin}`]: 'yes' } : {}; }
  // The values a town's undertown is written with (see lines): its id and name, how many of each foe for a company
  // of so many, and where each who pays stands.
  static values(t: string, town: string, company: number, standing: Record<'merchant' | 'priest' | 'innkeeper', string>)
    : Record<string, string> {
    return { t, town, brood: company > 1 ? '2' : '1',
      // A pack of the small kind, and a pair of the middling: never one rat called the rats (the owner, 8 November).
      // A lone company's pack is two: three rats killed a lone first-level mage two times in three, the first job's
      // very fight (the owner, 15 November: "I died"; 33 % won against three, 65 % against two).
      pack: company > 1 ? '5' : '2', pair: company > 1 ? '3' : '2', runts: company > 1 ? '' : ' Variant runt.',
      // And what the merchant says of them: "a whole nest" had been two rats of one hit point (cold play 5, CL-37).
      nestof: company > 1 ? 'a whole nest of them' : 'a couple of them at the least',
      // Nor one spider called the spiders (review A's "the spiders in the old workings lies dead").
      spiders: company > 1 ? 'the spiders' : 'the spider',
      // Nor one bone-picker called the bone-pickers (the yard's second cause).
      wolves: company > 1 ? 'the wolves' : 'the wolf', wolfrole: company > 1 ? 'lean wolves that follow'
        : 'a lean wolf that follows',
      pickers: company > 1 ? 'the bone-pickers' : 'the bone-picker', picker: company > 1
        ? 'grey things from below the charnel stairs that eat' : 'a grey thing from below the charnel stairs that eats',
      webbed: company > 1
        ? 'cave spiders the size of dogs, that have' : 'a cave spider the size of a dog, that has',
      merchantat: standing.merchant, priestat: standing.priest, innkeeperat: standing.innkeeper };
  }
  // What the merchant says of ratsbane for the corn-store's rats, by where it is had in the town: their own shelf,
  // the chandlery's, or nowhere, when nothing is said of it (cold play 5's 12: "lay ratsbane… It wants a night", with
  // none to be had in a town whose merchant did not keep it).
  static ratsbane(s: Settlement): string {
    if (this.bane(SettlementWriter.trade(s).stock)) {
      return " And, looking you over: 'I've ratsbane on the shelf, if you'd sooner not be bitten. Lay it where they "
        + "come up. It wants a night.'";
    }
    if (Outfitters.needed(s) && this.bane(Outfitters.kit)) {
      return " And, looking you over: 'Or there's ratsbane at the chandler's, if you'd sooner not be bitten. It wants a night.'";
    }
    return '';
  }
  private static bane(stock: [string, number, number][]): boolean { return stock.some(([what]) => what === 'ratsbane'); }
  // Whether the town has a notice of its troubles on the green (see notice): one of its troubles says itself there.
  static noticed(region: Region, s: Settlement): boolean {
    return !ReferenceSettlement.is(region, s) && KyrTemplates.choose(this.template, `${RegionKey.of(region)}:${s.id}:undertown`, this.lives(region), StrategicAtlas.fix(region, 'undertown'))
      .some(x => x.said.length > 0);
  }
  // The notice on the green that gathers what each trouble chosen says of itself; read, a lead in the Notes, and each
  // job an aim only when the one who gives it is asked (HP-01).
  static notice(t: string, sections: KyrSection[], values: Record<string, string>): string[] {
    const troubles = sections.filter(x => x.said.length), notice = `${t}_u_notice`, q = JSON.stringify;
    const givers = this.givers(t, troubles);
    const open = troubles.map(x => `able(${t}_u_${x.option})`).join(' or ');
    const said = KyrTemplates.fill([`A notice on the post by the well, in ${troubles.length === 3 ? 'three' : 'several'}`
      + ` hands. ${troubles.flatMap(x => x.said).join(' ')}`], values)[0]!;
    return [...open ? [`  Entity ${notice}: fact ${q(said)}.`,
        // The notice is a thing on the green, found among what is there to look at, not a line of the green's own
        // description (the owner, 7 November: the place had read as a list of objects).
        `  Thing ${notice}_post "the notice on the well-post" at ${t}_green { }`,
        // A sign while unread: the first dungeon's invitation, led as soon as no held aim leads (the coordinator's
        // call, 24 November, on OR-370 and the owner's "unmistakable" first dungeon).
        `  Observe ${notice}_up near ${notice}_post of ${notice}_post as sign when (${open}) and not knows(party, ${notice})`
          + ` and not stale(${notice})`
          + ` ${q('A notice is nailed to the post by the well, written over in several hands.')}.`,
        `  Action ${notice}_read(actor: group, site: place) "Read the notice on the well-post" {`,
        `    Requires able(actor) and at(actor, site) and at(actor, ${t}_green) and not knows(actor, ${notice})`
          + ` and (${open}) and not stale(${notice}).`,
        // Read, it has told the company what the matter is with each who gives a job on it: their troubles can be
        // asked of them (OR-423), as if they had said it themselves.
        '    Time 1.', `    On success { Assert knows(actor, ${notice}).${givers.map(g => ` Assert toldMatter(${g}, actor).`)
          .join('')} }`, `    Result ${q(said)}.`, '  }',
        ...this.spent(t, troubles, givers)] : []];
  }
  // Who each job on the notice is asked of: its giver, the one its _job_ask topic is with.
  private static givers(t: string, troubles: KyrSection[]): string[] {
    const givers = new Set<string>();
    for (const x of troubles) {
      const ask = new RegExp(`Topic \\{t\\}_u_${x.option}_job_ask with \\{t\\}(_\\w+)`);
      const by = x.lines.map(l => ask.exec(l)?.[1]).find(Boolean);
      if (by) { givers.add(`${t}${by}`); }
    }
    return [...givers];
  }
  // The notice a lead asked of its givers, and spent (stale) once every job on it is paid, a lead let go from the
  // Notes: it had stayed among them after (FH-05).
  private static spent(t: string, troubles: KyrSection[], givers: string[]): string[] {
    const notice = `${t}_u_notice`;
    const paid = troubles.map(x => `${t}_u_paid(${t}_u_${x.option}_job)`).join(' and ');
    return [...givers.map(g => `  Initially Assert askedOf(${notice}, ${g}).`),
      `  Rule ${notice}_spent when ${paid} and not stale(${notice}) { Assert stale(${notice}). }`];
  }
  // Under the vault, behind its keeper's chair, a stair down into what the town was built over: the barrow of the
  // country's first dead, three levels more (the passage-grave, the halls of the dead, the king's grave), written by
  // the deep sites' own generator from what they were for (data/generation/deep/barrow.json), with its keeper, its
  // dead, its treasure and its way out (the owner, 2 November: the catacombs beneath the church at least four levels
  // deep, more fights and treasure than can be carried out in one go).
  // What the town is built over: the barrow's purpose, or, where the country's own deep work is a barrow, the next of
  // the deep purposes it is not.
  static art(region: Region): string {
    const taken = region.sites.find(x => x.work?.deep)?.work?.art;
    return ['bone', ...DeepPurposes.order].find(a => a !== taken)!;
  }
  // The makers of what the town is built over (or the woods beside it are), as the country's history has them.
  static makers(region: Region): NonNullable<Region['history']>['makers'][number] {
    const art = this.art(region), history = region.history!;
    return history.makers.find(m => m.art === art) ?? history.makers[0]!;
  }
  // What the deep place is called: called and kinded as what it is (the Delvers' mine under a town had been "the old
  // dead", a barrow: SI-02), under the old woods where the town is the reference game's.
  static called(region: Region, s: Settlement): string {
    const plan = DeepPurposes.of(this.art(region))?.plan;
    return (ReferenceSettlement.is(region, s) ? plan?.wooded ?? 'the old dead under the old woods'
      : plan?.buried ?? 'the old dead under {town}').replace('{town}', s.name);
  }
  private static catacombs(region: Region, s: Settlement): string[] {
    const art = this.art(region), purpose = DeepPurposes.of(art), taken = region.sites.find(x => x.work?.deep);
    const history = region.history;
    if (!purpose || !history) { return []; }
    const t = s.id, w = `${t}_ud`, makers = this.makers(region);
    const old = makers.self.name ?? makers.epithet, k = history.successors;
    const wooded = ReferenceSettlement.is(region, s), name = this.called(region, s);
    const site: Site = { id: w, kind: purpose.plan.kind, name, hours: 0 };
    // Under the old woods, the makers' marks at its door, read, tell who they were (the brothers' errand there).
    const marked: Record<string, string> = wooded ? { makersfact: `history_${makers.art}`, craft: makers.craft,
      belief: makers.belief, heard: `knows(actor, ${t}_wood_door)` } : {};
    const values = { w, name: site.name, old, oldup: old.toUpperCase(), land: t, x: '1', y: '8', kingdom: k.name,
      ...marked,
      kingdomup: k.name.toUpperCase(), kingdomkind: k.kind, fallen: k.fallen, fate: makers.fate, town: t,
      townname: s.name,
      keeper: `${t}_innkeeper`, priest: `${t}_priest`, merchant: `${t}_merchant`, holy: Foundings.holyPlace(region, s),
      where: ReferenceSettlement.is(region, s) ? `under the old woods above ${s.name}` : `under ${s.name}`, keeperat: SettlementWriter.standing(region, s, 'innkeeper') };
    // What a site placed in the country has from being placed (see RegionSites): that it is named, and found. It
    // lies within the town, under it, so that going down into it is going in, not a journey across the country.
    const deep = DeepSites.lines(region, site, { purpose, values, rivals: false, buried: s.name, wooded })
      .filter(l => !(taken && /^\s*Measure deepWater/.test(ModuleSource.text([l])[0]!)));
    return [...wooded ? RegionWoods.lines(s, { w, site: site.name, old,
      ...region.calendar ? { sky: RegionWeather.kinds(region, region.calendar) } : {} })
      : this.vaulted(s, { w, site: site.name }),
      // The measures every deep site declares are the country's already when it has one of its own.
      ...deep,
      // What the shrine-keeper can say of each depth below the first, once the company has been above it.
      ...wooded ? WoodsCounsel.lines({ t, w, priest: `${t}_priest` }, ModuleSource.text(deep), x => DeepSites.defenses(x))
        : [],
      ...this.below(region, s, { w, site: site.name })];
  }
  // The way down from the vault under the town, past its keeper (the undertown's own: see catacombs).
  private static vaulted(s: Settlement, at: { w: string; site: string }): string[] {
    const q = JSON.stringify, t = s.id, w = at.w, site = { name: at.site };
    return [`  Entity ${w}_named: fact ${q(`Below the vault under ${s.name} a stair goes on down, into ${site.name}.`)}.`,
      `  Entity ${w}_found: fact ${q(`The way down into ${site.name} is behind the keeper's chair in the vault.`)}.`,
      `  Place ${w} "the stair below the vault" is room within ${t} at 1, 7 underground 4 down.`,
      `  Initially Assert unlit(${w}).`,
      // The one sight of awe at the bottom of the first hour's under-the-town (doc/design/first-hour-beats.md, 15–35
      // minutes): a vast old place under a small town, told once, the first time the company comes out on the stair,
      // and nothing to fight there.
      `  Relation ${w}_beheld(group).`,
      `  Rule ${w}_awe heard at ${w} when at(party, ${w}) and not ${w}_beheld(party) says ${q(`The stair comes out on a ledge, and your light goes out into nothing. Below you is a hall that could hold the whole of ${s.name}, its pillars going down further than the light does, and far down water lies still. Those who dug the cellars of ${s.name} did not know it was here.`)} { Assert ${w}_beheld(party). }`,
      // What it is for comes before the way to it is known (the crown, heard of at the inn): the next thing to find is
      // said, and where, so that the aim leads somewhere (the product-design review's PD-03: "a barrow, not yet made
      // out", and nothing to say the way was down through the town).
      `  Objective ${w}_way when knows(party, ${w}_story) and not ${w}_raised() and not knows(party, ${t}_u_vault_found)`
        + ` toward ${t}_u_undercroft by ${t}_u_yard ${q(`The way down to {${w}_site} is below a sealed vault, found from`
        // Not "is under {town}" of a site named under it, nor a chain of clauses (OR-248: "The way down to the old
        // workings under Gatesend is under Gatesend: below a sealed vault, …, which the crypt … goes down to").
        + ` {${t}_u_undercroft}: go down to it by {${t}_u_crypt} under {${t}_u_yard}.`)}.`,
      // Past its keeper only: fallen, or sat down by the rite of the door (the undertown's vault), or from below.
      `  Passage ${t}_u_deeper "a narrow stair behind the keeper's chair" is stair between ${t}_u_vault and ${w}`
        + ` opening when not able(${t}_u_keeper) or tolerates(${t}_u_keeper, party) or at(party, ${w})`
        + ` ${q("The keeper of the vault stands between you and its chair, and the stair is behind the chair.")}.`,
      // The keeper fallen, what he kept is the way on down: said, with where it goes.
      `  Objective ${w}_below when not able(${t}_u_keeper) and not been(party, ${w})`
        + ` toward ${w} by ${t}_u_vault ${q(`Behind the keeper's chair in {${t}_u_vault} a narrow stair goes on down, into {${w}_site}.`)}.`,
    ];
  }
  static readonly ledge = KyrTemplates.parse(below);
  // The stair below the vault made ready to go on from (data/generation/town/below.kyrt): what an earlier party left
  // on its ledge, and someone waiting there who would come down for a fee (OR-311).
  private static below(region: Region, s: Settlement, at: { w: string; site: string }): string[] {
    const key = `${RegionKey.of(region)}:${s.id}:below`, draw = new Draw(key), ancestry = s.folk ?? region.ancestry;
    const pronoun = draw.pick(['she', 'he']), given = folk.given as unknown as Record<string, Record<string, string[]>>;
    const name = Communities.distinct((given[ancestry] ?? given.human!)[pronoun] ?? given.human!.she!, ancestry,
      // Apart from every name the country's people have, its stories' and the hand on the green's too (as OR-304's
      // captive is): the one on the ledge had drawn a name a story's person or another of the town already had.
      { draw, taken: new Set([...Communities.everyone(region), ...StoryPeople.country(region),
        ...Object.values(this.hand(region, s.id))]), reserved: region.reserved });
    const calling = RegionRecruits.fighting(ancestry);
    const values = { w: at.w, site: at.site, name, he: pronoun, his: pronoun === 'she' ? 'her' : 'his',
      him: pronoun === 'she' ? 'her' : 'him', calling, fee: '6', town: s.name, folk: ancestry };
    return KyrTemplates.choose(this.ledge, key).flatMap(x => KyrTemplates.declared(x.lines, values, 'undertown below'));
  }
}
