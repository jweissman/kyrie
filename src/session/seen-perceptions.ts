import type { Campaign, CampaignEvent } from '../campaign/campaign';

interface Counted { log: readonly CampaignEvent[]; n: number; last?: CampaignEvent; counts: Map<string, number> }

// What the company has perceived over the whole log, kept as the log grows (OR-1361; the architectural review of 27
// November, intervention 2): how many of its events carry each perception, so that whether one is new is a lookup,
// not a read of every event before it on every leg of a journey (Travel.fresh). Counted from where it last was while
// the log only grows; read again whole where it does not (a command undone, a game restored: the last event counted
// is no longer where it was).
export class SeenPerceptions {
  private static readonly kept = new WeakMap<Campaign, Counted>();
  static of(campaign: Campaign): ReadonlyMap<string, number> {
    const log = campaign.history, kept = this.kept.get(campaign);
    const grows = kept && kept.log === log && kept.n <= log.length && (!kept.n || log[kept.n - 1] === kept.last);
    const at: Counted = grows ? kept : { log, n: 0, counts: new Map() };
    for (const event of log.slice(at.n)) {
      for (const id of new Set((event.perceptions ?? []).map(p => p.id))) {
        at.counts.set(id, (at.counts.get(id) ?? 0) + 1);
      }
    }
    at.n = log.length; at.last = log.at(-1);
    this.kept.set(campaign, at);
    return at.counts;
  }
}
