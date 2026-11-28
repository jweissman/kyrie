import type { Campaign } from '../campaign/campaign';
import { Knowing } from './knowing';
import type { Candidate } from '../ui/promotion';
import type { Offered } from './offer';

// A pile leads in place of its finds (OR-1870, the cold-play review's Wave 2: "collect an unambiguous pile in one act
// and say who carries it"): where two or more of the four would each take up one thing of what lies loose here, the
// one act that gathers it all up stands where the first stood, what it is to the company theirs together (each find's
// aspects and marks), and the others give way to what else the place leads with, none of the pile's finds filling
// the four beside it (held: each stays among the rest). A take the followed aim goes by is its own step, gold, and
// keeps its row.
export class PileLead {
  static readonly take = /^take_item\(([^,)]+)/;
  static of(promoted: Offered[], live: readonly Candidate[], campaign: Campaign | undefined,
    told: (c: Candidate) => Offered): { promoted: Offered[]; held: string[] } {
    const pile = live.find(c => c.command?.startsWith('take_pile('));
    if (!pile || !campaign) { return { promoted, held: [] }; }
    const takes = promoted.filter(o => !o.continues && this.loose(campaign, o.command));
    if (takes.length < 2) { return { promoted, held: [] }; }
    const own = told(pile), led: Offered = { ...own,
      aspects: [...new Set([...own.aspects, ...takes.flatMap(t => t.aspects)])],
      marks: [...own.marks, ...takes.flatMap(t => t.marks)].filter((m, i, all) =>
        all.findIndex(x => JSON.stringify(x) === JSON.stringify(m)) === i) };
    const held = live.flatMap(c => c.command && this.loose(campaign, c.command) ? [c.command] : []);
    return { promoted: promoted.flatMap(o => o === takes[0] ? [led] : takes.includes(o) ? [] : [o]), held };
  }
  // Whether an offered row takes up one thing lying loose where the company stands (data/rules/belongings.kyr).
  private static loose(campaign: Campaign, command?: string): boolean {
    const find = this.take.exec(command ?? '')?.[1];
    return !!find && Knowing.loose(campaign, find);
  }
}
