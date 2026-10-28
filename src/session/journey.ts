import { PlaySession } from './play-session';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import type { BundleSource } from '../campaign/bundle-source';
import type { CampaignEvent } from '../campaign/campaign';
import type { CreatureGenerationContext } from '../content';
import { ModuleWriter } from '../lang/module-writer';
import { ScreenModel } from '../ui/screen-model';
import type { Screen } from '../ui/screen-types';
import type { World } from '../lang/world';
import { ChoiceList, type Choice } from '../ui/choice-list';
import { PlayerView } from '../presentation/player-view';
import { Narrator } from '../presentation/narrator';
import { ActionFeedbackView } from '../presentation/action-feedback';

// A choice the page offers, as an author names it in a step: its label ("Examine › Push and pull at it", "Pack › A
// torch › Light", "a torch: Light"), and the same under the heading it is offered beneath ("the Sleeper's left
// eyelid: Examine › Push and pull at it"), so that two things' alike choices can be told apart by name.
// A choice that cannot be undone says so (grave): the page asks before it does it, and a journey says it was asked.
export interface Offered { label: string; full: string; command: string; grave?: string }
// One step taken: what was asked, the choice it took, what came back (the event's perceptions and response), and
// what the page told of it (the narrator's lines). JOURNEY_TRACE=1 prints each step as the page told it.
export interface Taken {
  label: string; command: string; told: string; page: string; event: CampaignEvent; grave?: string;
}

// A game played by the labels a player sees, as every adventure's journeys are (Thrume, The House That Grows, The
// Road the Star Came Down, The Patient Star each wrote one of these before it was shipped). A step is a pattern for
// the choice to take, matched against each label and then each label under its heading, or one of:
//   ?pattern   take it if it is offered, and go on if not
//   @command   perform a command by its id
//   =N         wait until watch N, an hour at a time while six or more away, a while at a time after
//   =+N        wait N watches more
//   ~N         wait until watch N by dark and first light (an hour when neither is offered)
//   ~pattern   a way that is not open yet: wait a while and try again, up to twelve times
//   >place     go to a place by the shortest way the world joins them, a way at a time (a place of a generated
//              world's first region by its own id, z3_deep; any other by its whole id); or to where someone is
export class Journey {
  readonly taken: Taken[] = [];
  // The page as last built, and the world and log it was built of: a step reads the page to find its choice, and
  // again to tell what came of it, and a wait reads it up to three times; the page is the same until either changes.
  private built?: { world: World; length: number; last?: CampaignEvent; screen: Screen };
  private constructor(readonly session: PlaySession) {}
  static async start(campaign: string, seed = 'journey', options: { source?: BundleSource;
    party?: CreatureGenerationContext[] } = {}): Promise<Journey> {
    const source = options.source ?? NodeBundleSource.shared;
    return new Journey(await PlaySession.start(campaign, seed, source, options.party));
  }
  static of(session: PlaySession): Journey { return new Journey(session); }
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
  find(pattern: string): Offered | undefined {
    const re = new RegExp(pattern, 'i'), all = this.choices();
    return all.find(c => re.test(c.label)) ?? all.find(c => re.test(c.full)) ?? Journey.named(pattern, all);
  }
  // "register: Take" for "the register of names: Take": a thing called by part of its name, then what is done with it
  // (a step had to quote an item's whole name: Liberty of the Ice friction 19).
  private static named(pattern: string, all: Offered[]): Offered | undefined {
    const at = pattern.indexOf(': ');
    if (at < 1) { return undefined; }
    const thing = new RegExp(pattern.slice(0, at), 'i'), act = new RegExp(`^${pattern.slice(at + 2)}`, 'i');
    return all.find(c => [c.label, c.full].some(l => [...l.matchAll(/: /g)]
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
    const wait = /^(=\+|=|~)(\d+)$/.exec(step);
    if (wait) {
      const n = Number(wait[2]);
      return this.until(wait[1] === '=+' ? this.watch() + n : n, wait[1] === '~');
    }
    if (step.startsWith('@')) { return this.perform(step.slice(1), step); }
    if (step.startsWith('~')) { return this.through(step.slice(1)); }
    if (step.startsWith('>')) { return this.go(step.slice(1)); }
    const optional = step.startsWith('?'), c = this.find(optional ? step.slice(1) : step);
    if (!c && optional) { return ''; }
    if (!c) { throw new Error(`No /${step}/ at watch ${this.watch()} among ${this.choices().map(x => x.label).join(' | ')}`); }
    return this.perform(c.command, c.label, c.grave);
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
    this.taken.push({ label, command, told, page, event, ...grave ? { grave } : {} });
    if (process.env.JOURNEY_TRACE) { console.log(`[${label}] ${page}`); }
    return told;
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
  private async until(watch: number, long: boolean): Promise<string> {
    let told = '';
    while (this.campaign.running && this.watch() < watch) {
      const pick = long ? this.find('^Wait › Until dark') ?? this.find('^Wait › Until first light')
        : this.find(watch - this.watch() >= 6 ? '^Wait › An hour' : '^Wait › A while');
      const c = pick ?? this.find('^Wait › An hour');
      if (!c) { throw new Error(`Nothing to wait by at watch ${this.watch()}`); }
      told += await this.perform(c.command, c.label);
    }
    return told;
  }
  private async go(place: string): Promise<string> {
    const world = this.campaign.world, id = world.module.entities.some(e => e.id === place) ? place : `region__${place}`;
    // Someone, or something, is gone to where they are.
    const target = world.module.entities.find(e => e.id === id)?.type === 'place' ? id : world.one('at', id) ?? id;
    let told = '';
    for (const [passage, to] of Journey.way(world, this.at(this.campaign.playerActor ?? 'party')!, target)) {
      told += await this.perform(`go(${passage},${to})`, `>${to}`);
    }
    return told;
  }
  // The ways to take, passage by passage, from one place to another, by the fewest.
  static way(world: World, start: string, target: string): [string, string][] {
    const links = world.related('connects'), came = new Map<string, [string, string]>([[start, ['', '']]]);
    for (const queue = [start]; queue.length && !came.has(target);) {
      const here = queue.shift()!;
      for (const l of links.filter(r => r.args[1] === here && !came.has(r.args[2]!))) {
        came.set(l.args[2]!, [here, l.args[0]!]); queue.push(l.args[2]!);
      }
    }
    if (!came.has(target)) { throw new Error(`No way from ${start} to ${target}`); }
    const steps: [string, string][] = [];
    for (let at = target; at !== start; at = came.get(at)![0]) { steps.unshift([came.get(at)![1], at]); }
    return steps;
  }
  // A choice waited for until it is offered and comes off: a way until the company is through it, anything else
  // once it has been done (a purchase written with it was bought again and again: Hessel friction 16).
  private async through(pattern: string): Promise<string> {
    for (let tries = 0; tries < 12 && this.campaign.running; tries++) {
      const here = this.at(this.campaign.playerActor ?? 'party'), c = this.find(pattern);
      if (c) {
        const told = await this.perform(c.command, c.label);
        const way = /^(go|travel)\b/.test(c.command);
        if (!way || this.at(this.campaign.playerActor ?? 'party') !== here) { return told; }
      }
      await this.step('^Wait › A while');
    }
    throw new Error(`Never got through /${pattern}/`);
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
