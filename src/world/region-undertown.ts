import text from '../../data/generation/town/undertown.kyrt' with { type: 'text' };
import { KyrTemplates } from './kyr-template';
import { SettlementWriter } from './settlement-writer';
import type { Region, Settlement } from './region-writer';

// What lies under the town the company begins in: an adventure a step from its door, with no journey to make first
// (the owner, 1 November: "we shouldn't have to explore to start an adventuring loop"). What it is, the rooms, the
// troubles, who pays and what they say, is the author's, in data/generation/town/undertown.kyrt; this chooses a
// trouble of each kind for the town, fills in the town, and nails up the notice that gathers what each trouble says
// of itself (the talk of it on the green had been lost under an arrival's news). Read, the notice is an aim for each.
export class RegionUndertown {
  static readonly template = KyrTemplates.parse(text);
  static lines(region: Region, s: Settlement): string[] {
    // Where each who pays is to be found (their own room, or the green), for the aim that says what is owed.
    const t = s.id, q = JSON.stringify, values = { t, town: s.name,
      ...Object.fromEntries((['merchant', 'priest', 'innkeeper'] as const)
        .map(role => [`${role}at`, SettlementWriter.standing(region, s, role)])) };
    const sections = KyrTemplates.choose(this.template, `${region.name}:${t}:undertown`);
    const troubles = sections.filter(x => x.said.length), notice = `${t}_u_notice`;
    const open = troubles.map(x => `able(${t}_u_${x.option})`).join(' or ');
    const said = KyrTemplates.fill([`A notice on the post by the well, in ${troubles.length === 3 ? 'three' : 'several'}`
      + ` hands. ${troubles.flatMap(x => x.said).join(' ')}`], values)[0]!;
    return [...sections.flatMap(x => KyrTemplates.fill(x.lines, values)),
      ...open ? [`  Entity ${notice}: fact ${q(said)}.`,
        `  Observe ${notice}_up at ${t}_green when (${open}) and not knows(party, ${notice})`
          + ` ${q('A notice is nailed to the post by the well, in more than one hand.')}.`,
        `  Action ${notice}_read(actor: group, site: place) "Read the notice on the well-post" {`,
        `    Requires able(actor) and at(actor, site) and at(actor, ${t}_green) and not knows(actor, ${notice})`
          + ` and (${open}).`,
        '    Time 1.', `    On success { Assert knows(actor, ${notice}). }`, `    Result ${q(said)}.`, '  }'] : []];
  }
}
