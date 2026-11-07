import type { Campaign, CampaignEvent } from '../campaign/campaign';
import { EntityIndex } from '../lang/entity-index';
import { Spatial } from '../spatial';

interface Deck { vessel: string; site: string }
// Where a company has been, from the event log: kept per log and read on from where the last reading stopped.
export class VisitedPlaces {
  // Where the company has been: its first place, and every place the log moves it to, read from where the last
  // reading stopped (and from the start again if the log was cut back or its last entry rewritten).
  private static readonly travels = new WeakMap<readonly CampaignEvent[],
    { actor: string; read: number; last?: CampaignEvent; at: Map<string, string>; visited: Set<string> }>();
  static of(campaign: Campaign, actor: string): Set<string> {
    const log = campaign.history;
    let t = this.travels.get(log);
    if (!t || t.actor !== actor || log.length < t.read || (t.read > 0 && log[t.read - 1] !== t.last)) {
      t = { actor, read: 0, at: new Map(), visited: new Set() };
      for (const c of campaign.module.initial) {
        if (c.kind !== 'assert' || c.call.name !== 'at') { continue; }
        // Where everything starts, so that a ship that has not yet moved is somewhere (see aboard).
        t.at.set(c.call.args[0]!, c.call.args[1]!);
        if (c.call.args[0] === actor) { t.visited.add(c.call.args[1]!); }
      }
      this.travels.set(log, t);
    }
    const decks = this.decks(campaign);
    for (; t.read < log.length; t.read++) {
      this.moves(log[t.read]!.changes, t.at);
      if (t.at.has(actor)) { t.visited.add(t.at.get(actor)!); }
      const vessel = decks.length && t.at.has(actor) ? this.aboard(campaign, decks, t.at.get(actor)!) : undefined;
      if (vessel && t.at.has(vessel)) { t.visited.add(t.at.get(vessel)!); }
    }
    t.last = log[t.read - 1];
    return new Set(t.visited);
  }
  // A ship's decks (decks(vessel, place)): while the company stands on them, wherever she goes it has been (the
  // stations of the Dorothea's passage, each found on the Reach's chart as she makes it: see ChartModel.afloat).
  private static decks(campaign: Campaign): Deck[] {
    const w = campaign.world;
    return w.relates('decks') ? w.related('decks').map(r => ({ vessel: r.args[0]!, site: r.args[1]! })) : [];
  }
  private static aboard(campaign: Campaign, decks: Deck[], place: string): string | undefined {
    const line = Spatial.ancestry(EntityIndex.of(campaign.module.entities).byId, place).map(e => e.id);
    return decks.find(d => line.includes(d.site))?.vessel;
  }
  static moves(changes: string[] | undefined, at: Map<string, string>) {
    for (const line of changes ?? []) {
      const match = /^([+-]) at\(([^,]+), ([^)]+)\)$/.exec(line);
      if (!match) { continue; }
      if (match[1] === '+') { at.set(match[2]!, match[3]!); }
      else if (at.get(match[2]!) === match[3]) { at.delete(match[2]!); }
    }
  }
}
