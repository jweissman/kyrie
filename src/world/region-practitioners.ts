import { Communities } from './community/community';
import { RegionOutskirts } from './region-outskirts';
import type { Company, Region } from './region-writer';

// Who in a country practises a craft, and the settlement each lives in, for the assembler's ledger (practises,
// dwells: data/assembly/vocabulary.kyr): every settlement's folk whose work is a craft's (an occupation's `craft`:
// the tinker, at tinkering), and the people the first town's own sections say practise one (">> practises
// {t}_hesper tinkering": data/generation/town/neighbours.kyrt). So a kit of the craft binds someone who already
// lives there, and makes nobody up where there is one (the tinker kit's resident).
export class RegionPractitioners {
  static of(region: Region, company?: Company): { id: string; craft: string; at: string }[] {
    const folk = region.settlements.flatMap(s => Communities.plan(region, s).residents
      .flatMap(r => r.work.craft ? [{ id: r.id, craft: r.work.craft, at: s.id }] : []));
    const home = company && this.home(region, company);
    const own = home ? RegionOutskirts.practitioners(region, home).map(p => ({ ...p, at: home.id })) : [];
    return [...folk, ...own];
  }
  // The town the company begins in, whose own people the outskirts' sections are written for (see RegionWriter.lines).
  static home(region: Region, company: Company) {
    const a = company.start?.approach;
    return region.settlements.find(t => t.id === (a?.settlement ?? /^(s\d+)_/.exec(company.start?.place ?? '')?.[1]))
      ?? region.settlements[0]!;
  }
}
