import type { Campaign, CampaignEvent } from '../campaign/campaign';
import { VisitedPlaces } from './visited-places';
import { EntityIndex } from '../lang/index';
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
  // Where the company last stood in a place with each one and each thing it has been in a place with: where it last
  // saw them, which is all it knows of where they are (OR-880).
  saw: Map<string, string>;
  // Where the company came from to where it was before the last command.
  came?: string;
  // How many of its commands brought news (something learnt, someone joined, a level), how many it has given where it
  // now stands, and each place it left having done nothing there, at that count and how many times: a place left so
  // twice, with no news since, has nothing to go back for (the page had led a company from the churchyard to the
  // corn-store and back for days; a candle bought between is no reason to go back).
  acts: number; stay: number; idle: Map<string, { at: number; times: number }>;
  // What it tried where and failed at, and how often the company had grown when it did (someone joined, a level): a
  // try failed is done until the company is more than it was (the sea-gate's windlass, too stiff for a mage alone, had
  // dropped from the four for good though Gesk had been hired to put his back to it: cold play 5's 10, CL-33).
  failed: Map<string, Map<string, number>>; grown: number;
  // And how many times, at the company's present strength: a fresh try is one (see missed).
  tries: Map<string, number>;
}
export class CompanyRecall {
  private static readonly logs = new WeakMap<readonly CampaignEvent[], Read>();
  private constructor(private readonly r: Read, private readonly lastly: { talked: Set<string>; done: Set<string>;
    from?: string; came?: string; left?: string; acted?: boolean; grown: number; failed?: boolean }) {}
  // In an enclosed place (indoors, under the ground, in a building or a site: one rule with the compass, see
  // Itineraries.enclosed), the way the company came, open to it, for the page to keep in sight beside Go… (PR-08: five
  // cold players in three rounds could not find the way back or up, and walked out step by step through Go…; inside a
  // building there had been none, the site's rule apart from the compass's).
  back(screen: Screen, enclosed: boolean): { back?: string } {
    const came = this.lastly.came, exit = came && enclosed
      ? screen.exits.find(e => e.destination.id === came && !e.blocked) : undefined;
    return exit ? { back: exit.id } : {};
  }
  static of(campaign: Campaign): CompanyRecall {
    const actor = campaign.playerActor ?? 'party', log = campaign.history;
    let r = this.logs.get(log);
    if (!r || r.actor !== actor || log.length - 1 < r.read || (r.read > 0 && log[r.read - 1] !== r.last)) {
      r = { actor, read: 0, at: new Map(), visited: new Set(), seen: new Set(), texts: new Set(), talked: new Set(),
        done: new Map(), spoke: new Map(), saw: new Map(), acts: 0, stay: 0, idle: new Map(), failed: new Map(),
        grown: 0, tries: new Map() };
      for (const c of campaign.module.initial) {
        if (c.kind === 'assert' && c.call.name === 'at') { r.at.set(c.call.args[0]!, c.call.args[1]!); }
      }
      if (r.at.has(actor)) { r.visited.add(r.at.get(actor)!); this.met(r, r.at.get(actor)!); }
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
      ...left ? { left } : {}, acted: !!last && !moved && CompanyRecall.news(last), grown: r.grown
        + (last && this.grew(last) ? 1 : 0), ...last?.result === 'failure' ? { failed: true } : {} });
  }
  // One command: what it was done to, where, and what it showed; and where it left the company.
  private static take(campaign: Campaign, r: Read, event: CampaignEvent) {
    const here = r.at.get(r.actor), whom = this.whom(campaign, event.action);
    if (whom) { r.talked.add(whom); }
    if (whom && here) { r.spoke.set(whom, here); r.saw.set(whom, here); }
    if (here && event.result === 'failure') {
      r.failed.set(here, (r.failed.get(here) ?? new Map()).set(event.action, r.grown));
      const tried = CompanyRecall.tried(here, event.action, r.grown);
      r.tries.set(tried, (r.tries.get(tried) ?? 0) + 1);
    } else if (here) { r.done.set(here, (r.done.get(here) ?? new Set()).add(event.action)); }
    if (CompanyRecall.grew(event)) { r.grown++; }
    for (const p of event.perceptions ?? []) { r.seen.add(p.id); r.texts.add(p.text); }
    VisitedPlaces.moves(event.changes, r.at);
    const there = r.at.get(r.actor);
    if (there) { r.visited.add(there); }
    if (there && there !== here) { this.met(r, there); } else if (there) { this.arrived(r, event, there); }
    if (here && there && there !== here) {
      if (!r.stay) { r.idle.set(here, { at: r.acts, times: CompanyRecall.times(r, here) + 1 }); }
      r.stay = 0;
    } else {
      r.stay++;
      if (CompanyRecall.news(event)) { r.acts++; }
    }
    if (here && there && there !== here) { r.came = here; }
  }
  // Come to a place: everyone and everything in it seen there.
  private static met(r: Read, place: string) {
    for (const [id, at] of r.at) { if (at === place && id !== r.actor) { r.saw.set(id, place); } }
  }
  // Staying in a place: those come to it while the company stood there seen there.
  private static arrived(r: Read, event: CampaignEvent, place: string) {
    for (const c of event.changes) {
      const m = /^\+ at\(([^,]+), ([^)]+)\)$/.exec(c);
      if (m && m[2] === place && m[1] !== r.actor) { r.saw.set(m[1]!, place); }
    }
  }
  // Whom a command spoke with: talking to them, asking them something, or one of the things written to be asked them.
  static whom(campaign: Campaign, action: string): string | undefined {
    const op = campaign.operator(action), b = op?.bindings ?? {};
    if (op?.speaker) { return op.speaker; }
    return op?.schema === 'talk_to' ? b.person : op?.schema === 'ask' ? b.informant : undefined;
  }
  // Whether a command made the company more than it was: someone come along, a level gained.
  private static grew(event: CampaignEvent): boolean {
    return event.changes.some(c => /^\+ (memberOf|travelsWith)\(|\blevel\(/.test(c));
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
  // Where the company last saw someone or something, before the last command: in the place it last stood in with
  // them. Never where they are now unseen (OR-880: the gold had led to where a person truly stood, moved since).
  sawAt(id: string): string | undefined { return this.r.saw.get(id); }
  // Where the company knows what an aim names to be: a place is where it is; someone or something, here where it is
  // seen now, else where the company last saw it (sawAt). Where it has never seen them, nowhere: the aim's other words
  // (the town it names, who is to be asked) lead instead, never the world's truth (OR-880).
  static whereabouts(campaign: Campaign, screen: Screen, id: string): string | undefined {
    if (EntityIndex.of(campaign.module.entities).byId.get(id)?.space) { return id; }
    if ([...screen.people, ...screen.things].some(t => t.id === id)) { return screen.place.id; }
    return CompanyRecall.of(campaign).sawAt(id);
  }
  // Each where the company knows it to be (see whereabouts), or itself where it knows nowhere.
  static placed(campaign: Campaign, screen: Screen, ids: Iterable<string>): string[] {
    return [...ids].map(id => this.whereabouts(campaign, screen, id) ?? id);
  }
  read(text: string): boolean { return this.r.texts.has(text); }
  // Whether the company has spoken with them, the last command included.
  talkedTo(id: string): boolean { return this.r.talked.has(id) || this.lastly.talked.has(id); }
  // Whether it has done this here, the last command included.
  did(place: string, command: string): boolean {
    const done = [...this.r.done.get(place) ?? [], ...this.lastly.from === place ? this.lastly.done : []];
    const failed = [...this.r.failed.get(place) ?? []].flatMap(([d, at]) => at === this.lastly.grown ? [d] : []);
    return [...done, ...failed].some(d => CompanyRecall.same(command, d));
  }
  // Whether it was only tried here, the last command included, and never came off: done, but a fresh try at the aim's
  // step is still its step (OR-241: failed at the sea-gate's windlass, "or a fresh try", it had gone from the four).
  // One fresh try, at the company's present strength: tried twice and not come off, it is done until the company is
  // more than it was, as any try failed is (the gold-follower had levered the lettered flag four hours over, its words
  // "It was not made to be lifted", and never looked for the ring that opens it: test/porthalen-hall).
  missed(place: string, command: string): boolean {
    const last = this.lastly.from === place && !this.lastly.failed ? this.lastly.done : [];
    const done = [...this.r.done.get(place) ?? [], ...last];
    if (!this.did(place, command) || done.some(d => CompanyRecall.same(command, d))) { return false; }
    const at = this.lastly.grown, tried = [...this.r.tries].filter(([k]) => k.startsWith(`${place} ${at} `)
      && CompanyRecall.same(command, k.slice(`${place} ${at} `.length))).reduce((n, [, t]) => n + t, 0);
    const now = this.lastly.failed && this.lastly.from === place
      && [...this.lastly.done].some(d => CompanyRecall.same(command, d)) ? 1 : 0;
    return tried + now < 2;
  }
  private static tried(place: string, action: string, grown: number): string { return `${place} ${grown} ${action}`; }
  // Whether a command as the page offers it is one done: the same, or the same act with the page's arguments among the
  // engine's, in order (the page leaves out those its label does not show, the company first): "work_keep(innkeeper)"
  // is "work_keep(party,innkeeper)". Without it nothing offered in that form had ever counted as done. So with a
  // question offered by its name alone ("h__father", done as "h__father(party,h__kitchen)"): asked and answered, "Ask
  // Wat about Father" had been what Wat was led for still (the household's kitchen, 15 November: TB-04).
  static same(offered: string, done: string): boolean {
    if (offered === done) { return true; }
    const [a, b] = [/[()]/.test(offered) ? offered : `${offered}()`, done].map(c => /^([^(]+)\((.*)\)$/.exec(c));
    if (!a || !b || a[1] !== b[1]) { return false; }
    const want = a[2] ? a[2].split(',') : [], have = b[2]!.split(',');
    let at = 0;
    for (const x of want) { at = have.indexOf(x, at); if (at < 0) { return false; } at++; }
    return true;
  }
}
