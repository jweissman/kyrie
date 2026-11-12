import type { Campaign, CampaignEvent } from '../campaign/campaign';
import { VisitedPlaces } from './visited-places';
import type { Screen } from '../ui/screen-types';

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
  // Where the company last spoke with each one it has spoken with: its own experience, not where they are now.
  spoke: Map<string, string>;
  // Where the company came from to where it was before the last command.
  came?: string;
  // How many of its commands brought news (something learnt, someone joined, a level), how many it has given where it
  // now stands, and each place it left having done nothing there, at that count and how many times: a place left so
  // twice, with no news since, has nothing to go back for (the page had led a company from the churchyard to the
  // corn-store and back for days; a candle bought between is no reason to go back).
  acts: number; stay: number; idle: Map<string, { at: number; times: number }>;
}
export class CompanyRecall {
  private static readonly logs = new WeakMap<readonly CampaignEvent[], Read>();
  private constructor(private readonly r: Read, private readonly lastly: { talked: Set<string>; done: Set<string>;
    from?: string; came?: string; left?: string; acted?: boolean }) {}
  // In a site or underground, the way the company came, open to it, for the page to keep in sight beside Go… (PR-08:
  // five cold players in three rounds could not find the way back or up, and walked out step by step through Go…).
  back(screen: Screen): { back?: string } {
    const came = this.lastly.came, exit = came && (screen.place.underground || screen.path.some(p => p.kind === 'site'))
      ? screen.exits.find(e => e.destination.id === came && !e.blocked) : undefined;
    return exit ? { back: exit.id } : {};
  }
  static of(campaign: Campaign): CompanyRecall {
    const actor = campaign.playerActor ?? 'party', log = campaign.history;
    let r = this.logs.get(log);
    if (!r || r.actor !== actor || log.length - 1 < r.read || (r.read > 0 && log[r.read - 1] !== r.last)) {
      r = { actor, read: 0, at: new Map(), visited: new Set(), seen: new Set(), texts: new Set(), talked: new Set(),
        done: new Map(), spoke: new Map(), acts: 0, stay: 0, idle: new Map() };
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
    const came = moved ? from : r.came, left = moved && !r.stay ? from : undefined;
    return new CompanyRecall(r, { talked, done, ...from ? { from } : {}, ...came ? { came } : {},
      ...left ? { left } : {}, acted: !!last && !moved && CompanyRecall.news(last) });
  }
  // One command: what it was done to, where, and what it showed; and where it left the company.
  private static take(campaign: Campaign, r: Read, event: CampaignEvent) {
    const here = r.at.get(r.actor), whom = this.whom(campaign, event.action);
    if (whom) { r.talked.add(whom); }
    if (whom && here) { r.spoke.set(whom, here); }
    if (here) { r.done.set(here, (r.done.get(here) ?? new Set()).add(event.action)); }
    for (const p of event.perceptions ?? []) { r.seen.add(p.id); r.texts.add(p.text); }
    VisitedPlaces.moves(event.changes, r.at);
    const there = r.at.get(r.actor);
    if (there) { r.visited.add(there); }
    if (here && there && there !== here) {
      if (!r.stay) { r.idle.set(here, { at: r.acts, times: CompanyRecall.times(r, here) + 1 }); }
      r.stay = 0;
    } else {
      r.stay++;
      if (CompanyRecall.news(event)) { r.acts++; }
    }
    if (here && there && there !== here) { r.came = here; }
  }
  // Whom a command spoke with: talking to them, asking them something, or one of the things written to be asked them.
  private static whom(campaign: Campaign, action: string): string | undefined {
    const op = campaign.operator(action), b = op?.bindings ?? {};
    if (op?.speaker) { return op.speaker; }
    return op?.schema === 'talk_to' ? b.person : op?.schema === 'ask' ? b.informant : undefined;
  }
  // Whether a command brought the company news: something it knows now, someone with it, a level gained.
  private static news(event: CampaignEvent): boolean {
    return event.changes.some(c => /^\+ (knows|memberOf)\(/.test(c) || /\blevel\(/.test(c));
  }
  // Whether the company has left this place twice having done nothing there, with no news since: once is passing
  // through, or not yet getting to what is there (the ruts at the bridge, still to be looked at).
  idle(place: string): boolean {
    const times = CompanyRecall.times(this.r, place) + (this.lastly.left === place ? 1 : 0);
    return !this.lastly.acted && times >= 2;
  }
  private static times(r: Read, place: string): number {
    const was = r.idle.get(place);
    return was && was.at === r.acts ? was.times : 0;
  }
  // Whether the company had been here before the last command.
  been(place: string): boolean { return this.r.visited.has(place); }
  // Where the company stood when the last command was given, and where it had come there from (or, the last command
  // having brought it here, where it came from).
  get from(): string | undefined { return this.lastly.from; }
  get came(): string | undefined { return this.lastly.came; }
  // Whether this was seen before the last command, by its id or by its words.
  saw(id: string): boolean { return this.r.seen.has(id); }
  // Those the company last spoke with at a place, before the last command.
  spokeAt(place: string): string[] { return [...this.r.spoke].filter(([, at]) => at === place).map(([who]) => who); }
  read(text: string): boolean { return this.r.texts.has(text); }
  // Whether the company has spoken with them, the last command included.
  talkedTo(id: string): boolean { return this.r.talked.has(id) || this.lastly.talked.has(id); }
  // Whether it has done this here, the last command included.
  did(place: string, command: string): boolean {
    const done = [...this.r.done.get(place) ?? [], ...this.lastly.from === place ? this.lastly.done : []];
    return done.some(d => CompanyRecall.same(command, d));
  }
  // Whether a command as the page offers it is one done: the same, or the same act with the page's arguments among the
  // engine's, in order (the page leaves out those its label does not show, the company first): "work_keep(innkeeper)"
  // is "work_keep(party,innkeeper)". Without it nothing offered in that form had ever counted as done.
  static same(offered: string, done: string): boolean {
    if (offered === done) { return true; }
    const [a, b] = [offered, done].map(c => /^([^(]+)\((.*)\)$/.exec(c));
    if (!a || !b || a[1] !== b[1]) { return false; }
    const want = a[2]!.split(','), have = b[2]!.split(',');
    let at = 0;
    for (const x of want) { at = have.indexOf(x, at); if (at < 0) { return false; } at++; }
    return true;
  }
}
