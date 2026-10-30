import type { PlaySession } from '../session/play-session';
import type { CampaignEvent } from '../campaign/campaign';
import { PlayerView } from '../presentation/player-view';
import { DangerSense } from '../presentation/danger-sense';
import { Travel } from '../session/travel';
import { Countries, type Country } from '../world/countries';
import { WorldGrid } from '../world/world-grid';
import { Borders, type Side } from '../world/land/borders';
import { ModuleWriter } from '../lang/module-writer';
import { AutoplayRun, type Protagonist } from './run';
import { AutoPlayer } from './player';
import { Invariants } from './invariants';

// One authored country on the tour: where it lies and the country it is entered from; what the company was told of
// it and where; when it came in by its own road, and what it saw there; or why it did not.
export interface Visit {
  country: string; name: string; cell: string; way: string; told: { at: string; text: string }[];
  entered?: { command: number; hour: number; scene: string }; stopped?: string;
}
export interface TourResult {
  seed: string; visits: Visit[]; commands: number; fights: { won: number; lost: number; fled: number };
  hours: number; regions: string[]; ended: boolean; ms: number;
  // What play must keep true, at the end: every creature as the rules allow, and the game kept and opened again the
  // same game, every country in it.
  kept: string[];
}

// A career through every authored country of one world, by the game's own commands: a company that hears of each
// where the folk tell of it, goes there by the ways it knows, over each march and in by the country's own road,
// looks about, and goes back out for the next, nearest first. Between, it does what a careful player does: pays a
// demand it can, takes on a fight the page reckons it can win and goes back from one it cannot, rests through the
// night and its hurts. Nothing is put anywhere: where it cannot go on, the tour says what stopped it.
export class Tour {
  private commands = 0;
  private readonly fights = { won: 0, lost: 0, fled: 0 };
  private readonly plan: Map<string, Country>;
  private constructor(private readonly s: PlaySession, seed: string, private readonly budget: number) {
    const first = s.campaign.world.one('terrain', 'region__region')?.replace(/^.*__/, '') ?? '';
    this.plan = Countries.plan(seed, first);
  }
  // Each country's visit is said as it ends, when asked (a long tour had run an hour with nothing to show).
  static async run(seed: string, protagonist: Protagonist, budget = 4000,
    said?: (v: Visit) => void): Promise<TourResult> {
    const began = Date.now();
    const s = await AutoplayRun.start({ seed, origin: 'wanderer', protagonist, policy: 'intent', steps: budget });
    const tour = new Tour(s, seed, budget), visits: Visit[] = [], heard = await tour.further();
    for (let left = [...tour.plan]; left.length && tour.going(); ) {
      const [cell, country] = tour.nearest(left);
      left = left.filter(([id]) => id !== cell);
      visits.push(await tour.visit(cell, country, heard.get(country.id) ?? []));
      said?.(visits.at(-1)!);
    }
    const c = s.campaign, kept = [...Invariants.creatures(s), ...Invariants.roundtrip(s)].map(v => v.message);
    return { seed, visits, commands: tour.commands, fights: tour.fights, regions: [...c.installed].filter(id =>
      WorldGrid.at(id)), hours: Math.round(c.world.number(ModuleWriter.call('watch', 'clock')) / 6), ended: !c.running,
    ms: Date.now() - began, kept };
  }
  private going(): boolean { return this.s.campaign.running && this.commands < this.budget; }
  private visit(cell: string, country: Country, told: Visit['told']): Promise<Visit> {
    const at = WorldGrid.at(cell)!, way = WorldGrid.next(at, Borders.opposite[country.side]);
    const visit: Visit = { country: country.id, name: country.name, cell, way: WorldGrid.id(...way), told: [...told] };
    return this.go(visit, country).then(() => visit);
  }
  private async go(visit: Visit, country: Country) {
    if (this.plan.has(this.region()) && !await this.leave()) { visit.stopped = this.why ?? 'stopped'; return; }
    for (const [from, side] of this.route(WorldGrid.at(visit.way)!)) {
      if (!await this.cross(from, side)) { visit.stopped = this.why ?? 'stopped'; return; }
    }
    visit.told.push(...await this.hear(new RegExp(`^${visit.way}__edge_${country.side}_beyond_told_`)));
    if (!await this.cross(WorldGrid.at(visit.way)!, country.side, `${visit.cell}__${country.entry}`)) {
      visit.stopped = this.why ?? 'stopped'; return;
    }
    const c = this.s.campaign, scene = PlayerView.observe(c).observations.map(o => o.text).join(' ');
    visit.entered = { command: this.commands, hour: Math.round(c.world.number(ModuleWriter.call('watch', 'clock')) / 6),
      scene: scene.slice(0, 400) };
    await this.perform(this.offered().find(id => /^wait/.test(id)) ?? this.offered()[0]!);
  }
  // What the folk of the first country say of those further off, asked before setting out: by country.
  private async further(): Promise<Map<string, Visit['told']>> {
    const heard = new Map<string, Visit['told']>();
    for (const [, country] of this.plan) {
      const told = await this.hear(new RegExp(`^region__edge_\\w+_further_told_`), country.name);
      if (told.length) { heard.set(country.id, told); }
    }
    return heard;
  }
  private why?: string;
  // Over the march on one side of a country: to its march-stone by the ways the company knows, then across by the
  // road over (into the room named, or the march-stone facing).
  private async cross(at: [number, number], side: Side, into?: string): Promise<boolean> {
    const here = WorldGrid.id(...at), next = WorldGrid.id(...WorldGrid.next(at, side));
    if (this.region() === next) { return true; }
    if (this.region() !== here) { this.why = `in ${this.region()}, not ${here}`; return false; }
    if (!await this.reach(`${here}__edge_${side}`)) { return false; }
    const target = into ?? `${next}__edge_${Borders.opposite[side]}`;
    const over = this.offered().find(id => id.startsWith('go(link') && id.endsWith(`,${target})`));
    if (!over) { this.why = `no road over the march ${side} of ${here}`; return false; }
    await this.perform(over);
    return this.s.campaign.world.one('at', 'party') === target;
  }
  // Out of an authored country by the road it was come into by, from wherever in it the company is.
  private async leave(): Promise<boolean> {
    const c = this.s.campaign, road = c.world.related('connects').find(r => r.args[0]!.startsWith('link')
      && r.args[1]!.startsWith(`${this.region()}__`));
    if (!road || !await this.reach(road.args[1]!)) { this.why = `no way out of ${this.region()}`; return false; }
    const out = this.offered().find(id => id.startsWith(`go(${road.args[0]},`));
    if (!out) { this.why = `no way out of ${this.region()}`; return false; }
    await this.perform(out);
    return true;
  }
  private region(): string { return (this.s.campaign.world.one('at', 'party') ?? '').replace(/__.*$/, ''); }
  // The countries to cross to come to a country, from the one the company is in: by countries drawn from the seed.
  private route(to: [number, number]): [[number, number], Side][] {
    const start = WorldGrid.at(this.region()) ?? [0, 0], goal = WorldGrid.id(...to);
    const came = new Map<string, [[number, number], Side] | null>([[WorldGrid.id(...start), null]]);
    for (const queue = [start]; queue.length && !came.has(goal);) {
      const at = queue.shift()!;
      for (const side of Borders.sides) {
        const next = WorldGrid.next(at, side), id = WorldGrid.id(...next);
        const far = Math.abs(next[0]) + Math.abs(next[1]) > 8;
        if (came.has(id) || (this.plan.has(id) && id !== goal) || far) { continue; }
        came.set(id, [at, side]); queue.push(next);
      }
    }
    const hops: [[number, number], Side][] = [];
    for (let at = to; came.get(WorldGrid.id(...at));) {
      const [from, side] = came.get(WorldGrid.id(...at))!;
      hops.unshift([from, side]); at = from;
    }
    return hops;
  }
  private nearest(left: [string, Country][]): [string, Country] {
    return [...left].sort((a, b) => this.length(a) - this.length(b))[0]!;
  }
  private length([cell, c]: [string, Country]): number {
    return this.route(WorldGrid.next(WorldGrid.at(cell)!, Borders.opposite[c.side])).length;
  }
  // Goes to someone who tells of a country and asks: what they said, where.
  private async hear(topic: RegExp, about?: string): Promise<{ at: string; text: string }[]> {
    const c = this.s.campaign, asked = c.module.actions.find(a => topic.test(a.id) && a.speaker
      && (!about || JSON.stringify(a).includes(about)));
    const room = asked && c.world.one('at', asked.speaker!);
    if (!asked || !room || !await this.reach(room)) { return []; }
    const choice = this.offered().find(id => id.includes(asked.id));
    if (!choice) { return []; }
    const said = (await this.perform(choice)).response ?? '';
    return [{ at: room, text: said }];
  }
  // To a place by the ways the company knows, journey after journey, meeting what stops it; where it knows no way
  // (a taproom off a green it has not been in), a step at a time by the ways the page offers.
  private async reach(place: string): Promise<boolean> {
    for (let tries = 0; tries < 40 && this.going(); tries++) {
      const done = await Travel.go({ campaign: this.s.campaign, perform: this.perform.bind(this) }, place);
      if (done.arrived || this.s.campaign.world.one('at', 'party') === place) { return true; }
      this.why = done.stopped;
      if (/^You know no way on/.test(done.stopped ?? '') && !await this.step(place)) { return false; }
      else if (!/^You know no way on/.test(done.stopped ?? '')) { await this.answer(); }
    }
    return false;
  }
  // The next of the ways offered here that leads toward a place, taken.
  private async step(place: string): Promise<boolean> {
    const world = this.s.campaign.world, here = world.one('at', 'party')!, links = world.related('connects');
    const came = new Map<string, string>([[here, '']]);
    for (const queue = [here]; queue.length && !came.has(place);) {
      const at = queue.shift()!;
      for (const l of links.filter(r => r.args[1] === at && !came.has(r.args[2]!))) {
        came.set(l.args[2]!, at === here ? `go(${l.args[0]},${l.args[2]})` : came.get(at)!); queue.push(l.args[2]!);
      }
    }
    const first = came.get(place);
    if (!first || !this.offered().includes(first)) { return false; }
    await this.perform(first);
    return true;
  }
  // What a careful player does where a journey stopped.
  private async answer() {
    const offered = this.offered(), c = this.s.campaign;
    const demand = offered.find(id => AutoPlayer.kinds.yield!.test(id));
    if (demand) { await this.perform(demand); return; }
    const fights = offered.filter(id => AutoPlayer.kind(id) === 'fight');
    const winnable = fights.find(id => { const g = /^\w+\(([^,)]+)/.exec(id)?.[1];
      return !['grave', 'deadly'].includes((g && DangerSense.reckon(c, g)?.danger) || ''); });
    if (winnable) { await this.perform(winnable); return; }
    const rest = offered.find(id => /^(take_lodging|rest|make_camp|camp|sleep|wait_for_light)/.test(id));
    if (rest && (Travel.dark(c) || this.hurt())) { await this.perform(rest); return; }
    await this.perform(offered.find(id => /^wait/.test(id)) ?? offered[0]!);
  }
  private hurt(): boolean {
    const c = this.s.campaign, ids = c.readout.partyIds;
    return c.readout.creatures.some(x => ids.includes(x.id) && x.state.hp < x.base.maxHp);
  }
  private offered(): string[] { return PlayerView.choices(this.s.campaign).map(x => x.choice.id); }
  private async perform(command: string): Promise<CampaignEvent> {
    this.commands++;
    const event = await this.s.perform(command);
    for (const end of event.combat.filter(e => e.type === 'end')) {
      if (end.type !== 'end') { continue; }
      if (end.outcome === 'fighters') { this.fights.won++; } else if (end.outcome === 'escaped') { this.fights.fled++; }
      else { this.fights.lost++; }
    }
    return event;
  }
}
