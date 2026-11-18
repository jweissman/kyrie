#!/usr/bin/env bun
// Travel over generated worlds (the owner's trust contracts, 18 November, E, F and G): journeys of six to eight hexes
// from where a life begins, each made as the page makes one (travel:place, Travel.go, leg by leg), set out on again
// after every stop until it arrives or there is no way on. For each leg: where the company came to, the minutes it
// took, whether the map it knows grew there, and whether the journey stopped; for each stop, why, and its class:
//   mandatory   a fight, a hurt, a way that will not let it by, danger where it came, night, weariness, hunger
//   discovery   something staged where it came, seen for the first time
//   incident    something said where it came (a traveller met, a call from a door), the stop's gist its first words
//   background  anything else the journey stopped for
// and whether it led to anything: a decision (an act offered there that was offered at no place before on the
// journey), danger (a fight or a hurt), or a discovery (a perception of kind discovery, or a place newly known).
// Also the measures of F: minutes per hex by road and off it, rations eaten, weariness and hunger come on.
//   bun scripts/travel-census.ts [world/race/calling,...] [--journeys 3] [--json]
import { PlayTool } from '../src/cli/play-tool';
import { Travel } from '../src/session/travel';
import { Runner } from '../src/cli/runner';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { Itineraries } from '../src/ui/itinerary';
import { JourneyCourse } from '../web/reader/journey-course';
import type { Campaign, CampaignEvent } from '../src/campaign/campaign';
import type { Screen } from '../src/ui/screen-types';

type Class = 'mandatory' | 'discovery' | 'incident' | 'background';
interface LegRow { to: string; minutes: number; cell?: number; from?: number; span: number; known: number; grew: number;
  road: boolean; cover?: string; stopped?: string }
interface Stop { why: string; class: Class; acts: string[]; decision: boolean; danger: boolean; discovery: boolean;
  at: string }
interface Made { world: string; to: string; hexes: number; legs: LegRow[]; stops: Stop[]; passed: string[];
  arrived: boolean; minutes: number; rations: number; weary: boolean; hungry: boolean; ended: string }

export class TravelCensus {
  static readonly mandatory = new RegExp(['set upon', 'did not get by', 'hurt', 'danger', 'will not let', 'cannot move',
    'no coming back', 'Night', 'weary', 'hungry', 'Water lies'].join('|'));
  static classify(why: string): Class {
    if (this.mandatory.test(why)) { return 'mandatory'; }
    if (/going on here/.test(why)) { return 'discovery'; }
    return /said to you|^[A-Z‘'"]/.test(why) ? 'incident' : 'background';
  }
  static screen(c: Campaign): Screen { return ScreenModel.build(c); }
  // The journeys of six to eight hexes the map would lay from here, by the engine's own plans (destinations, roads,
  // the places around), nearest that length first; failing any so far, the farthest.
  static far(c: Campaign, n: number): { id: string; name: string; hexes: number }[] {
    const s = this.screen(c), all = [...s.destinations ?? [], ...s.roads ?? [], ...s.around ?? [], ...s.mapped ?? []];
    const seen = new Set<string>(), out: { id: string; name: string; hexes: number }[] = [];
    for (const d of all) {
      if (seen.has(d.id)) { continue; }
      seen.add(d.id);
      const cells = JourneyCourse.planned(s as never, d.id);
      if (cells && cells.length > 1) { out.push({ id: d.id, name: d.name, hexes: cells.length - 1 }); }
    }
    const fit = out.filter(x => x.hexes >= 6 && x.hexes <= 8);
    return [...(fit.length ? fit : out.sort((a, b) => b.hexes - a.hexes)).slice(0, n), ...this.open(c, s, n)];
  }
  // And stretches of open country six to eight hexes off, as one chosen on the map, at bearings apart: the way there
  // laid by the engine (Itineraries.plan), its hexes the cells the map would walk.
  static open(c: Campaign, s: Screen, n: number): { id: string; name: string; hexes: number }[] {
    const land = s.region?.land, here = land?.here;
    if (!land || here === undefined) { return []; }
    const w = land.width, far = this.crow.bind(this, w, here);
    const cells = Object.entries(land.goes ?? {}).map(([k, id]) => ({ cell: Number(k), id }))
      .filter(x => far(x.cell) >= 6 && far(x.cell) <= 8 && /__t\d+$/.test(x.id));
    const out: { id: string; name: string; hexes: number }[] = [], bearings = new Set<number>();
    for (const x of cells) {
      const dy = Math.floor(x.cell / w) - Math.floor(here / w);
      const b = Math.round(Math.atan2(dy, x.cell % w - here % w) / (Math.PI / 3));
      if (bearings.has(b) || out.length >= n) { continue; }
      const plan = Itineraries.plan(c, x.id);
      if (!plan?.legs.length || plan.toward) { continue; }
      bearings.add(b);
      out.push({ id: x.id, name: `open country at ${x.cell}`, hexes: Math.round(far(x.cell)) });
    }
    return out;
  }
  // How many hexes a leg went, as the crow flies between the cells it left and came to (a march-stone's new country
  // counted as one).
  static span(a?: { width: number; here?: number }, b?: { width: number; here?: number }): number {
    if (!a || !b || a.here === undefined || b.here === undefined) { return 0; }
    if (a.width !== b.width) { return 1; }
    const w = a.width, ax = a.here % w, ay = Math.floor(a.here / w), bx = b.here % w, by = Math.floor(b.here / w);
    const [p, q, r] = this.cube(ax, ay), [u, v, t] = this.cube(bx, by);
    return Math.max(Math.abs(p! - u!), Math.abs(q! - v!), Math.abs(r! - t!));
  }
  // Offset rows, odd rows shoved right (as the board draws them), in cube coordinates.
  static cube(x: number, y: number): number[] { const q = x - (y - (y & 1)) / 2; return [q, y, -q - y]; }
  static crow(width: number, here: number, a: number): number {
    return Math.hypot(a % width - here % width, Math.floor(a / width) - Math.floor(here / width));
  }
  static rations(c: Campaign): number {
    const w = c.world, g = c.playerActor!;
    return w.module.measures.some(m => m.name === 'quantity') ? w.number(ModuleWriter.call('quantity', g, 'rations')) : 0;
  }
  static holds(c: Campaign, name: string): boolean {
    return c.world.relates(name) && c.world.test(ModuleWriter.call(name, c.playerActor!));
  }
  static knownPlaces(c: Campaign): number {
    return c.world.relates('knows') ? c.world.related('knows').filter(r => r.args[0] === c.playerActor).length : 0;
  }
  static async journey(world: string, session: PlaySession, to: { id: string; name: string; hexes: number })
    : Promise<Made> {
    const c = session.campaign, made: Made = { world, to: to.name, hexes: to.hexes, legs: [], stops: [], passed: [],
      arrived: false,
      minutes: 0, rations: this.rations(c), weary: false, hungry: false, ended: '' };
    const offeredBefore = new Set([...new Runner(session).said('arrive').offer.primary,
      ...new Runner(session).said('arrive').offer.rest].map(o => o.id));
    const start = c.readout.elapsed;
    for (let tries = 0; tries < 12; tries++) {
      const was = this.knownPlaces(c), legs: LegRow[] = [];
      // Each leg as PlaySession.leg makes it (Travel.go, the fight the census's own), read as it lands.
      const done = await Travel.go({ campaign: c, perform: this.leg.bind(this, session, legs) }, to.id);
      made.legs.push(...legs);
      made.passed.push(...done.legs.flatMap(l => l.passed ? [l.passed] : []));
      if (done.arrived) { made.arrived = true; made.ended = 'arrived'; break; }
      if (!done.stopped) { made.ended = 'stopped, no reason'; break; }
      if (legs.length) { legs.at(-1)!.stopped = done.stopped; }
      const last = done.legs.at(-1)?.event;
      // A decision: something here that asks anything of the player, as Travel reckons it (Travel.weighty, the glance's
      // aspects); and the acts here not offered before on the journey, for the record.
      const said = new Runner(session).said('arrive'), all = [...said.offer.primary, ...said.offer.rest];
      const fresh = all.filter(o => !['go', 'journey', 'wait'].includes(o.type) && !offeredBefore.has(o.id));
      for (const o of all) { offeredBefore.add(o.id); }
      const decision = Travel.weighty(c), acts = fresh.slice(0, 3).map(o => `${o.label} {${o.aspects.join(',')}}`);
      const danger = !!last && (!!last.prelude || last.combat.length > 0) || /hurt|danger|set upon/.test(done.stopped);
      const discovery = !!last?.perceptions?.some(p => p.kind === 'discovery') || this.knownPlaces(c) > was;
      made.stops.push({ why: done.stopped, class: this.classify(done.stopped), acts, decision, danger, discovery,
        at: this.screen(c).place.name });
      if (c.readout.outcome && c.readout.outcome !== 'active') { made.ended = 'the end'; break; }
      if (/no way|cannot move|no coming back|did not get by|will not let/.test(done.stopped)) {
        made.ended = done.stopped; break;
      }
      // A fight is the player's; the census's company fights it out by its tactics (PlaySession.auto), and sleeps where
      // night or weariness stops it, as a player would.
      if (/Night|weary/.test(done.stopped)) { await this.sleep(session); }
    }
    made.minutes = (c.readout.elapsed - start) * 10;
    made.rations -= this.rations(c);
    made.weary = this.holds(c, 'weary'); made.hungry = this.holds(c, 'hungry');
    return made;
  }
  // A leg as PlaySession.leg makes it, read as it lands: where it came, the minutes, the land it knew.
  static async leg(session: PlaySession, legs: LegRow[], command: string): Promise<CampaignEvent> {
    const c = session.campaign, before = this.screen(c).region?.land, from = c.readout.elapsed;
    const event = await session.perform(command);
    const land = this.screen(c).region?.land;
    legs.push({ to: this.screen(c).place.name, minutes: (c.readout.elapsed - from) * 10, cell: land?.here,
      from: before?.here, span: this.span(before, land), known: land?.known.length ?? 0,
      grew: (land?.known.length ?? 0) - (before?.known.length ?? 0), road: /road/i.test(command),
      cover: land && land.here !== undefined ? land.cover[land.here] : undefined });
    return event;
  }
  static async sleep(session: PlaySession): Promise<void> {
    const c = session.campaign, rest = PlayerView.choices(c).find(x => /^(camp|sleep|rest)/.test(x.choice.id));
    if (rest) { await session.perform(rest.choice.id); }
  }
  static async world(spec: string, n: number): Promise<Made[]> {
    const [world, race = 'human', calling = 'warrior'] = spec.split('/');
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', world!, '--as', `${race}/${calling}/Wenna`]));
    const start = journey.session.checkpoint(), out: Made[] = [];
    for (const to of this.far(journey.session.campaign, n)) {
      const session = PlaySession.resume(structuredClone(start));
      out.push(await this.journey(spec, session, to).catch(e => ({ world: spec, to: to.name, hexes: to.hexes, legs: [],
        stops: [], passed: [], arrived: false, minutes: 0, rations: 0, weary: false, hungry: false, ended: `error: ${e}` })));
    }
    return out;
  }
  static classed(all: Made[], k: Class): number {
    return all.reduce((n, m) => n + m.stops.filter(s => s.class === k).length, 0);
  }
  static hexes(xs: LegRow[]): number { return xs.reduce((n, l) => n + l.span, 0); }
  static pace(xs: LegRow[]): number {
    return this.hexes(xs) ? Math.round(xs.reduce((n, l) => n + l.minutes, 0) / this.hexes(xs)) : 0;
  }
  static summary(all: Made[]): string[] {
    const lines: string[] = [], by = this.classed.bind(this, all);
    const stops = all.flatMap(m => m.stops), legs = all.flatMap(m => m.legs);
    lines.push(`${all.length} journeys, ${legs.length} legs, ${stops.length} stops `
      + `(${(stops.length / Math.max(1, all.length)).toFixed(1)} a journey; one every ${(legs.length / Math.max(1, stops.length)).toFixed(1)} legs)`);
    lines.push(`  told on the way, not stopping: ${all.reduce((n, m) => n + m.passed.length, 0)}`);
    lines.push(`  by class: mandatory ${by('mandatory')}, discovery ${by('discovery')}, incident ${by('incident')}, background ${by('background')}`);
    lines.push(`  led to: a decision ${stops.filter(s => s.decision).length}, danger ${stops.filter(s => s.danger).length}, `
      + `a discovery ${stops.filter(s => s.discovery).length}, nothing ${stops.filter(s => !s.decision && !s.danger && !s.discovery).length}`);
    const moved = legs.filter(l => l.span > 0), long = moved.filter(l => l.span > 1);
    const hexes = this.hexes.bind(this);
    lines.push(`  legs over more than one hex ${long.length}/${moved.length}, holding ${hexes(long)} of ${hexes(moved)} hexes `
      + `(longest ${Math.max(0, ...long.map(l => l.span))}); legs where the known land grew ${legs.filter(l => l.grew > 0).length}`);
    const pace = this.pace.bind(this);
    const covers = [...new Set(moved.filter(l => !l.road).map(l => l.cover ?? '?'))];
    lines.push(`  minutes a hex: by road ${pace(moved.filter(l => l.road))} (${hexes(moved.filter(l => l.road))} hexes), `
      + `off it ${pace(moved.filter(l => !l.road))} (${hexes(moved.filter(l => !l.road))}); off it by cover: `
      + covers.map(k => `${k} ${pace(moved.filter(l => !l.road && (l.cover ?? '?') === k))}`).join(', '));
    lines.push(`  rations eaten ${all.reduce((n, m) => n + m.rations, 0)}; weary at the end ${all.filter(m => m.weary).length}, `
      + `hungry ${all.filter(m => m.hungry).length}; arrived ${all.filter(m => m.arrived).length}/${all.length}`);
    return lines;
  }
  static async main(argv: string[]): Promise<number> {
    const n = Number(argv[argv.indexOf('--journeys') + 1] || 3), json = argv.includes('--json');
    const specs = (argv.find(a => !a.startsWith('--') && !/^\d+$/.test(a))
      ?? 'a1/human/warrior,b2/elf/mage,kite/dwarf/cleric,thorn/human/ranger,iscoed/human/warrior').split(',');
    const all: Made[] = [];
    for (const spec of specs) {
      const made = await this.world(spec, n).catch(e => { console.log(`${spec}: not begun: ${e}`); return [] as Made[]; });
      for (const m of made) {
        console.log(`${m.world} → ${m.to} (${m.hexes} hexes): ${m.legs.length} legs, ${m.minutes} min, `
          + `${m.stops.length} stops; ${m.ended}`);
        for (const p of m.passed) { console.log(`    passed     ${p}`); }
        for (const s of m.stops) {
          console.log(`    ${s.class.padEnd(10)} ${s.why} @ ${s.at}${s.decision ? ' [decision]' : ''}`
            + `${s.danger ? ' [danger]' : ''}${s.discovery ? ' [discovery]' : ''}`);
          if (s.acts.length) { console.log(`        new: ${s.acts.slice(0, 3).join('; ')}`); }
        }
      }
      all.push(...made);
    }
    for (const l of this.summary(all)) { console.log(l); }
    if (json) { console.log(JSON.stringify(all)); }
    return 0;
  }
}
if (import.meta.main) { process.exit(await TravelCensus.main(process.argv.slice(2))); }

