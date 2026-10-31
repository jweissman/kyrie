import { PlaySession } from './play-session';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import type { BundleSource } from '../campaign/bundle-source';
import type { CampaignEvent } from '../campaign/campaign';
import type { CreatureGenerationContext } from '../content';
import { ModuleWriter } from '../lang/module-writer';
import { ModuleParser } from '../lang/module-parser';
import { ScreenModel } from '../ui/screen-model';
import type { Screen } from '../ui/screen-types';
import type { World } from '../lang/world';
import type { Predicate } from '../lang/module';
import { ChoiceList, type Choice } from '../ui/choice-list';
import { PlayerView } from '../presentation/player-view';
import { Narrator } from '../presentation/narrator';
import { ActionFeedbackView } from '../presentation/action-feedback';
import { EndingOrder } from '../lang/ending-order';

// A choice the page offers, as an author names it in a step: its label ("Examine › Push and pull at it", "Pack › A
// torch › Light", "a torch: Light"), and the same under the heading it is offered beneath ("the Sleeper's left
// eyelid: Examine › Push and pull at it"), so that two things' alike choices can be told apart by name.
// A choice that cannot be undone says so (grave): the page asks before it does it, and a journey says it was asked.
export interface Offered { label: string; full: string; command: string; grave?: string }
// One step taken: what was asked, the choice it took, what came back (told: the event's perceptions and response, the
// action's Result and what rules said, as the module wrote them), and what the page told of it (page: the narrator's
// lines, set as a book is, its quotes curled). JOURNEY_TRACE=1 prints each step as the page told it.
export interface Taken {
  label: string; command: string; told: string; page: string; event: CampaignEvent; grave?: string; chapter?: string;
}

// A game played by the labels a player sees, as every adventure's journeys are (Thrume, The House That Grows, The
// Road the Star Came Down, The Patient Star each wrote one of these before it was shipped). A step is a pattern for
// the choice to take, matched against each label and then each label under its heading, or one of:
//   ?step      take it if it can be taken, and go on if not: a choice not offered, nothing to wait by, no way there
//   @command   perform a command by its id
//   =N         wait until watch N, an hour at a time while six or more away, a while at a time after
//   =until C   wait a while at a time until a condition holds, as the module writes it (complete(reckoner),
//              not at(party, quay), approach(bowl) >= 1), or the book closes: a week at most
//   =+N        wait N watches more
//   =21:00     wait until that time comes, or =day 3 21:00 until that time of that day (the first is day 1)
//   ~N         wait until watch N by dark and first light (an hour when neither is offered)
//   ~pattern   a way that is not open yet: wait a while and try again, up to twelve times
//   >place     go to a place by the shortest way the world joins them, a way at a time (a place of a generated
//              world's first region by its own id, z3_deep; any other by its whole id); or to where someone is
// A pattern's straight quotes match the page's curled ones, and the other way about. A step that matches choices doing
// different things takes the first, and says so in `ambiguous`; a journey started strict, or run with
// JOURNEY_STRICT=1, fails there instead, naming them. (Low Water's 22 and 24: ?=+6 had been read as a label and passed
// over; its journeys grew loops of waits until something held; "what the Reckoner counts", meant for the census
// exhibit, asked a clerk.)
export class Journey {
  readonly taken: Taken[] = [];
  readonly ambiguous: string[] = [];
  // An ending reached while another held that could have been reached instead (see EndingOrder.rivals): each said,
  // naming both and which won by the order they are written in, and warned of as it happens, so that the author
  // learns of it from the journeys and not in play (the Grand Tour's friction 4, GTR-04).
  readonly contested: string[] = [];
  // The page as last built, and the world and log it was built of: a step reads the page to find its choice, and
  // again to tell what came of it, and a wait reads it up to three times; the page is the same until either changes.
  private built?: { world: World; length: number; last?: CampaignEvent; screen: Screen };
  private constructor(readonly session: PlaySession, private readonly strict: boolean) {}
  static async start(campaign: string, seed = 'journey', options: { source?: BundleSource;
    party?: CreatureGenerationContext[]; strict?: boolean } = {}): Promise<Journey> {
    const source = options.source ?? NodeBundleSource.shared;
    return Journey.of(await PlaySession.start(campaign, seed, source, options.party), options.strict);
  }
  static of(session: PlaySession, strict = !!process.env.JOURNEY_STRICT): Journey {
    return new Journey(session, strict);
  }
  get campaign() { return this.session.campaign; }
  // Every choice that can be taken now: what the page offers where the company stands, its pack, and each thing it
  // carries (the item panel).
  choices(): Offered[] {
    const screen = this.screen(), out: Offered[] = [];
    for (const section of ChoiceList.explore(screen)) {
      for (const c of Journey.leaves(section.choices)) { out.push({ ...c, full: `${section.title}: ${c.label}` }); }
    }
    for (const section of ChoiceList.pack(screen)) {
      for (const c of Journey.leaves(section.choices, 'Pack › ')) { out.push({ ...c, full: c.label }); }
    }
    for (const item of screen.items) {
      for (const c of Journey.acts(item.acts, `${item.name}: `)) { out.push({ ...c, full: c.label }); }
    }
    return out;
  }
  find(pattern: string): Offered | undefined { return this.matches(pattern)[0]; }
  // The choices a pattern matches: by label, else by label under its heading, else by a thing's name and what is done
  // with it.
  matches(pattern: string): Offered[] {
    const straight = Journey.straight(pattern), re = new RegExp(straight, 'i'), all = this.choices();
    for (const key of ['label', 'full'] as const) {
      const found = all.filter(c => re.test(Journey.straight(c[key])));
      if (found.length) { return found; }
    }
    return Journey.named(straight, all);
  }
  private static straight(text: string): string { return text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"'); }
  // "register: Take" for "the register of names: Take": a thing called by part of its name, then what is done with it
  // (a step had to quote an item's whole name: Liberty of the Ice friction 19).
  private static named(pattern: string, all: Offered[]): Offered[] {
    const at = pattern.indexOf(': ');
    if (at < 1) { return []; }
    const thing = new RegExp(pattern.slice(0, at), 'i'), act = new RegExp(`^${pattern.slice(at + 2)}`, 'i');
    return all.filter(c => [c.label, c.full].map(l => Journey.straight(l)).some(l => [...l.matchAll(/: /g)]
      .some(m => thing.test(l.slice(0, m.index)) && act.test(l.slice(m.index + 2)))));
  }
  offers(pattern: string): boolean { return !!this.find(pattern); }
  // What the steps told, each step's perceptions and response after a space (as the journeys' own drivers said it).
  async play(...steps: string[]): Promise<string> {
    let told = '';
    for (const step of steps) { told += await this.step(step); }
    return told;
  }
  async step(step: string): Promise<string> {
    if (step.startsWith('?')) { return this.optional(step.slice(1)); }
    if (step.startsWith('=until ')) { return this.untilHolds(step.slice(7)); }
    const named = /^=(?:day (\d+) )?(\d{1,2}):(\d{2})$/.exec(step);
    if (named) { return this.until(Journey.watchAt(this.watch(), named.slice(1)), false); }
    const wait = /^(=\+|=|~)(\d+)$/.exec(step);
    if (wait) {
      const n = Number(wait[2]);
      return this.until(wait[1] === '=+' ? this.watch() + n : n, wait[1] === '~');
    }
    if (step.startsWith('@')) { return this.perform(step.slice(1), step); }
    if (step.startsWith('~')) { return this.through(step.slice(1)); }
    if (step.startsWith('>')) { return this.go(step.slice(1)); }
    const c = this.chosen(step);
    return this.perform(c.command, c.label, c.grave);
  }
  private async optional(step: string): Promise<string> {
    try { return await this.step(step); } catch (error) {
      if (error instanceof Error && error.name === 'Unoffered') { return ''; }
      throw error;
    }
  }
  // A step the page does not offer (no choice its pattern matches, nothing to wait by, no way there): passed over when
  // it was written ?step.
  private static unoffered(message: string): Error { return Object.assign(new Error(message), { name: 'Unoffered' }); }
  // The choice a step takes: the first it matches, and if it matched others that do something else, said so.
  private chosen(step: string): Offered {
    const matched = this.matches(step), c = matched[0];
    if (!c) {
      throw Journey.unoffered(`No /${step}/ at watch ${this.watch()} among ${this.choices().map(x => x.label).join(' | ')}`);
    }
    if (new Set(matched.map(m => m.command)).size > 1) {
      const said = `/${step}/ matches ${matched.map(m => m.full).join(' | ')}`;
      if (this.strict) { throw new Error(`${said}: name the one meant by its heading`); }
      this.ambiguous.push(said);
    }
    return c;
  }
  // Performs a command, and keeps what came back and what the page told of it (and, for one that cannot be undone,
  // what the page asked before it: never tested, it executed on its first choice, Hessel friction 7).
  async perform(command: string, label = command, grave?: string): Promise<string> {
    const before = PlayerView.observe(this.campaign);
    const event = await this.session.perform(command);
    const moved = before.location?.id !== this.at(this.campaign.playerActor ?? 'party');
    const leaf = Narrator.leaf(this.campaign, this.screen(),
      { event, feedback: ActionFeedbackView.read(this.campaign, event, before), said: label, moved });
    const told = ' ' + [...(event.perceptions ?? []).map(p => p.text), event.response ?? ''].join(' ');
    // What the page says: the way there, the exchange, the place if the company moved, what has changed.
    const page = [...(leaf.journey ?? []), ...(leaf.exchange?.lines ?? []).map(l => l.text),
      ...(moved ? [...leaf.situation, ...leaf.presence] : []), ...leaf.changed].join(' ');
    const chapter = leaf.heading?.kind === 'chapter' ? leaf.heading.title : undefined;
    this.taken.push({ label, command, told, page, event, ...grave ? { grave } : {}, ...chapter ? { chapter } : {} });
    if (process.env.JOURNEY_TRACE) { console.log(`[${label}] ${page}`); }
    this.contests(event);
    return told;
  }
  // Each pair is warned of once in a run, however many of its journeys come to it (a file of Hessel's journeys came
  // to the Last Dance over the Morning After four times); each journey keeps every one it came to.
  private static readonly warned = new Set<string>();
  private contests(event: CampaignEvent) {
    for (const p of event.perceptions ?? []) {
      for (const held of p.rivals ?? []) {
        const said = EndingOrder.contest(this.campaign.module, p.id, held);
        this.contested.push(said);
        if (!Journey.warned.has(said)) { Journey.warned.add(said); console.warn(`journey: ${said}`); }
      }
    }
  }
  screen(): Screen {
    const world = this.campaign.world, log = this.campaign.history, b = this.built;
    if (b && b.world === world && b.length === log.length && b.last === log.at(-1)) { return b.screen; }
    const screen = ScreenModel.build(this.campaign);
    this.built = { world, length: log.length, last: log.at(-1), screen };
    return screen;
  }
  // Every step's telling as the page gave it, one to a line, after its label.
  get page(): string { return this.taken.map(t => `[${t.label}] ${t.page}`).join('\n'); }
  watch(): number { return this.campaign.world.number(ModuleWriter.call('watch', 'clock')); }
  minutes(): number { return this.watch() * 10 + (this.campaign.state.minutes ?? 0); }
  holds(name: string, ...args: string[]): boolean { return this.campaign.world.test(ModuleWriter.call(name, ...args)); }
  measure(name: string, ...args: string[]): number {
    return this.campaign.world.number(ModuleWriter.call(name, ...args));
  }
  at(who: string): string | undefined { return this.campaign.world.one('at', who); }
  // Waits on to a watch, or until the book closes (an ending reached on the way: waiting past it threw, Hessel friction
  // 15).
  // The watch a time on the clock comes at, counted from eight on the first morning: the next such time, or that day's.
  // Nine at night on Shrove Monday is 222, and an author wrote 216, which is eight o'clock (A Winter in Carth's 20).
  static watchAt(now: number, [day, hours, minutes]: (string | undefined)[]): number {
    const time = Number(hours) * 60 + Number(minutes);
    if (day) { return this.watchOf(Number(day), time); }
    const today = Math.floor((now * 10 + 8 * 60) / 1440) + 1;
    return this.watchOf(today, time) > now ? this.watchOf(today, time) : this.watchOf(today + 1, time);
  }
  private static watchOf(day: number, minutes: number): number { return ((day - 1) * 1440 + minutes - 8 * 60) / 10; }
  private async until(watch: number, long: boolean): Promise<string> {
    let told = '';
    while (this.campaign.running && this.watch() < watch) {
      const pick = long ? this.find('^Wait › Until dark') ?? this.find('^Wait › Until first light')
        : this.find(watch - this.watch() >= 6 ? '^Wait › An hour' : '^Wait › A while');
      const c = pick ?? this.find('^Wait › An hour');
      if (!c) { throw Journey.unoffered(`Nothing to wait by at watch ${this.watch()}`); }
      told += await this.perform(c.command, c.label);
    }
    return told;
  }
  // Waits a while at a time until a condition holds, or the book closes.
  private async untilHolds(condition: string): Promise<string> {
    const holds = this.condition(condition);
    let told = '';
    for (let waits = 0; this.campaign.running && !this.campaign.world.test(holds); waits++) {
      if (waits >= Journey.week) { throw Journey.unoffered(`Not ${condition} by watch ${this.watch()}`); }
      told += await this.until(this.watch() + 1, false);
    }
    return told;
  }
  private static readonly week = 7 * 144;
  // A condition as the module writes it, its names as the world has them: the world's own (at, watch, party), or an
  // installed module's (complete(reckoner) is lowwater__complete(lowwater__reckoner)).
  private condition(text: string): Predicate {
    const module = this.campaign.world.module, prefixes = this.campaign.installed.map(id => `${id}__`);
    const functions = new Set([...module.relations, ...module.measures, ...module.queries].map(f => f.name));
    const ids = new Set(module.entities.map(e => e.id));
    return ModuleWriter.conditionCalls(ModuleParser.predicate(text), c => {
      const name = Journey.called(c.name, functions, prefixes);
      if (!name) { throw new Error(`=until ${text}: nothing is called ${c.name}`); }
      return { ...c, name, args: c.args.map(a => Journey.called(a, ids, prefixes) ?? a) };
    });
  }
  private static called(name: string, known: Set<string>, prefixes: string[]): string | undefined {
    return known.has(name) ? name : prefixes.map(p => p + name).find(q => known.has(q));
  }
  private async go(place: string): Promise<string> {
    const world = this.campaign.world, id = world.module.entities.some(e => e.id === place) ? place : `region__${place}`;
    // Someone, or something, is gone to where they are.
    const target = world.module.entities.find(e => e.id === id)?.type === 'place' ? id : world.one('at', id) ?? id;
    const company = this.campaign.playerActor ?? 'party';
    let told = '';
    for (const [passage, to] of Journey.way(world, this.at(company)!, target, company)) {
      const command = `go(${passage},${to})`;
      if (!this.choices().some(c => c.command === command)) {
        throw Journey.unoffered(`No way on by ${passage} to ${to} at watch ${this.watch()}`);
      }
      told += await this.perform(command, `>${to}`);
    }
    return told;
  }
  // The ways to take, passage by passage, from one place to another, by the fewest the company can take now: not one
  // it does not know of, nor one that needs what it has not, nor one barred, unopened or kept against it (Liberty of
  // the Ice's 18 and 27: the router each adventure copied walked a thief down a climb, and through a barred door).
  static way(world: World, start: string, target: string, company = 'party'): [string, string][] {
    const links = world.related('connects'), came = new Map<string, [string, string]>([[start, ['', '']]]);
    for (const queue = [start]; queue.length && !came.has(target);) {
      const here = queue.shift()!;
      for (const l of links.filter(r => r.args[1] === here && !came.has(r.args[2]!)
        && Journey.usable(world, r.args[0]!, company))) {
        came.set(l.args[2]!, [here, l.args[0]!]); queue.push(l.args[2]!);
      }
    }
    if (!came.has(target)) { throw Journey.unoffered(`No way from ${start} to ${target}`); }
    const steps: [string, string][] = [];
    for (let at = target; at !== start; at = came.get(at)![0]) { steps.unshift([came.get(at)![1], at]); }
    return steps;
  }
  private static usable(world: World, way: string, company: string): boolean {
    const call = ModuleWriter.call;
    return world.test(call('equippedFor', company, way)) && world.test(call('visibleTo', way, company))
      && !world.test(call('barredFor', way, company)) && !world.test(call('unopened', way))
      && !world.test(call('watchedAgainst', way, company));
  }
  // A choice waited for until it is offered and comes off: a way until the company is through it, anything else
  // once it has been done (a purchase written with it was bought again and again: Hessel friction 16).
  private async through(pattern: string): Promise<string> {
    for (let tries = 0; tries < 12 && this.campaign.running; tries++) {
      const here = this.at(this.campaign.playerActor ?? 'party'), c = this.offers(pattern) ? this.chosen(pattern) : undefined;
      if (c) {
        const told = await this.perform(c.command, c.label);
        const way = /^(go|travel)\b/.test(c.command);
        if (!way || this.at(this.campaign.playerActor ?? 'party') !== here) { return told; }
      }
      await this.step('^Wait › A while');
    }
    throw Journey.unoffered(`Never got through /${pattern}/`);
  }
  private static leaves(list: Choice[], trail = ''): { label: string; command: string; grave?: string }[] {
    return list.flatMap(c => c.children ? this.leaves(c.children, `${trail}${c.label} › `)
      : c.command ? [{ label: trail + c.label, command: c.command, ...c.grave ? { grave: c.grave } : {} }] : []);
  }
  private static acts(acts: { label: string; command?: string; children?: { label: string; command?: string }[] }[],
    trail: string): { label: string; command: string }[] {
    return acts.flatMap(a => a.children ? this.acts(a.children, `${trail}${a.label} › `)
      : a.command ? [{ label: trail + a.label, command: a.command }] : []);
  }
}
