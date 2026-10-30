import type { Campaign } from '../campaign/campaign';
import type { Entity, Module, Objective } from '../lang/module';
import type { WayInfo } from '../ui/passage-model';
import { Spatial } from '../spatial';
import { ModuleWriter } from '../lang/module-writer';
import { EntityIndex } from '../lang/entity-index';
import { Affordances, type Reading } from '../ui/affordances';
import { Attending } from '../ui/attention';
import { Itineraries } from '../ui/itinerary';
import { Promotion, type Situation } from '../ui/promotion';
import { Marks } from '../ui/marks';
import { SceneModel } from '../ui/scene';
import type { Act, Screen } from '../ui/screen-types';
import { Stakes } from '../ui/stakes';
import { CompanyRecall } from './company-recall';
import { GlanceLines } from './glance-lines';
import type { Arrival, Glance as View, Promoted, Why } from './glance-types';
import { PlayerView } from './player-view';
import type { Told } from './narrator';

// What the narrator hands the glance: the lines it tells of the place now, whether the company has been here before,
// and what has changed since it was.
// opened: an opening told why the company came just before, so the first place does not say the aim again (OWN-17).
export interface Telling { kept: { id: string; text: string }[]; known: boolean; changed: string[]; opened?: boolean }
// The journey held by the host (see EngineHost.bound), and whether the game was just taken up again.
export interface Host { bound?: { id: string; name: string; minutes: number }; resumed?: boolean; elapsed?: number }

// A place at a glance (OWN-18, OWN-19): how the company came to it, its one distinctive line, a sign of life now, on a
// return what has changed, and the few choices that matter now, each with why; the quiet row of ways; and which ways
// the aims name. Decided here, from the screen, the company's own story and what the module declares, so that the page
// draws and does not guess; everything else stays where it was, a deliberate look away (Look about, Every way, More).
export class Glance {
  // What each aim names, a site's every room among them, read once for a module.
  private static readonly namings = new WeakMap<Module, Map<string, Set<string>>>();
  static of(campaign: Campaign, screen: Screen, told: Told | undefined, telling: Telling): View {
    const recall = CompanyRecall.of(campaign), here = screen.place.id;
    const arrival: Arrival = !told ? 'opening' : !told.moved ? 'stay'
      : recall.been(here) || telling.known ? 'return' : 'first';
    const lines = GlanceLines.of(campaign, screen, { arrival, recall, kept: telling.kept, changed: telling.changed });
    const scene = Attending.place(SceneModel.build(screen));
    const reading = this.reading(campaign, screen, { recall, life: lines.life?.subject, pointed: lines.pointed });
    const s: Situation = { threat: scene.subjects.some(x => SceneModel.threat(x)), warned: !!screen.warned,
      dark: !!screen.dark, settled: reading.needs.settled, open: reading.needs.open };
    const cands = Affordances.of(scene, screen, reading), acts = Promotion.pick(cands, s);
    const aim = screen.objectives[0];
    const turned = !!told?.feedback.aims?.length || !!told?.feedback.amended?.length;
    const said = aim && !(arrival === 'opening' && telling.opened)
      && (['opening', 'first', 'resume'].includes(arrival) || turned || !acts.some(a => this.serves(a.why)));
    const need = this.need(screen);
    return { arrival, ...lines.sight ? { sight: lines.sight } : {}, ...lines.life ? { life: lines.life } : {},
      changed: lines.changed, acts, ways: Promotion.ways(cands, acts, s), aimed: this.aimed(screen, reading),
      ...said ? { aim } : {}, ...need.length ? { need } : {} };
  }
  // What an author writes to be done with a thing (Change … from … to …), by the rules' kinds of it.
  static readonly changes = ['change_thing', 'change_thing_paying', 'change_thing_spending'];
  // Whether a reason serves the aim shown (not another aim held).
  private static serves(why: Why): boolean { return ['bound', 'kin', 'about', 'named', 'toward'].includes(why); }
  // The host's part: the journey set out on and not yet come to the end of is gone on with first of what the aims ask
  // ("Go on to Gaudumport"), and the game taken up again opens as a return.
  static held(glance: View, host: Host): View {
    const bound = host.bound && { choice: `travel:${host.bound.id}`, command: `travel:${host.bound.id}`,
      label: `Go on to ${host.bound.name}`, why: 'bound' as const, facets: ['here' as const, 'aimed' as const],
      tier: 1 as const, note: 'where you set out for',
      marks: Marks.journey(host.elapsed ?? 0, host.bound.minutes) ? [Marks.dusk] : [] };
    const acts = bound ? this.first(glance.acts, bound) : glance.acts;
    return { ...glance, ...host.resumed ? { arrival: 'resume' as const } : {}, acts,
      ways: glance.ways.filter(id => !acts.some(a => a.choice === id)) };
  }
  // The journey held, at the head of what the aim asks, and the rest capped again: three at most, two ways.
  private static first(acts: Promoted[], bound: Promoted): Promoted[] {
    const rest = acts.filter(a => a.choice !== bound.choice), at = rest.findIndex(a => a.tier > 0);
    const all = at < 0 ? [...rest, bound] : [...rest.slice(0, at), bound, ...rest.slice(at)];
    const ways = all.filter(a => (a.exit || a.choice.startsWith('travel:')) && a.why !== 'retreat');
    return all.filter(a => !ways.slice(2).includes(a)).slice(0, Promotion.cap);
  }
  // A journey just made, in one line: by where, and when it came there, or why it stopped.
  static came(glance: View, travel: { to: string; arrived: boolean; stopped?: string;
    legs: { place: string; at: string }[] }): View {
    const last = travel.legs.at(-1);
    if (!last) { return glance; }
    const via = [...new Set(travel.legs.slice(0, -1).map(l => l.place))].slice(-2);
    const came = travel.arrived ? `${via.length ? `By ${via.join(' and ')}, to` : 'To'} ${travel.to}: ${last.at}.`
      : travel.stopped ?? `On the way to ${travel.to}: ${last.at}.`;
    return { ...glance, came };
  }
  // The company's state, said only when something is wrong.
  private static need(screen: Screen): string[] {
    const e = screen.expedition;
    return [...e.hungry ? ['Hungry'] : [], ...e.weary ? ['Weary'] : [], ...screen.dark ? ['No light'] : [],
      ...screen.party.filter(m => m.hp < m.maxHp / 2).map(m => m.hp > 0 ? `${m.name}: ${m.hp} of ${m.maxHp}` : `${m.name}: down`)];
  }
  // Every choice that goes where the aims name: the ways, the walks about the town, the journeys known.
  private static aimed(screen: Screen, r: Reading): string[] {
    const aims = new Set([...r.named, ...r.held]);
    const journeys = [...screen.destinations ?? [], ...screen.around ?? [], ...screen.roads ?? []];
    return [...new Set([...screen.exits.filter(e => aims.has(e.destination.id) || r.toward.has(e.id)).map(e => e.id),
      ...journeys.filter(d => aims.has(d.id)).map(d => `travel:${d.id}`)])];
  }
  private static reading(campaign: Campaign, screen: Screen,
    at: { recall: CompanyRecall; life?: string; pointed: Set<string> }): Reading {
    const here = screen.place.id, recall = at.recall, rows = PlayerView.choices(campaign);
    const schema = new Map(rows.map(r => [r.choice.id, r.action.searchPlace ? 'search' : r.action.schema ?? r.action.id]));
    const args = new Map(rows.map(r => [r.choice.id, Object.entries(r.action.bindings ?? {})
      .filter(([k]) => !['actor', 'site'].includes(k)).map(([, v]) => v)]));
    const named = this.named(campaign, here);
    const held = new Set([...screen.aimed ?? []].filter(id => !named.has(id) && id !== campaign.playerActor));
    const back = recall.came && screen.exits.find(e => e.destination.id === recall.came)?.destination.id;
    const commands = this.commands(screen);
    const authored = new Set(rows.filter(r => this.changes.includes(r.action.schema ?? '')).map(r => r.choice.id));
    return { schema, args, speakers: new Set(rows.filter(r => r.action.speaker).map(r => r.choice.id)), authored,
      named, held,
      toward: this.toward(campaign, screen, { named, held }), ...back ? { back } : {}, here, signs: this.signs(campaign,
        screen, recall), ...at.life ? { life: at.life } : {}, pointed: at.pointed,
      done: new Set(commands.filter(c => recall.did(here, c))),
      talked: new Set(screen.people.map(p => p.id).filter(id => recall.talkedTo(id))),
      needs: { hungry: screen.expedition.hungry, rations: screen.purse.rations, weary: !!screen.expedition.weary,
        hurt: new Set(screen.party.filter(m => m.hp < m.maxHp / 2).map(m => m.id)),
        night: screen.expedition.daylight === 'night',
        settled: screen.path.some(p => ['settlement', 'site'].includes(p.kind)),
        open: screen.exits.some(e => !!e.bearing), ...this.bed(campaign, screen, schema) } };
  }
  // Where a bed is to be had a step from here, in a settlement at night, when no one here offers one: whoever offers
  // lodging, where they are.
  private static bed(campaign: Campaign, screen: Screen, schema: Map<string, string>): { bed?: string } {
    const w = campaign.world;
    if (screen.expedition.daylight !== 'night' || !w.relates('offers') || !w.relates('serviceOf')
      || [...schema.values()].some(k => k.startsWith('take_lodging'))) { return {}; }
    const hosts = w.related('offers').filter(r => w.test(ModuleWriter.call('serviceOf', r.args[1]!, 'lodging')));
    const rooms = new Set(hosts.map(r => w.one('at', r.args[0]!)).filter(Boolean));
    const bed = screen.exits.find(e => e.local && rooms.has(e.destination.id))?.destination.id;
    return bed ? { bed } : {};
  }
  // What the aim shown names (the one that names where the company stands, else its own errand: see Stakes.here).
  private static named(campaign: Campaign, here: string): Set<string> {
    const held = PlayerView.observe(campaign).objectives ?? [], shown = Stakes.here(campaign, held, here)[0];
    const def = shown && (campaign.module.objectives ?? []).find(o => o.id === shown.id);
    // Not the company itself, which an aim's condition names as whoever must get somewhere.
    return new Set([...def ? this.names(campaign, def) : []].filter(id => id !== campaign.playerActor));
  }
  private static names(campaign: Campaign, def: Objective): Set<string> {
    let kept = this.namings.get(campaign.module);
    if (!kept) { kept = new Map(); this.namings.set(campaign.module, kept); }
    if (!kept.has(def.id)) { kept.set(def.id, Stakes.named(campaign, def)); }
    return kept.get(def.id)!;
  }
  // The way from here toward a place an aim names (the first leg of the known way there), for the first two places the
  // aims name: when it lies in the same settlement or site, or two legs away at most. Found over the known ways (see
  // Itineraries.graph), the fewest legs first, never further afield than that. Where the aim shown names the place the
  // company stands in, no way is pointed off toward another aim held: what that aim asks is here (at the bridge the
  // father went out by, the ruts off the road, not the road to the hobs' hold: OWN-28).
  private static toward(campaign: Campaign, screen: Screen,
    aims: { named: Set<string>; held: Set<string> }): Reading['toward'] {
    const out = new Map<string, 'toward' | 'held'>(), byId = EntityIndex.of(campaign.module.entities).byId;
    const here = screen.place.id, around = new Set(Spatial.ancestry(byId, here).map(e => e.id));
    const area = [...screen.path].reverse().find(p => ['settlement', 'site'].includes(p.kind))?.id;
    const held = aims.named.has(here) ? [] : [...aims.held];
    const places = [...[...aims.named].map(id => [id, 'toward'] as const), ...held.map(id => [id, 'held'] as const)]
      .filter(([id]) => byId.get(id)?.space && !around.has(id) && !screen.exits.some(e => e.destination.id === id))
      .slice(0, 2);
    const graph = places.length ? Itineraries.graph(campaign) : new Map<string, WayInfo[]>();
    for (const [id, why] of places) {
      const near = !!area && Spatial.ancestry(byId, id).some(e => e.id === area);
      const first = this.leading(graph, { here, id, byId, ...near ? { area } : {} });
      const exit = first && screen.exits.find(e => e.destination.id === first);
      if (exit && !out.has(exit.id)) { out.set(exit.id, why); }
    }
    return out;
  }
  // The first place on the way to a place: within the area when it lies in it, two legs away at most when not.
  private static leading(graph: Map<string, WayInfo[]>,
    at: { here: string; id: string; byId: Map<string, Entity>; area?: string }): string | undefined {
    const firsts = new Map<string, string>([[at.here, '']]);
    let frontier = [at.here];
    for (let legs = 0; frontier.length && (at.area || legs < 2); legs++) {
      const next: string[] = [];
      for (const from of frontier) {
        for (const w of graph.get(from) ?? []) {
          if (firsts.has(w.to) || (at.area && !Itineraries.within(at.byId, w.to, at.area))) { continue; }
          const first = firsts.get(from) || w.to;
          if (Itineraries.within(at.byId, w.to, at.id)) { return first; }
          firsts.set(w.to, first); next.push(w.to);
        }
      }
      frontier = next;
    }
    return undefined;
  }
  // The signs perceived here not seen before, by whom or what each is of ('' for the place's own).
  private static signs(campaign: Campaign, screen: Screen, recall: CompanyRecall): Map<string, string> {
    const defs = GlanceLines.defs(campaign.module), out = new Map<string, string>();
    for (const o of screen.observed) {
      const def = defs.get(o.id.split('@')[0]!);
      if (def?.aspect !== 'sign' || recall.saw(o.id)) { continue; }
      const present = new Set([...screen.people, ...screen.things].map(t => t.id));
      const whose = GlanceLines.whose(def, o.id, present) ?? '';
      if (!out.has(whose)) { out.set(whose, o.text); }
    }
    return out;
  }
  // Every command the place offers, nested ones too.
  private static commands(screen: Screen): string[] {
    const all = [...screen.people, ...screen.things, ...screen.exits].flatMap(r => r.acts);
    return this.leaves([...all, ...screen.camp, ...screen.unplaced]);
  }
  private static leaves(acts: Act[]): string[] {
    return acts.flatMap(a => [...a.command ? [a.command] : [], ...this.leaves(a.children ?? [])]);
  }
}
