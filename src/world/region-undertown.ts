import text from '../../data/generation/town/undertown.kyrt' with { type: 'text' };
import { KyrTemplates } from './kyr-template';
import { SettlementWriter } from './settlement-writer';
import { DeepPurposes } from './deep/deep-purposes';
import { DeepSites } from './deep/deep-sites';
import { Foundings } from './founding';
import { RegionMarket } from './region-market';
import type { Region, Settlement, Site } from './region-writer';

// What lies under the town the company begins in: an adventure a step from its door, with no journey to make first
// (the owner, 1 November: "we shouldn't have to explore to start an adventuring loop"). What it is, the rooms, the
// troubles, who pays and what they say, is the author's, in data/generation/town/undertown.kyrt; this chooses a
// trouble of each kind for the town, fills in the town, and nails up the notice that gathers what each trouble says
// of itself (the talk of it on the green had been lost under an arrival's news). Read, the notice is an aim for each.
export class RegionUndertown {
  static readonly template = KyrTemplates.parse(text);
  static lines(region: Region, s: Settlement, company = 3): string[] {
    // Where each who pays is to be found (their own room, or the green), for the aim that says what is owed; and how
    // many of the first foes a trouble sets, for the company that takes it (M19-87).
    const t = s.id, q = JSON.stringify, values = { t, town: s.name, brood: company > 1 ? '2' : '1',
      ...Object.fromEntries((['merchant', 'priest', 'innkeeper'] as const)
        .map(role => [`${role}at`, SettlementWriter.standing(region, s, role)])) };
    const sections = KyrTemplates.choose(this.template, `${region.name}:${t}:undertown`);
    const troubles = sections.filter(x => x.said.length), notice = `${t}_u_notice`;
    const open = troubles.map(x => `able(${t}_u_${x.option})`).join(' or ');
    const said = KyrTemplates.fill([`A notice on the post by the well, in ${troubles.length === 3 ? 'three' : 'several'}`
      + ` hands. ${troubles.flatMap(x => x.said).join(' ')}`], values)[0]!;
    return [...sections.flatMap(x => KyrTemplates.fill(x.lines, values)), ...this.catacombs(region, s),
      ...RegionMarket.home(region, s),
      ...open ? [`  Entity ${notice}: fact ${q(said)}.`,
        // The notice is a thing on the green, found among what is there to look at, not a line of the green's own
        // description (the owner, 7 November: the place had read as a list of objects).
        `  Thing ${notice}_post "the notice on the well-post" at ${t}_green { }`,
        `  Observe ${notice}_up near ${notice}_post of ${notice}_post when (${open}) and not knows(party, ${notice})`
          + ` ${q('Paper nailed to the post by the well, written over in several hands.')}.`,
        `  Action ${notice}_read(actor: group, site: place) "Read the notice on the well-post" {`,
        `    Requires able(actor) and at(actor, site) and at(actor, ${t}_green) and not knows(actor, ${notice})`
          + ` and (${open}).`,
        '    Time 1.', `    On success { Assert knows(actor, ${notice}). }`, `    Result ${q(said)}.`, '  }'] : []];
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
    const site: Site = { id: w, kind: 'barrow', name: `the old dead under ${s.name}`, hours: 0 };
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
      `  Place ${w} "the stair below the vault" is room within ${t} at 1, 7 underground.`,
      `  Initially Assert unlit(${w}).`,
      // What it is for comes before the way to it is known (the crown, heard of at the inn): the next thing to find is
      // said, and where, so that the aim leads somewhere (the product-design review's PD-03: "a barrow, not yet made
      // out", and nothing to say the way was down through the town).
      `  Objective ${w}_way when knows(party, ${w}_story) and not ${w}_raised() and not knows(party, ${t}_u_vault_found)`
        + ` ${q(`The way down to {${w}_site} is under ${s.name}: below a sealed vault, found from {${t}_u_undercroft},`
        + ` which {${t}_u_crypt} under {${t}_u_yard} goes down to.`)}.`,
      `  Passage ${t}_u_deeper "a narrow stair behind the keeper's chair" is stair between ${t}_u_vault and ${w}.`,
      // The keeper fallen, what he kept is the way on down: said, with where it goes.
      `  Objective ${w}_below when not able(${t}_u_keeper) and not been(party, ${w})`
        + ` ${q(`Behind the keeper's chair in {${t}_u_vault} a narrow stair goes on down, into {${w}_site}.`)}.`,
      // The measures every deep site declares are the country's already when it has one of its own.
      ...DeepSites.lines(region, site, { purpose, values, rivals: false, buried: s.name })
        .filter(l => !(taken && /^\s*Measure deepWater/.test(l)))];
  }
}
