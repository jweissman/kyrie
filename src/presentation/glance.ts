import type { Campaign } from '../campaign/campaign';
import type { Call, Entity, Module, Objective, Predicate } from '../lang/module';
import type { WayInfo } from '../ui/passage-model';
import { Spatial } from '../spatial';
import { ModuleWriter } from '../lang/module-writer';
import { EntityIndex } from '../lang/entity-index';
import { Affordances, type Reading } from '../ui/affordances';
import { Attending } from '../ui/attention';
import { Itineraries } from '../ui/itinerary';
import { Headings } from '../ui/headings';
import { LandModel } from '../ui/land-model';
import { Promotion, type Situation } from '../ui/promotion';
import { Marks } from '../ui/marks';
import { SceneModel, type Scene } from '../ui/scene';
import type { Act, Screen } from '../ui/screen-types';
import { Stakes } from '../ui/stakes';
import { Undertakings } from './undertakings';
import { CompanyRecall } from './company-recall';
import { DecisionFrame } from './decision-frame';
import { GlanceLines } from './glance-lines';
import type { Arrival, Glance as View, Promoted } from './glance-types';
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
    // The aim this place is about, if one is (the priest's trouble in the crypt, not the father's errand); said on
    // coming somewhere new, at the opening and on resuming, and when the aims have changed, not on every page that
    // has nothing to do with it (the owner, OWN-53: restrained, and only what is truly held).
    const turned = !!told?.feedback.aims?.length || !!told?.feedback.amended?.length;
    // A new aim just taken up is the one said (the vault under the undercroft, found, not the father's errand again);
    // otherwise the aim followed (see Undertakings).
    const aim = told?.feedback.aims?.at(-1) ?? screen.aims?.find(a => a.followed)?.text ?? screen.objectives[0];
    // Not again beneath "A new aim" that has just said it.
    const said = aim && !(arrival === 'opening' && telling.opened) && !told?.feedback.aims?.includes(aim)
      && (['opening', 'first', 'resume'].includes(arrival) || turned);
    const need = this.need(screen), after = told && this.after(campaign, told, { screen, acts, scene });
    // The game's first page says the company's own errand as its first goal, once (the owner's play of 7 November).
    const goal = arrival === 'opening' ? screen.aims?.find(a => a.followed && a.own)?.text : undefined;
    return { arrival, ...lines.sight ? { sight: lines.sight } : {}, ...lines.life ? { life: lines.life } : {},
      changed: lines.changed, acts, ways: Promotion.ways(cands, acts, s), ...this.aimed(campaign, screen, reading),
      ...said ? { aim } : {}, ...goal ? { goal } : {}, ...need.length ? { need } : {}, ...after ? { after } : {} };
  }
  // What came of the act just done, and what it made relevant (REV-05; see DecisionFrame).
  private static after(campaign: Campaign, told: Told, at: { screen: Screen; acts: Promoted[]; scene: Scene }) {
    const choices = PlayerView.choices(campaign).map(r => ({ command: r.choice.id, label: r.choice.name,
      ...r.action.schema ? { schema: r.action.schema } : {} }));
    return DecisionFrame.after({ feedback: told.feedback, moved: told.moved, failed: told.event.result === 'failure',
      place: at.screen.place.name }, at.acts, { names: new Map(at.scene.subjects.map(x => [x.id, x.name])), choices });
  }
  // What an author writes to be done with a thing (Change … from … to …), by the rules' kinds of it.
  static readonly changes = ['change_thing', 'change_thing_paying', 'change_thing_spending'];
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
    // After what the aim is about where the company stands: a journey stopped by the fresh ruts goes on after them.
    const rest = acts.filter(a => a.choice !== bound.choice), at = rest.findIndex(a => a.tier > 0 && a.why !== 'about');
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
    // The hour ends with its own stop ("1:32 p.m."), and is not given a second ("1:32 p.m..").
    const at = last.at.replace(/\.$/, '');
    const came = travel.arrived ? `${via.length ? `By ${via.join(' and ')}, to` : 'To'} ${travel.to}: ${at}.`
      : travel.stopped ?? `On the way to ${travel.to}: ${at}.`;
    return { ...glance, came };
  }
  // The company's state, said only when something is wrong.
  private static need(screen: Screen): string[] {
    const e = screen.expedition;
    return [...e.hungry ? ['Hungry'] : [], ...e.weary ? ['Weary'] : [], ...screen.dark ? ['No light'] : [],
      ...screen.party.filter(m => m.hp < m.maxHp / 2).map(m => m.hp > 0 ? `${m.name}: ${m.hp} of ${m.maxHp}` : `${m.name}: down`)];
  }
  // Every choice that goes where the aims name: the ways, the walks about the town, the journeys known; those of the
  // aim followed first, and said apart (following), so that the page's "your aim" is that aim's and no other's. In
  // Karir's chandlery, following the crypt, the corn-store of another aim had stood alone as "your aim", the
  // churchyard's walk folded into its quarter (the fresh playtest of 7 November).
  private static aimed(campaign: Campaign, screen: Screen, r: Reading): Pick<View, 'aimed' | 'following'> {
    const byId = EntityIndex.of(campaign.module.entities).byId;
    const following = [...new Set(this.going({ screen, r, byId }, r.named, 'toward'))];
    const aimed = [...new Set([...following, ...this.going({ screen, r, byId }, r.held, 'held')])];
    return { aimed, ...following.length ? { following } : {} };
  }
  // The ways and journeys to the places some aims name, and the ways toward them.
  private static going(at: { screen: Screen; r: Reading; byId: Map<string, Entity> }, aims: Set<string>,
    why: 'toward' | 'held'): string[] {
    const { screen, r, byId } = at;
    const journeys = [...screen.destinations ?? [], ...screen.around ?? [], ...screen.roads ?? []];
    // A journey to a town or a site the aim is in goes toward it (to Elmham, for Naillil at Elmham).
    return [...screen.exits.filter(e => aims.has(e.destination.id) || r.toward.get(e.id) === why).map(e => e.id),
      ...journeys.filter(d => aims.has(d.id) || [...aims].some(id => Itineraries.within(byId, id, d.id)))
        .map(d => `travel:${d.id}`)];
  }
  private static reading(campaign: Campaign, screen: Screen,
    at: { recall: CompanyRecall; life?: string; pointed: Set<string> }): Reading {
    const here = screen.place.id, recall = at.recall, rows = PlayerView.choices(campaign);
    const schema = new Map(rows.map(r => [r.choice.id, r.action.searchPlace ? 'search' : r.action.schema ?? r.action.id]));
    const args = new Map(rows.map(r => [r.choice.id, Object.entries(r.action.bindings ?? {})
      .filter(([k]) => !['actor', 'site'].includes(k)).map(([, v]) => v)]));
    const touches = new Map(rows.map(r => [r.choice.id,
      new Set((r.action.success ?? []).flatMap(c => c.call?.args ?? []))]));
    const named = this.routed(campaign, screen, this.inside(campaign, screen, this.whereabouts(campaign, screen,
      this.named(campaign), { addresses: this.addressed(campaign) })));
    // Another aim held, and where what it names stands where the company knows the place (the notice on the green's
    // well-post: register M19-234).
    const held = this.inside(campaign, screen, this.others(campaign, screen, named));
    // Not idle where a thing an aim names still stands (the notice on the well-post, passed by unread on the way home).
    const byId = EntityIndex.of(campaign.module.entities).byId;
    const standing = new Set([...named, ...held].filter(id => byId.get(id)?.type === 'thing')
      .map(id => campaign.world.one('at', id)));
    const idle = new Set([...screen.around ?? [], ...screen.destinations ?? []].map(d => d.id)
      .concat(screen.exits.map(e => e.destination.id), [...named], [...held])
      .filter(id => recall.idle(id) && !standing.has(id)));
    const back = recall.came && screen.exits.find(e => e.destination.id === recall.came)?.destination.id;
    const commands = this.commands(screen);
    const authored = new Set(rows.filter(r => this.changes.includes(r.action.schema ?? '')).map(r => r.choice.id));
    const aim = screen.aims?.find(a => a.followed)?.text, advances = this.advances(campaign, rows);
    const holding = this.holding(campaign, named);
    return { ...aim ? { aim } : {}, ...advances.size ? { advances } : {}, holding, schema, args, touches, authored,
      speakers: new Set(rows.filter(r => r.action.speaker).map(r => r.choice.id)),
      named, held,
      ...this.ways(campaign, screen, { named, held, idle }),
      ...back ? { back } : {}, here, signs: this.signs(campaign,
        screen, recall), ...at.life ? { life: at.life } : {}, pointed: at.pointed,
      done: new Set(commands.filter(c => recall.did(here, c))),
      talked: new Set(screen.people.map(p => p.id).filter(id => recall.talkedTo(id))),
      idle,
      needs: { hungry: screen.expedition.hungry, rations: screen.purse.rations, weary: !!screen.expedition.weary,
        hurt: new Set(screen.party.filter(m => m.hp < m.maxHp / 2).map(m => m.id)),
        night: screen.expedition.daylight === 'night',
        settled: screen.path.some(p => ['settlement', 'site'].includes(p.kind)),
        open: screen.exits.some(e => !!e.bearing), alone: screen.party.length === 1,
        ...this.bed(campaign, screen, schema),
        ...this.unlit(campaign) } };
  }
  // The kinds of thing that light, when none of the company carries one or has a light going (Affordances.served).
  private static unlit(campaign: Campaign): { unlit?: Set<string> } {
    const w = campaign.world, party = campaign.playerActor;
    if (!party || !w.relates('lightsUp') || !w.relates('ownedItem')) { return {}; }
    const lights = new Set(w.related('lightsUp').map(r => r.args[0]!));
    const members = w.related('memberOf').filter(r => r.args[1] === party).map(r => r.args[0]!);
    const lit = members.some(m => w.relates('brings') && w.test(ModuleWriter.call('brings', m, 'light')))
      || w.related('ownedItem').some(r => members.includes(r.args[1]!) && lights.has(w.one('itemKind', r.args[0]!) ?? ''));
    return lit ? {} : { unlit: lights };
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
  // What the aim followed names (see Undertakings): "your aim" is that one's, and no other's.
  private static named(campaign: Campaign): Set<string> {
    const def = Undertakings.followed(campaign);
    // Not the company itself, which an aim's condition names as whoever must get somewhere.
    return new Set([...def ? this.names(campaign, def) : []].filter(id => id !== campaign.playerActor));
  }
  // Whom the aim followed names leads to where they stand, where the company knows the place: the merchant with the
  // corn-store's key, in his shop off the green, had been one face among many, and nothing on the green led to him
  // (the owner's play, 6 November: M19-86).
  // Not where the aim names a place of its own: "ask at the inn" of a debt is the inn, and the creditor named in it had
  // led back to the shop the company had just left with nothing to pay (the owner, 7 November).
  // Where the aim gives their address ("Lothar at Brockfield"), they are sought there, wherever in it they stand.
  // What the other aims held name, and where a thing one names stands, where the company knows the place (the notice
  // on the green's well-post: register M19-234). Not where the people the company has a stake in happen to be, who
  // come and go: following them had sent the page from the chapel to the churchyard and back.
  private static others(campaign: Campaign, screen: Screen, named: Set<string>): Set<string> {
    const byId = EntityIndex.of(campaign.module.entities).byId;
    const ids = new Set([...screen.aimed ?? []].filter(id => !named.has(id) && id !== campaign.playerActor));
    const things = new Set([...ids].filter(id => byId.get(id)?.type === 'thing'));
    const found = this.whereabouts(campaign, screen, things, { addresses: new Set(), many: true });
    return new Set([...ids, ...found]);
  }
  // Of many aims at once (those held), each by itself: one that names a room of its own does not keep another's thing
  // from being found where it stands.
  private static whereabouts(campaign: Campaign, screen: Screen, ids: Set<string>,
    how: { addresses: Set<string>; many?: boolean }): Set<string> {
    const byId = EntityIndex.of(campaign.module.entities).byId, addresses = how.addresses;
    if (!how.many && [...ids].some(id => byId.get(id)?.space?.kind === 'room')) { return ids; }
    const w = campaign.world, known = new Set([...screen.map.map(p => p.id),
      ...screen.exits.map(e => e.destination.id)]);
    const at = [...ids].flatMap(id => {
      const place = w.one('at', id);
      const told = !!place && Spatial.ancestry(byId, place).some(e => addresses.has(e.id));
      return place && (known.has(place) || told) && !ids.has(place) ? [place] : [];
    });
    return at.length ? new Set([...ids, ...at]) : ids;
  }
  // An aim at the place a site stands at (the heath the lone tower stands on) is, to a company inside the site, an aim
  // at the site itself: what it asks is in there, not out by the way in. In the crypt under the tower, following
  // "Something is wrong at Lapisspira", the page had led out by the postern (the fresh playtest of 7 November).
  private static inside(campaign: Campaign, screen: Screen, ids: Set<string>): Set<string> {
    const byId = EntityIndex.of(campaign.module.entities).byId, site = this.siteOf(byId, screen.place.id);
    if (!site || ids.has(site)) { return ids; }
    const fronts = new Set<string>();
    for (const r of campaign.world.related('connects')) {
      for (const [a, b] of [[r.args[1]!, r.args[2]!], [r.args[2]!, r.args[1]!]] as const) {
        if (ids.has(a) && !this.siteOf(byId, a) && this.siteOf(byId, b) === site) { fronts.add(a); }
      }
    }
    return fronts.size ? new Set([...[...ids].filter(id => !fronts.has(id)), site]) : ids;
  }
  // What, done, changes what the aim followed waits on: its effects assert or retract, or change a measure, of a
  // relation its condition reads (telling the drover's wife what was found, told(wife); giving the brothers' letter,
  // expects(priest, party)). Where the company goes is not it: every way asserts at.
  // Matched call by call, not by a relation's name: knows(party, told) is made so by being told what is out in the
  // country round, not by everything that teaches the company anything (a bed at the inn, its talk overheard, had
  // been drawn as the debt's); a rule's own unknowns (?i) stand for anything.
  private static advances(campaign: Campaign, rows: ReturnType<typeof PlayerView.choices>): Set<string> {
    const def = Undertakings.followed(campaign);
    if (!def) { return new Set(); }
    const calls = this.waits(campaign.module, def);
    if (!calls.length) { return new Set(); }
    return new Set(rows.filter(r => !r.action.movement && (r.action.success ?? [])
      .some(c => !!c.call && calls.some(w => this.meets(c.call!, w)))).map(r => r.choice.id));
  }
  // What an aim waits on, call by call, and a rule away what makes it so (the herbs given the fever's mother are
  // kept, and a rule doses the child); never where the company is, nor what is in the purse, which every way and
  // every torch changes. Read once for each aim of a module.
  private static readonly waiting = new WeakMap<Module, Map<string, Call[]>>();
  private static waits(module: Module, def: Objective): Call[] {
    const kept = this.waiting.get(module) ?? this.waiting.set(module, new Map()).get(module)!;
    if (kept.has(def.id)) { return kept.get(def.id)!; }
    const wanted: Call[] = [], made: Call[] = [];
    this.reads(def.when, wanted);
    for (const rule of module.rules ?? []) {
      if (rule.effects.some(c => !!c.call && wanted.some(w => this.meets(c.call!, w)))) { this.reads(rule.when, made); }
    }
    const calls = [...wanted, ...made].filter(c => !['at', 'quantity'].includes(c.name));
    kept.set(def.id, calls);
    return calls;
  }
  private static meets(a: Call, b: Call): boolean {
    return a.name === b.name && a.args.length === b.args.length
      && a.args.every((x, i) => x === b.args[i] || x.startsWith('?') || b.args[i]!.startsWith('?'));
  }
  // The places that hold what the aim names (its town, its site), and the outside a site it names is entered from (the
  // ground before Lunalac's door, set out for to bring its reading-glass up): a journey to any of them is toward it.
  private static holding(campaign: Campaign, named: Set<string>): Set<string> {
    const byId = EntityIndex.of(campaign.module.entities).byId;
    const held = new Set([...named].flatMap(id => {
      const at = byId.get(id)?.space ? id : campaign.world.one('at', id);
      return at ? Spatial.ancestry(byId, at).filter(e => !['region', 'plane'].includes(e.space?.kind ?? ''))
        .map(e => e.id) : [];
    }));
    // Only where a site is among them is the land read for its way in.
    const sites = [...held].filter(id => byId.get(id)?.space?.kind === 'site');
    if (!sites.length) { return held; }
    for (const r of campaign.world.related('connects')) {
      for (const [a, b] of [[r.args[1]!, r.args[2]!], [r.args[2]!, r.args[1]!]] as const) {
        const site = this.siteOf(byId, b);
        if (site && held.has(site) && !this.siteOf(byId, a)) { held.add(a); }
      }
    }
    return held;
  }
  private static reads(p: Predicate, into: Call[]) {
    ModuleWriter.conditionCalls(p, call => { into.push(call); return call; });
  }
  // Where its author says the aim is gone to by (toward crypt by yard), that place too, until the company is in it or
  // at what the aim is toward: the churchyard lit from the shrine, and nothing lit back out of the crypt.
  private static routed(campaign: Campaign, screen: Screen, named: Set<string>): Set<string> {
    const def = Undertakings.followed(campaign), t = def && Stakes.target(campaign, def);
    if (!t?.routeTo || t.routeTo === t.actionAt) { return named; }
    const byId = EntityIndex.of(campaign.module.entities).byId, line = Spatial.ancestry(byId, screen.place.id);
    const there = line.some(e => e.id === t.routeTo || e.id === t.actionAt);
    return there ? named : new Set([...named, t.routeTo]);
  }
  private static addressed(campaign: Campaign): Set<string> {
    const def = Undertakings.followed(campaign);
    return def ? Stakes.addresses(campaign, def) : new Set();
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
    aims: { named: Set<string>; held: Set<string>; idle: Set<string> }): Reading['toward'] {
    const out = new Map<string, 'toward' | 'held'>(), byId = EntityIndex.of(campaign.module.entities).byId;
    const here = screen.place.id, around = new Set(Spatial.ancestry(byId, here).map(e => e.id));
    const area = [...screen.path].reverse().find(p => ['settlement', 'site'].includes(p.kind))?.id;
    const held = aims.named.has(here) ? [] : [...aims.held];
    // Nor, from there, back to a place it names that the company has been (the rat-runs the run is in, not the
    // corn-store above them).
    const been = new Set(aims.named.has(here) ? screen.map.filter(p => p.visited).map(p => p.id) : []);
    // Nor a step toward a place the aim names while a way or a walk about the town goes straight to one it names: the
    // walk to the churchyard is the way to the crypt under it. From the shrine at Karir the page had led to the
    // landing, the first leg of the way round to the crypt, and at the landing nothing (the playtest of 7 November).
    const direct = new Set([...screen.exits.map(e => e.destination.id), ...(screen.around ?? []).map(d => d.id)]);
    const straight = [...aims.named].some(id => direct.has(id) && id !== here && !around.has(id) && !aims.idle.has(id));
    const places = [...straight ? [] : [...aims.named].map(id => [id, 'toward'] as const),
      ...held.map(id => [id, 'held'] as const)]
      .filter(([id]) => byId.get(id)?.space && !around.has(id) && !been.has(id) && !aims.idle.has(id)
        && !direct.has(id))
      // A room to stand in before the area round it: an aim at Gaudumport's far end names the site too, and the way
      // in, once the speaking door was open, had not been led with (OWN-57's play).
      .sort((a, b) => Number(byId.get(b[0])?.space?.kind === 'room') - Number(byId.get(a[0])?.space?.kind === 'room'))
      .slice(0, 2);
    const graph = places.length ? Itineraries.graph(campaign) : new Map<string, WayInfo[]>();
    for (const [id, why] of places) {
      const near = !!area && Spatial.ancestry(byId, id).some(e => e.id === area);
      const first = this.leading(graph, { here, id, byId, ...near ? { area } : {} });
      // No known way to it, but a way from here into the site it is in: that (the far end of a hold not yet walked,
      // through its door just opened).
      const site = Spatial.ancestry(byId, id).find(e => e.space?.kind === 'site')?.id;
      const exit = first ? screen.exits.find(e => e.destination.id === first) : site ? screen.exits.find(e =>
        Spatial.ancestry(byId, e.destination.id).some(a => a.id === site) && !e.blocked) : undefined;
      if (exit && !out.has(exit.id)) { out.set(exit.id, why); }
    }
    // No known way toward the aim shown, nor a journey to it: in the open country, the step that goes nearest it
    // (REV-08).
    const aim = places.find(([, why]) => why === 'toward')?.[0];
    const journey = (screen.destinations ?? []).some(d => aim && Itineraries.within(byId, aim, d.id));
    const step = aim && !journey && ![...out.values()].includes('toward') && LandModel.tract.test(here)
      ? Headings.toward(campaign.module, { path: screen.path, here, exits: screen.exits }, { id: aim, entities: byId })
      : undefined;
    if (step && !out.has(step)) { out.set(step, 'toward'); }
    return out;
  }
  // The ways toward the aims, and into a site: no step across the country toward an aim while there is a way into a
  // site here (the barrow's door beside the company, and the page had led with the map "toward your aim").
  private static ways(campaign: Campaign, screen: Screen,
    aims: { named: Set<string>; held: Set<string>; idle: Set<string> }):
    Pick<Reading, 'toward' | 'inward'> {
    const inward = this.inward(campaign, screen), toward = this.toward(campaign, screen, aims);
    if (inward.size) {
      for (const [id] of toward) { if (screen.exits.find(e => e.id === id)?.bearing) { toward.delete(id); } }
    }
    return { toward, inward };
  }
  // The ways into a site (a barrow, a cave, a ruin) not yet taken, or further into the one the company is in, by the
  // world's own nesting of its places, never by their names: from its outside its way in, from each room the rooms
  // beyond. Not out of one site into another.
  private static inward(campaign: Campaign, screen: Screen): Set<string> {
    const byId = EntityIndex.of(campaign.module.entities).byId, here = this.siteOf(byId, screen.place.id);
    // A site's outside (the mound a barrow's door is in) is the way into it too: a place outside any site a way joins
    // to one of its rooms (the barrow's mound, beside the wood, had been only under Every way).
    const outsides = new Map(campaign.world.related('connects').flatMap(r => [[r.args[1]!, r.args[2]!],
      [r.args[2]!, r.args[1]!]] as const).flatMap(([a, b]) => {
      const site = this.siteOf(byId, b);
      return site && !this.siteOf(byId, a) ? [[a, site] as const] : [];
    }));
    const inward = new Set(screen.exits.filter(e => {
      const there = !e.visited && !e.blocked && (this.siteOf(byId, e.destination.id) ?? outsides.get(e.destination.id));
      return there && (!here || there === here) && e.destination.id !== screen.place.id;
    }).map(e => e.id));
    return inward.size || !here ? inward : this.onward(campaign, screen, { byId, site: here });
  }
  // From a room of a site with no way on from it not yet taken (a side recess), the way toward the nearest room of
  // the site known of and not yet entered, by the known ways: the rest of the site, not the way out of it.
  private static onward(campaign: Campaign, screen: Screen, at: { byId: Map<string, Entity>; site: string }):
    Set<string> {
    const visited = new Set(screen.map.filter(p => p.visited).map(p => p.id)), graph = Itineraries.graph(campaign);
    const rooms = [...new Set([...graph.values()].flat().map(w => w.to))]
      .filter(id => !visited.has(id) && this.siteOf(at.byId, id) === at.site);
    for (const id of rooms) {
      const first = this.leading(graph, { here: screen.place.id, id, byId: at.byId, area: at.site });
      const exit = first && screen.exits.find(e => e.destination.id === first && !e.blocked);
      if (exit) { return new Set([`~${exit.id}`]); }
    }
    return new Set();
  }
  private static siteOf(byId: Map<string, Entity>, id: string): string | undefined {
    return Spatial.ancestry(byId, id).find(a => a.space?.kind === 'site')?.id;
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
