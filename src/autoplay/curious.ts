import { Journey, type Offered } from '../session/journey';
import type { Operator } from '../lang/module';

// What a curious player came upon in an adventure, against what its author wrote (see Curious).
export interface Reach {
  rooms: Set<string>; people: Map<string, Set<string>>; topicsOffered: Set<string>; topicsTaken: Set<string>;
  actsOffered: Set<string>; actsTaken: Set<string>; observed: Set<string>;
  // Merchants found, with what each sells; and those who only buy, with what they buy (Halm's finds, a factor's prize).
  trade: Map<string, string[]>; buyers: Map<string, string[]>;
  // Those talked to who had nothing to say the first time, and those who never had.
  mute: Set<string>; spoken: Set<string>;
  // The people seen in each room, at the busiest it was seen; steps spent waiting because nothing was new.
  crowd: Map<string, number>; idle: number; steps: number;
  // The watch the company first met someone, and first had something to ask.
  firstMet?: string; firstAsked?: string;
  // Why play stopped: the book closed, the steps ran out, or a choice could not be taken (and what it said).
  ended?: string;
  // What closed the book before its end, each time (a way that ends it unwarned, a fight that could not be won).
  closed: string[];
}

// A curious player (Mission 18, the owner's first priority: what of an adventure is reached in ordinary play, not
// what was written). It goes by what the page offers, as a player does: talks to everyone it meets and asks them
// everything it can, takes every way, tries everything the adventure offers to do but a fight, goes round again when
// nothing is new, and waits an hour when there is nowhere it has not been lately. It does not buy, fight or pick a
// quarrel; what it reaches is a floor, not a ceiling, of what play can reach.
export class Curious {
  static readonly refusing = /^(attack|engage|ambush|assail|drop|set_down|prepare|unequip|equip|douse|steal|threaten)/;
  private readonly talked = new Map<string, number>();
  private readonly been = new Map<string, number>();
  private readonly tried = new Set<string>();
  private readonly ops: Map<string, Operator>;
  readonly reach: Reach = { rooms: new Set(), people: new Map(), topicsOffered: new Set(), topicsTaken: new Set(),
    actsOffered: new Set(), actsTaken: new Set(), observed: new Set(), trade: new Map(), buyers: new Map(),
    mute: new Set(), spoken: new Set(), crowd: new Map(), idle: 0, steps: 0, closed: [] };
  // avoid: the choices that closed the book on an earlier try, not taken again; reach: an earlier try's, added to.
  constructor(private readonly j: Journey, private readonly avoid = new Set<string>(), reach?: Reach) {
    if (reach) { this.reach = reach; }
    this.ops = new Map(j.campaign.world.module.actions.map(a => [a.id, a]));
  }
  static named(command: string): string { return command.replace(/\(.*$/, ''); }
  private op(c: Offered): Operator | undefined { return this.ops.get(Curious.named(c.command)); }
  private get watch(): number { return (this.j as unknown as { watch(): number }).watch(); }
  async play(steps: number): Promise<Reach> {
    for (let i = 0; i < steps && this.j.campaign.running; i++) {
      this.record();
      const pick = this.choose();
      if (!pick) { this.reach.ended = 'nothing to do'; break; }
      this.reach.steps++;
      try { await this.j.perform(pick.command, pick.label, pick.grave); } catch (e) {
        this.reach.ended = `${pick.label}: ${(e as Error).message.slice(0, 160)}`; break;
      }
    }
    if (!this.reach.ended && !this.j.campaign.running) {
      const last = this.j.taken.at(-1);
      this.reach.ended = `the book closed at ${this.j.screen().clock}`;
      if (last) { this.reach.closed.push(`${last.label}${last.grave ? ' (warned)' : ''}: ${last.page.slice(0, 140)}`); }
    }
    this.reach.ended ??= 'steps';
    this.record();
    return this.reach;
  }
  private record() {
    const sc = this.j.screen(), r = this.reach, clock = sc.clock;
    r.rooms.add(sc.place.id); this.been.set(sc.place.id, this.watch);
    r.crowd.set(sc.place.id, Math.max(r.crowd.get(sc.place.id) ?? 0, sc.people.length));
    for (const p of sc.people) {
      if (!r.people.has(p.id)) { r.people.set(p.id, new Set()); }
      r.people.get(p.id)!.add(sc.place.id);
      r.firstMet ??= clock;
    }
    for (const o of sc.observed) { r.observed.add(o.id); }
    for (const t of sc.trade) {
      if (t.sells.length) { r.trade.set(t.id, t.sells.map(s => s.name)); }
      else { r.buyers.set(t.id, t.buys.map(b => b.name)); }
    }
    for (const c of this.j.choices()) {
      const op = this.op(c);
      if (op?.speaker) { r.topicsOffered.add(op.id); r.firstAsked ??= clock; }
      else if (op?.id.includes('__')) { r.actsOffered.add(op.id); }
    }
  }
  // The last choice taken, which closed the book: not to be taken on the next try.
  get closer(): string | undefined { return this.j.campaign.running ? undefined : this.j.taken.at(-1)?.command; }
  private choose(): Offered | undefined {
    const all = this.j.choices().filter(c => !this.avoid.has(c.command));
    return this.converse(all) ?? this.greet(all) ?? this.attempt(all) ?? this.wander(all)
      ?? (this.reach.idle++, all.find(c => c.command === 'wait_hour'));
  }
  // In talk: the next thing not yet asked, else leave.
  private converse(all: Offered[]): Offered | undefined {
    const leave = all.find(c => c.command.startsWith('take_leave('));
    if (!leave) { return undefined; }
    const who = leave.command.slice('take_leave('.length, -1), topics = all.filter(c => this.op(c)?.speaker);
    if (topics.length) { this.reach.spoken.add(who); }
    else if (!this.reach.spoken.has(who)) { this.reach.mute.add(who); }
    const next = topics.find(c => !this.reach.topicsTaken.has(Curious.named(c.command)));
    if (next) { this.reach.topicsTaken.add(Curious.named(next.command)); return next; }
    return leave;
  }
  // Someone not talked to in the last two hours.
  private greet(all: Offered[]): Offered | undefined {
    const c = all.find(x => x.command.startsWith('talk_to(') && (this.talked.get(x.command) ?? -99) < this.watch - 12);
    if (c) { this.talked.set(c.command, this.watch); }
    return c;
  }
  private attempt(all: Offered[]): Offered | undefined {
    const c = all.find(x => {
      const op = this.op(x);
      return op && op.id.includes('__') && !op.speaker && !this.tried.has(x.command)
        && !Curious.refusing.test(op.id.replace(/^\w+__/, ''));
    });
    if (c) { this.tried.add(c.command); this.reach.actsTaken.add(Curious.named(c.command)); }
    return c;
  }
  // A way to somewhere not yet been, the nearest such by the ways open; else round again, longest unvisited first.
  private wander(all: Offered[]): Offered | undefined {
    const goes = all.filter(c => /^(go|travel)\(/.test(c.command));
    const fresh = goes.find(c => !this.reach.rooms.has(c.command.replace(/\)$/, '').split(',').at(-1)!));
    if (fresh) { return fresh; }
    const w = this.j.campaign.world, here = w.one('at', this.j.campaign.playerActor ?? 'party')!;
    const unseen = w.module.entities.filter(e => e.type === 'place' && e.space?.kind === 'room'
      && !this.reach.rooms.has(e.id)).map(e => e.id);
    const again = [...this.been.entries()].filter(([p]) => p !== here).sort((a, b) => a[1] - b[1]).map(([p]) => p);
    for (const list of [unseen, this.reach.idle % 2 ? again.slice(0, 6) : []]) {
      const first = this.toward(all, here, list);
      if (first) { return first; }
    }
    return undefined;
  }
  private toward(all: Offered[], here: string, places: string[]): Offered | undefined {
    let best: [string, string][] | undefined;
    for (const p of places) {
      try {
        const way = Journey.way(this.j.campaign.world, here, p);
        if (way.length && (!best || way.length < best.length)) { best = way; }
      } catch { /* no way there now */ }
    }
    return best && all.find(c => c.command === `go(${best[0]![0]},${best[0]![1]})`);
  }
}
