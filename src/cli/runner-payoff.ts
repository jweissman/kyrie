import type { Campaign } from '../campaign/campaign';
import type { CampaignEvent } from '../campaign/campaign-types';
import { ModuleWriter } from '../lang/module-writer';

// What an act changed of the world beyond time and position (the event's own changes, as the engine diffs them), and
// whether what it made of a relationship or a fact still holds when the company comes back where it was made: the
// experience measures' payoff (the owner, 15 November). Instruments only: nothing here is said to a player.
export class RunnerPayoff {
  // Not where the company is, nor the clock, nor what it has seen and been to: those change with any step.
  private static readonly motion =
    /^[+-] (at|stoodAt|been|visited|seen|searched|noticed|clock|elapsed|minute|hour|day|time|turn)\(/;
  // A bond or a standing (grateful, friend, tolerates, trusts…) or a fact learned.
  private static readonly bond = /^\+ (grateful|friend|befriended|bond|tolerates|trusts|likes|owes|indebted|knows)\(/;
  private readonly made = new Map<string, string[]>();
  // And not the bookkeeping of what was said and carried, nor the world's own ticking elsewhere (prices, larders):
  // a change counts where it touches the company or what the act was done to.
  private static readonly kept =
    /^[+-] (\w+__)*(said_|heard_|toldBy|readIn|learnedFrom|carried|goodsPrice|larder|wages)/;
  static changed(event: CampaignEvent, act = ''): string[] {
    const touched = [/\bparty\b/, /_member_/, ...(/\((.*)\)/.exec(act)?.[1]?.split(',') ?? []).map(a => a.trim())
      .filter(a => a && !/^(party|region__member_)/.test(a)).map(a => new RegExp(`\\b${a}\\b`))];
    return event.changes.filter(c => !this.motion.test(c) && !this.kept.test(c) && touched.some(r => r.test(c)));
  }
  // An act's changes, kept against the place they were made at.
  note(place: string, changes: string[]) {
    const bonds = changes.filter(c => RunnerPayoff.bond.test(c));
    if (bonds.length) { this.made.set(place, [...this.made.get(place) ?? [], ...bonds]); }
  }
  // Come back to a place: of what was made there, how much still holds.
  back(campaign: Campaign, place: string): { held: number; of: number } | undefined {
    const made = this.made.get(place);
    if (!made?.length) { return undefined; }
    const held = made.filter(c => {
      const m = /^\+ (\w+)\((.*)\)$/.exec(c);
      return !!m && campaign.world.test(ModuleWriter.call(m[1]!, ...m[2]!.split(/,\s*/)));
    }).length;
    return { held, of: made.length };
  }
}
