// The false-promise corpus (S3-2; planning-report.md §8 step 2): each case a cold play's own finding where what the
// page showed promised what the world then did not do, kept with its state, its signal, the act, the result and the
// contract it broke (test/fixtures/promises/corpus.json), and a check of that contract made on every turn of the cold
// play's own lines replayed on today's engine (scripts/promise-fidelity.ts --corpus). A case is still broken where its
// check fails on a turn of its play, with the turn; else it is not seen (fixed, or its moment not come to as the
// replay went, which the replay's refused lines say).
import type { Offered, Said } from '../src/cli/runner';

export interface PromiseCase { id: string; play: string; source: string; state: string; signal: string; act: string;
  result: string; contract: string; check: Check }
export type Check = 'talk-does-talk' | 'purse-as-said' | 'arrive-as-labelled' | 'dark-no-seeing' | 'talk-says-something'
  | 'named-before-asked';
// One turn: the scene before, the row taken (where the line took one the scene offered), the scene after, and every
// line said so far (for what has been named).
export interface Turn { before: Said; chosen?: Offered; after: Said; heard: string }

export class PromiseCorpus {
  // Someone asked by their title: "Ask the factor about …", "Talk to the Guldríce agent — …".
  static readonly titled = /^(?:Ask|Talk to) the ([a-zà-ÿ' -]+?)(?: about| —| for| what| whether| how|$)/i;
  // The lines a scene says of itself, not its references (what is followed, needed, carried).
  // A heading (the place · the day) stands first only where the scene says where it is; an act's outcome has none.
  static told(s: Said): string[] {
    return s.scene.lines.filter((l, i) => !(i === 0 && / · \d{1,2} [A-Z]/.test(l)))
      .filter(l => !/^(Following|Need|Provisions|Purse|Carrying|Aim):/.test(l)).map(l => l.replace(/[‘’]/g, "'"));
  }
  // Whether the turn breaks the contract, and how, in words; nothing where it keeps it or does not bear on it.
  static broken(check: Check, t: Turn): string | undefined {
    const c = t.chosen, after = t.after;
    switch (check) {
      // A row that says Talk to someone talks to them: it does not sell or buy (cold play 2's 7).
      case 'talk-does-talk':
        return c && /^Talk to /.test(c.label) && /^(sell|buy|buy_item|sell_item)\(/.test(c.does ?? '')
          ? `"${c.label}" does ${c.does}` : undefined;
      // Coin said to be counted out is coin in the purse (cold play 5's 30: "counts out eight silver", the purse
      // unchanged).
      case 'purse-as-said': {
        const said = this.told(after)
          .find(l => /\b(counts? out|counted out|coin are yours|crowns, counted)\b/i.test(l));
        const gained = (after.purse?.coin ?? 0) - (t.before.purse?.coin ?? 0);
        return said && gained <= 0 ? `"${said.slice(0, 80)}" and the purse ${gained >= 0 ? 'unchanged' : 'less'}`
          : undefined;
      }
      // A row that says To somewhere comes there (cold play 5's 34: "To the great hall", come to the forecourt).
      case 'arrive-as-labelled': {
        const to = c && /^To (the |a |an )?(.+)$/.exec(c.label)?.[2];
        const heading = after.scene.lines[0]?.split(' · ')[0]?.toLowerCase() ?? '';
        return to && after.moment !== 'fight' && c?.type === 'go' && !heading.includes(to.toLowerCase())
          ? `"${c.label}" came to "${heading}"` : undefined;
      }
      // Pitch dark, with nothing to see by, offers nothing that needs seeing (cold play 4's 19).
      case 'dark-no-seeing': {
        const dark = this.told(after).some(l => /pitch dark/i.test(l) && /nothing that needs seeing/.test(l));
        const seen = after.offer.primary.find(o => /^(Search here|Look closely at|Read )/.test(o.label));
        return dark && seen ? `pitch dark, and "${seen.label}" led` : undefined;
      }
      // Talking to someone says something (cold play 5's 35, cold play 6's 11: "Talk to" printed no line).
      case 'talk-says-something':
        return c && /^talk_to\(/.test(c.does ?? c.id) && after.moment !== 'fight' && !this.told(after).length
          ? `"${c.label}" said nothing` : undefined;
      // Someone asked by their title has been met or spoken of first (cold play 4's 4, 6's 5, 8's T1: "Ask the factor
      // about the king-barrow" led before any factor was named).
      case 'named-before-asked': {
        const asked = t.before.offer.primary.map(o => ({ o, who: PromiseCorpus.titled.exec(o.label)?.[1] }))
          .find(x => x.who && !t.heard.toLowerCase().includes(x.who.toLowerCase()));
        return asked ? `"${asked.o.label}" led before any ${asked.who} was named` : undefined;
      }
    }
  }
}
