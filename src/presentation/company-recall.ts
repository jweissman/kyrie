import type { Campaign, CampaignEvent } from '../campaign/campaign';
import { VisitedPlaces } from './visited-places';

// What the company remembers of its own story, for the glance (see Glance): where it has been, whom it has spoken
// with, what it has done where, and what it has seen, as of the command before the last (so that what the last one
// showed is new) and with the last. Read from the event log as VisitedPlaces reads it: kept per log, read on from where
// the last reading stopped, and from the start again if the log was cut back or its last entry rewritten.
interface Read {
  actor: string; read: number; last?: CampaignEvent; at: Map<string, string>;
  // Up to the command before the last: the places been to, the observations seen (by id and by their words).
  visited: Set<string>; seen: Set<string>; texts: Set<string>;
  // Up to the command before the last: whom the company has spoken with, and what it has done where.
  talked: Set<string>; done: Map<string, Set<string>>;
  // Where the company came from to where it was before the last command.
  came?: string;
}
export class CompanyRecall {
  private static readonly logs = new WeakMap<readonly CampaignEvent[], Read>();
  private constructor(private readonly r: Read, private readonly lastly: { talked: Set<string>; done: Set<string>;
    from?: string; came?: string }) {}
  static of(campaign: Campaign): CompanyRecall {
    const actor = campaign.playerActor ?? 'party', log = campaign.history;
    let r = this.logs.get(log);
    if (!r || r.actor !== actor || log.length - 1 < r.read || (r.read > 0 && log[r.read - 1] !== r.last)) {
      r = { actor, read: 0, at: new Map(), visited: new Set(), seen: new Set(), texts: new Set(), talked: new Set(),
        done: new Map() };
      for (const c of campaign.module.initial) {
        if (c.kind === 'assert' && c.call.name === 'at') { r.at.set(c.call.args[0]!, c.call.args[1]!); }
      }
      if (r.at.has(actor)) { r.visited.add(r.at.get(actor)!); }
      this.logs.set(log, r);
    }
    for (; r.read < log.length - 1; r.read++) { this.take(campaign, r, log[r.read]!); }
    r.last = log[r.read - 1];
    const last = log.at(-1), talked = new Set<string>(), done = new Set<string>(), from = r.at.get(actor);
    if (last) {
      const whom = this.whom(campaign, last.action);
      if (whom) { talked.add(whom); }
      done.add(last.action);
    }
    const moved = !!last && !!from && last.changes.includes(`- at(${actor}, ${from})`);
    const came = moved ? from : r.came;
    return new CompanyRecall(r, { talked, done, ...from ? { from } : {}, ...came ? { came } : {} });
  }
  // One command: what it was done to, where, and what it showed; and where it left the company.
  private static take(campaign: Campaign, r: Read, event: CampaignEvent) {
    const here = r.at.get(r.actor), whom = this.whom(campaign, event.action);
    if (whom) { r.talked.add(whom); }
    if (here) { r.done.set(here, (r.done.get(here) ?? new Set()).add(event.action)); }
    for (const p of event.perceptions ?? []) { r.seen.add(p.id); r.texts.add(p.text); }
    VisitedPlaces.moves(event.changes, r.at);
    const there = r.at.get(r.actor);
    if (there) { r.visited.add(there); }
    if (here && there && there !== here) { r.came = here; }
  }
  // Whom a command spoke with: talking to them, asking them something, or one of the things written to be asked them.
  private static whom(campaign: Campaign, action: string): string | undefined {
    const op = campaign.operator(action), b = op?.bindings ?? {};
    if (op?.speaker) { return op.speaker; }
    return op?.schema === 'talk_to' ? b.person : op?.schema === 'ask' ? b.informant : undefined;
  }
  // Whether the company had been here before the last command.
  been(place: string): boolean { return this.r.visited.has(place); }
  // Where the company stood when the last command was given, and where it had come there from (or, the last command
  // having brought it here, where it came from).
  get from(): string | undefined { return this.lastly.from; }
  get came(): string | undefined { return this.lastly.came; }
  // Whether this was seen before the last command, by its id or by its words.
  saw(id: string): boolean { return this.r.seen.has(id); }
  read(text: string): boolean { return this.r.texts.has(text); }
  // Whether the company has spoken with them, the last command included.
  talkedTo(id: string): boolean { return this.r.talked.has(id) || this.lastly.talked.has(id); }
  // Whether it has done this here, the last command included.
  did(place: string, command: string): boolean {
    return !!this.r.done.get(place)?.has(command) || (this.lastly.from === place && this.lastly.done.has(command));
  }
}
