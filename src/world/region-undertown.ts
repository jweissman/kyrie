import text from '../../data/generation/town/undertown.kyrt' with { type: 'text' };
import { KyrTemplates, type KyrSection } from './kyr-template';
import { Outfitters } from './outfitters';
import { SettlementWriter } from './settlement-writer';
import { DeepPurposes } from './deep/deep-purposes';
import { DeepSites } from './deep/deep-sites';
import { Foundings } from './founding';
import { RegionMarket } from './region-market';
import { StrategicAtlas } from './strategic-atlas';
import type { Region, Settlement, Site } from './region-writer';
import { RegionKey } from './region-key';

// What lies under the town the company begins in: an adventure a step from its door, with no journey to make first
// (the owner, 1 November: "we shouldn't have to explore to start an adventuring loop"). What it is, the rooms, the
// troubles, who pays and what they say, is the author's, in data/generation/town/undertown.kyrt; this chooses a
// trouble of each kind for the town, fills in the town, and nails up the notice that gathers what each trouble says
// of itself (the talk of it on the green had been lost under an arrival's news). Read, the notice is an aim for each.
export class RegionUndertown {
  static readonly template = KyrTemplates.parse(text);
  // fix: an option fixed for a group (see KyrTemplates.choose), by default the country's own (StrategicAtlas.fix).
  static lines(region: Region, s: Settlement, company = 3, fix = StrategicAtlas.fix(region, 'undertown')): string[] {
    // Where each who pays is to be found (their own room, or the green), for the aim that says what is owed; and how
    // many of the first foes a trouble sets, for the company that takes it (M19-87).
    const t = s.id, standing = { merchant: SettlementWriter.standing(region, s, 'merchant'),
      priest: SettlementWriter.standing(region, s, 'priest'), innkeeper: SettlementWriter.standing(region, s, 'innkeeper') };
    const values = { ...this.values(t, s.name, company, standing), ratsbane: this.ratsbane(s) };
    const sections = KyrTemplates.choose(this.template, `${RegionKey.of(region)}:${t}:undertown`, this.lives(region), fix);
    return [...sections.flatMap(x => KyrTemplates.fill(x.lines, values)), ...this.catacombs(region, s),
      ...RegionMarket.home(region, s), ...this.notice(t, sections, values)];
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
      spiders: company > 1 ? 'the spiders' : 'the spider', webbed: company > 1
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
    return KyrTemplates.choose(this.template, `${RegionKey.of(region)}:${s.id}:undertown`, this.lives(region), StrategicAtlas.fix(region, 'undertown'))
      .some(x => x.said.length > 0);
  }
  // The notice on the green that gathers what each trouble chosen says of itself; read, a lead in the Notes, and each
  // job an aim only when the one who gives it is asked (HP-01).
  static notice(t: string, sections: KyrSection[], values: Record<string, string>): string[] {
    const troubles = sections.filter(x => x.said.length), notice = `${t}_u_notice`, q = JSON.stringify;
    const open = troubles.map(x => `able(${t}_u_${x.option})`).join(' or ');
    const said = KyrTemplates.fill([`A notice on the post by the well, in ${troubles.length === 3 ? 'three' : 'several'}`
      + ` hands. ${troubles.flatMap(x => x.said).join(' ')}`], values)[0]!;
    return [...open ? [`  Entity ${notice}: fact ${q(said)}.`,
        // The notice is a thing on the green, found among what is there to look at, not a line of the green's own
        // description (the owner, 7 November: the place had read as a list of objects).
        `  Thing ${notice}_post "the notice on the well-post" at ${t}_green { }`,
        `  Observe ${notice}_up near ${notice}_post of ${notice}_post when (${open}) and not knows(party, ${notice})`
          + ` and not stale(${notice})`
          + ` ${q('A notice is nailed to the post by the well, written over in several hands.')}.`,
        `  Action ${notice}_read(actor: group, site: place) "Read the notice on the well-post" {`,
        `    Requires able(actor) and at(actor, site) and at(actor, ${t}_green) and not knows(actor, ${notice})`
          + ` and (${open}) and not stale(${notice}).`,
        '    Time 1.', `    On success { Assert knows(actor, ${notice}). }`, `    Result ${q(said)}.`, '  }',
        ...this.spent(t, troubles)] : []];
  }
  // Who each job on the notice is asked of (its giver, the one its _job_ask topic is with), and the notice spent
  // (stale) once every job on it is paid, a lead let go from the Notes: it had stayed among them after (FH-05).
  private static spent(t: string, troubles: KyrSection[]): string[] {
    const notice = `${t}_u_notice`, givers = new Set<string>();
    for (const x of troubles) {
      const ask = new RegExp(`Topic \\{t\\}_u_${x.option}_job_ask with \\{t\\}(_\\w+)`);
      const by = x.lines.map(l => ask.exec(l)?.[1]).find(Boolean);
      if (by) { givers.add(`${t}${by}`); }
    }
    const paid = troubles.map(x => `${t}_u_paid(${t}_u_${x.option}_job)`).join(' and ');
    return [...[...givers].map(g => `  Initially Assert askedOf(${notice}, ${g}).`),
      `  Rule ${notice}_spent when ${paid} and not stale(${notice}) { Assert stale(${notice}). }`];
  }
  // Under the vault, behind its keeper's chair, a stair down into what the town was built over: the barrow of the
  // country's first dead, three levels more (the passage-grave, the halls of the dead, the king's grave), written by
  // the deep sites' own generator from what they were for (data/generation/deep/barrow.json), with its keeper, its
  // dead, its treasure and its way out (the owner, 2 November: the catacombs beneath the church at least four levels
  // deep, more fights and treasure than can be carried out in one go).
  private static catacombs(region: Region, s: Settlement): string[] {
    // The barrow's purpose, or, where the country's own deep work is a barrow, the next of the deep purposes it is not.
    const taken = region.sites.find(x => x.work?.deep)?.work?.art;
    const art = ['bone', ...DeepPurposes.order].find(a => a !== taken)!, purpose = DeepPurposes.of(art);
    const history = region.history;
    if (!purpose || !history) { return []; }
    const t = s.id, w = `${t}_ud`, makers = history.makers.find(m => m.art === art) ?? history.makers[0]!;
    const old = makers.self.name ?? makers.epithet, k = history.successors;
    // Called and kinded as what it is: the Delvers' mine under a town had been "the old dead", a barrow (SI-02).
    const name = (purpose.plan.buried ?? 'the old dead under {town}').replace('{town}', s.name);
    const site: Site = { id: w, kind: purpose.plan.kind, name, hours: 0 };
    const values = { w, name: site.name, old, oldup: old.toUpperCase(), land: t, x: '1', y: '8', kingdom: k.name,
      kingdomup: k.name.toUpperCase(), kingdomkind: k.kind, fallen: k.fallen, fate: makers.fate, town: t,
      townname: s.name,
      keeper: `${t}_innkeeper`, priest: `${t}_priest`, merchant: `${t}_merchant`, holy: Foundings.holyPlace(region, s),
      where: `under ${s.name}` };
    // What a site placed in the country has from being placed (see RegionSites): that it is named, and found. It
    // lies within the town, under it, so that going down into it is going in, not a journey across the country.
    const q = JSON.stringify;
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
        + ` toward ${t}_u_undercroft by ${t}_u_yard ${q(`The way down to {${w}_site} is under ${s.name}: below a sealed vault, found from {${t}_u_undercroft},`
        + ` which {${t}_u_crypt} under {${t}_u_yard} goes down to.`)}.`,
      // Past its keeper only: fallen, or sat down by the rite of the door (the undertown's vault), or from below.
      `  Passage ${t}_u_deeper "a narrow stair behind the keeper's chair" is stair between ${t}_u_vault and ${w}`
        + ` opening when not able(${t}_u_keeper) or tolerates(${t}_u_keeper, party) or at(party, ${w})`
        + ` ${q("The keeper of the vault stands between you and its chair, and the stair is behind the chair.")}.`,
      // The keeper fallen, what he kept is the way on down: said, with where it goes.
      `  Objective ${w}_below when not able(${t}_u_keeper) and not been(party, ${w})`
        + ` toward ${w} by ${t}_u_vault ${q(`Behind the keeper's chair in {${t}_u_vault} a narrow stair goes on down, into {${w}_site}.`)}.`,
      // The measures every deep site declares are the country's already when it has one of its own.
      ...DeepSites.lines(region, site, { purpose, values, rivals: false, buried: s.name })
        .filter(l => !(taken && /^\s*Measure deepWater/.test(l)))];
  }
}
