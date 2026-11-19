import type { Campaign } from '../campaign/campaign';
import type { Screen } from '../ui/screen-types';
import type { CompanyRecall } from './company-recall';

// Whom the company has met (spoken with, or answered by; its family), or has by name in the words of an aim it holds
// (Bran, in the drove's; Gek, once the notice sends it to her for the key): anyone else here is led as talking to them,
// the question after it (see Doable.called; the lead's ruling on cold plays 4 and 5, CL-45 and CL-36).
export class Acquainted {
  // Those spoken with (talked), and those known (known).
  static of(campaign: Campaign, screen: Screen, recall: CompanyRecall): { talked: Set<string>; known: Set<string> } {
    const aims = (screen.aims ?? []).map(a => a.text).join(' '), kin = this.kin(campaign);
    const talked = new Set(screen.people.map(p => p.id).filter(id => recall.talkedTo(id)));
    return { talked, known: new Set(screen.people.filter(p => talked.has(p.id) || kin.has(p.id)
      || this.calls(aims, p.name.split(',')[0]!)).map(p => p.id)) };
  }
  // The company's family (kin(company, someone); kinship(someone, how)), as Stakes reads it.
  private static kin(campaign: Campaign): Set<string> {
    const w = campaign.world;
    return new Set(['kinship', 'kin'].filter(n => w.relates(n))
      .flatMap(n => w.related(n).map(r => n === 'kin' ? r.args[1]! : r.args[0]!)));
  }
  // Whether words name someone, by what they are called or by a name of theirs ("Bran", of Bran ap Ifor).
  private static calls(words: string, called: string): boolean {
    return words.includes(called) || called.split(' ').some(w => /^[A-Z][a-z]+$/.test(w)
      && new RegExp(`\\b${w}\\b`).test(words));
  }
}
