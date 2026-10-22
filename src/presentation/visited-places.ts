import type { Campaign, CampaignEvent } from '../campaign/campaign';

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
        if (c.kind === 'assert' && c.call.name === 'at' && c.call.args[0] === actor) { t.visited.add(c.call.args[1]!); }
      }
      this.travels.set(log, t);
    }
    for (; t.read < log.length; t.read++) {
      this.moves(log[t.read]!.changes, t.at);
      if (t.at.has(actor)) { t.visited.add(t.at.get(actor)!); }
    }
    t.last = log[t.read - 1];
    return new Set(t.visited);
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
