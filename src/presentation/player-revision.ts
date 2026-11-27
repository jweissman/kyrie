import type { Campaign, CampaignEvent } from '../campaign/campaign';
import type { Operator } from '../campaign/planner';

// One player revision (OR-740; platform-separation.md, the fifth review's step 1): the campaign as a player's reading
// of it turns on, one immutable value for as long as none of it changes, from which the frame, what is perceived and
// what is withheld are derived once each (reading). Its parts, each compared by identity or value:
// - the world, and the acts on offer in it (Campaign.offered: a command under way or the game ended give a new list);
// - the installation (the modules installed: a new one is a new revision);
// - the clock (the watch and its minutes), whether the company still stands, and the aim followed (which the player
//   changes without changing the world, PL-06);
// - the log (its length and last entry) and the creatures' records (their store and its version).
// Each cache had kept a key of its own beside what it derived (the frame its world and list, what is perceived a string
// of the clock, the log and the aim with the store's version), so that a part one forgot was an invalidation missed;
// here there is one key, and a reading keyed by it is dropped with it. The session's own revisions (a talk opened, a
// lens, the map) change what is drawn of these, never these, and are not yet its parts (OR-740's remainder).
export class PlayerRevision {
  private static readonly kept = new WeakMap<Campaign, PlayerRevision>();
  // Off (a spec's oracle): every reading worked out afresh, as if no revision were kept.
  static keeping = true;
  private readonly readings = new Map<string, unknown>();
  private constructor(readonly campaign: Campaign, readonly world: Campaign['world'], readonly offered: readonly Operator[],
    private readonly parts: readonly unknown[]) {}
  // The revision of the campaign as it is now: the one kept while none of its parts has changed, else a new one.
  static of(campaign: Campaign): PlayerRevision {
    const world = campaign.world, parts = this.parts(campaign), kept = this.kept.get(campaign);
    if (kept && this.keeping && !campaign.command && !campaign.fighting && kept.world === world
      && this.same(kept.parts, parts)) { return kept; }
    const offered = campaign.offered();
    if (kept && this.keeping && kept.world === world && this.offers(kept.offered, offered)
      && this.same(kept.parts, parts)) {
      return kept;
    }
    const now = new PlayerRevision(campaign, world, offered, Object.freeze(parts));
    this.kept.set(campaign, now);
    return now;
  }
  private static parts(campaign: Campaign): unknown[] {
    const { current, creatures } = campaign.tickState, log = campaign.history;
    return [campaign.installations.length, current.elapsed, current.minutes ?? 0, campaign.running,
      current.following?.id ?? '', log.length, log.at(-1) as CampaignEvent | undefined, creatures, creatures.version];
  }
  // The same list on offer, or none either time (Campaign.offered gives a new empty list for each ask while a command
  // is under way: every frame of a fight had been a revision of its own, and what is perceived worked out for each).
  private static offers(a: readonly Operator[], b: readonly Operator[]): boolean {
    return a === b || (!a.length && !b.length);
  }
  private static same(a: readonly unknown[], b: readonly unknown[]): boolean {
    return a.length === b.length && a.every((x, i) => x === b[i]);
  }
  // What a reader derives from this revision, worked out once for it: its name says what it is and whose.
  reading<T>(name: string, derive: () => T): T {
    if (!this.readings.has(name)) { this.readings.set(name, derive()); }
    return this.readings.get(name) as T;
  }
}
