import type { Candidate } from '../ui/promotion';
import { SceneBudget, type BudgetLine, type Budgeted } from './scene-budget';
import type { Screen } from '../ui/screen-types';

// The company's charge at the opening (doc/design/first-hour-beats.md, 0–30 s, "the image and the wrong"): the first
// turn tells only the incident, what the company has come into and has in its hands, and leads only with what answers
// it. The charge is the origin's own (origin__…) and the first aim's installation (the held drove's drove__…), by the
// ids the world declares, never by the words: Bran taken, the tally-stick at your feet, Owain, the customs-house door.
// Everything else on the first place (the town's notices, its salter, the boat-builder, the tinker, the pump) is the
// place's, kept for the second turn or a deliberate look. Cold play 9's first turn had told 27 lines and led with the
// tinker's daughter beside Owain; cold play 4's "the opening hides its own situation".
export class Charge {
  static readonly origin = 'origin'; static readonly arrival = 'origin__arrival';
  static readonly meeting = 'origin__meeting';
  // The opening is the game before anything is done in it: a page drawn without what was last done (serve's, a look)
  // is not one.
  static opening(campaign: { history: readonly unknown[] }): boolean { return !campaign.history.length; }
  // The installations the charge is: the origin's, and the first aim's, where the origin brings the company into a
  // situation of the world's own (the held drove); none where the first aim is the origin's or the country's (kite's
  // road home), nor where the opening is a meeting on the road (kite's carter), told as the opening's pages tell it.
  static of(screen: Screen): ReadonlySet<string> {
    const first = screen.aims?.[0]?.id.split('__')[0];
    // An origin to tell it by (a campaign or a small world of one module has none), and no meeting on the road.
    const met = screen.observed.some(o => o.id === Charge.meeting)
      || !screen.observed.some(o => o.id.startsWith(`${Charge.origin}__`));
    const situated = !met && !!first && first !== screen.aims?.[0]?.id && ![Charge.origin, 'region'].includes(first);
    return new Set(situated ? [Charge.origin, first] : []);
  }
  // Whether an observation, a thing, a person or an act (by any id it names) is the charge's.
  static holds(id: string | undefined, charge: ReadonlySet<string>): boolean {
    return !!id && [...id.matchAll(/([A-Za-z0-9]+)__/g)].some(m => charge.has(m[1]!));
  }
  // What the opening tells and what it keeps for later, in order; all of it where none is the charge's (an authored
  // campaign with no origin), so a place is never told empty.
  static split<T extends { id: string }>(lines: T[], charge: ReadonlySet<string>): { told: T[]; kept: T[] } {
    const told = lines.filter(l => Charge.holds(l.id, charge));
    return told.length ? { told, kept: lines.filter(l => !told.includes(l)) } : { told: lines, kept: [] };
  }
  // The opening's glance: the charge's paragraphs, told whole, not held to the glance's three sentences (the incident
  // had been cut to "Porthalen came at first light", the rest held), and no one else's doings; the rest of the place
  // held for a look, after what the budget holds. Undefined where all of it is the charge's.
  static first(at: { campaign: { history: readonly unknown[] }; told?: unknown; screen: Screen },
    lines: { id: string; text: string }[], presence: string[],
    paragraphs: (lines: { id: string; text: string }[]) => { text: string }[]): Opening | undefined {
    if (at.told || !Charge.opening(at.campaign)) { return undefined; }
    const screen = at.screen, { told, kept } = Charge.split(lines, Charge.of(screen));
    if (!kept.length) { return undefined; }
    // Why the company came before how it came in, as the opening's pages tell them (see Prologue).
    told.sort((a, b) => Charge.rank(a.id) - Charge.rank(b.id));
    // Of who and what is about, only the charge's (the stick on the cobbles, Owain watching the door).
    const ours = new Set(screen.observed.filter(o => Charge.holds(o.id, Charge.of(screen))).map(o => o.text));
    const near = presence.filter(p => ours.has(p));
    // Each told whole, as a clue is (a bearing, in the budget's words).
    const said = [...paragraphs(told).map(p => p.text), ...near].map((text): BudgetLine => ({ text, kind: 'bearing' }));
    return { budget: SceneBudget.compose(said, 0),
      later: [...paragraphs(kept).map(p => p.text), ...presence.filter(p => !near.includes(p))] };
  }
  // Each thing to do once among the four at the opening: the aim's follow and the talk it leads to had both said "Ask
  // Owain how many head came down". The follow, which carries the aim, is kept.
  static once<A extends { choice: string; label: string; for?: string; words?: Record<string, string> }>(acts: A[],
    opening: boolean): A[] {
    if (!opening) { return acts; }
    const followed = new Set(acts.filter(a => a.choice.startsWith('follow:')).map(a => a.label));
    return acts.filter(a => a.choice.startsWith('follow:')
      || !followed.has(a.for && a.words?.[a.for] ? a.words[a.for]! : a.label));
  }
  private static rank(id: string): number {
    return id === Charge.arrival ? 1 : id.startsWith(`${Charge.origin}__`) ? 0 : 2;
  }
  static held<G extends { held: string[] }>(glanced: G, first: Opening | undefined): G {
    return first ? { ...glanced, held: [...glanced.held, ...first.later] } : glanced;
  }
  // What the opening leads with: only what answers the charge (the stick, Owain, the customs-house), where any does.
  // One way among them, the first the charge names (the customs-house, not the pens as well): the rest of the town's
  // ways are the second turn's. What the incident puts in the company's hands (the tally-stick at your feet) is named
  // by it, and led with as what the charge names, though nothing else would lead with it.
  static acts(cands: Candidate[], screen: Screen, opening: boolean): Candidate[] {
    if (!opening) { return cands; }
    const charge = Charge.of(screen);
    const ours = cands.filter(c => [c.choice, c.command, c.subject].some(id => Charge.holds(id, charge)));
    const way = ours.find(c => c.exit);
    return ours.length ? ours.filter(c => !c.exit || c === way)
      .map(c => c.whys.length || !Charge.holds(c.subject, new Set([Charge.origin])) ? c
        : { ...c, whys: ['named' as const] }) : cands;
  }
}
interface Opening { budget: Budgeted; later: string[] }
