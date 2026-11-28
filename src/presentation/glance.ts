import type { Campaign } from '../campaign/campaign'; import { Offers } from './offer'; import { CompanyLight } from './company-light';
import { Threshold } from './threshold'; import { HeldActs, type Host } from './held-acts';
import { LedWords } from './led-words'; import { HeldLead } from './held-lead';
export type { Host };
import type { Call, Entity, Module, Objective, Predicate } from '../lang/module';
import { AimAdvances } from './aim-advances'; import { AimLeads } from './aim-leads';
import { Spatial } from '../lang/spatial'; import { ModuleWriter } from '../lang';
import { EntityIndex } from '../lang/entity-index';
import { Affordances, type Reading } from '../ui/affordances';
import { Knowing } from './knowing';
import { Attending } from '../ui/attention';
import { Itineraries } from '../ui/itinerary'; import { Headings } from '../ui/headings';
import { KnownWays } from '../ui/known-ways'; import { LandModel } from '../ui/land-model';
import { Promotion, type Situation } from '../ui/promotion';
import { SceneModel, type Scene } from '../ui/scene';
import type { Act, Screen } from '../ui/screen-types';
import { Engaged } from './engaged'; import { Stakes } from '../ui/stakes';
import { Undertakings } from './undertakings'; import { TalkWeight } from './talk-weight';
import { AimRoute } from './aim-route'; import { AimLeading } from './aim-lead'; import { AimContinuity } from './aim-continuity';
import { AimAside } from './aim-aside'; import { LedAgain } from './led-again';
import { Perception } from './perception'; import { Companions } from './companions';
import { Alternatives } from './alternatives';
import { CompanyRecall } from './company-recall';
import { Acquainted } from './acquainted'; import { DecisionFrame } from './decision-frame';
import { Charge } from './charge'; import { Surfaces } from './surfaces';
import { GlanceLines } from './glance-lines'; import { SiteOutsides } from './site-outsides'; import { LeadsOn } from './leads-on';
import type { Arrival, Glance as View, Promoted, Sensed } from './glance-types';
import { PlayerFrame } from './player-frame'; import { TalkingWith } from './talking-with';
import type { Told } from './narrator'; import { ArrivalAttention } from './arrival-attention';

// What the narrator hands the glance: the lines it tells of the place now, whether the company has been here before,
// and what has changed since it was.
// opened: an opening told why the company came just before, so the first place does not say the aim again (OWN-17).
// apart: what that opening told (its beats, the meeting on the road), said again in no line of the first place's.
export interface Telling { kept: { id: string; text: string }[]; known: boolean; changed: string[]; opened?: boolean;
  apart?: { texts: ReadonlySet<string>; met: boolean } }

// A place at a glance (OWN-18, OWN-19): how the company came to it, its one distinctive line, a sign of life now, on a
// return what has changed, and the few choices that matter now, each with why; the quiet row of ways; and which ways
// the aims name. Decided here, from the screen, the company's own story and what the module declares, so that the page
// draws and does not guess; everything else stays where it was, a deliberate look away (Look about, Every way, More).
export class Glance {
  // What each aim names, a site's every room among them, read once for a module.
  private static readonly namings = new WeakMap<Module, Map<string, Set<string>>>();
  static of(campaign: Campaign, screen: Screen, told: Told | undefined, telling: Telling): View {
    const recall = CompanyRecall.of(campaign), here = screen.place.id, asks = ArrivalAttention.asks(campaign);
    const arrival: Arrival = !told ? 'opening' : !told.moved ? 'stay'
      : recall.been(here) || telling.known ? 'return' : 'first';
    const lines = GlanceLines.of(campaign, screen, { ...telling, arrival, recall, changes: told?.event.changes }),
      scene = Attending.place(SceneModel.build(screen)), sensed = Perception.sensed(campaign, screen);
    const life = lines.life?.subject;
    const reading = this.reading(campaign, screen, { recall, life, pointed: lines.pointed, sensed, told });
    const s: Situation = { threat: scene.subjects.some(x => SceneModel.threat(x)), warned: !!screen.warned,
      dark: !!screen.dark, settled: reading.needs.settled, open: reading.needs.open,
      down: screen.party.some(m => m.hp <= 0), dying: screen.party.some(m => m.hp <= 0 && !m.conditions.includes('slain')),
      aimed: !!screen.aims?.some(a => a.followed) };
    // What was done here with nothing happened since is held: never led again (OR-417, see LedAgain).
    const cands = LedAgain.hold(campaign, here, Affordances.of(scene, screen, reading));
    // At the opening the four are the charge's (see Charge); the place's lenses and ways hold the rest as ever.
    const helped = !!reading.help && cands.some(x => x.whys.includes('help'));
    const aside = AimAside.of(campaign, screen, helped), out = Threshold.leaving(campaign, screen, reading.named);
    const led = Charge.acts(aside ? cands.map(c => AimAside.strip(c, screen, aside.room)) : cands, screen,
      Charge.stands(arrival, campaign));
    // What is held is no step of the aim's either: never gilded back in (OR-417).
    const { acts: picked, continuance } = AimContinuity.of(campaign, screen, { acts: Promotion.pick(led, s),
      cands: led.filter(c => !c.held), s, ...helped ? { help: reading.help } : {},
      ...aside ? { aside: aside.said } : {}, ...out ? { out } : {} });
    // Nothing led at all, everything here gone round (OR-417): the way toward the town, where the next true lead is.
    const on = picked.length ? picked
      : AimContinuity.townward(campaign, { acts: picked, cands: led.filter(c => !c.held), ...out ? { out } : {} });
    const held = TalkWeight.heldFor(campaign, Undertakings.heldFor(campaign, screen, on));
    const folded = HeldLead.fold(campaign, { acts: held, cands: led }, HeldActs.follow(screen));
    const acts = Charge.once(LedWords.with(campaign, HeldActs.with(folded.acts, folded.pull)),
      Charge.stands(arrival, campaign) && Charge.of(screen).size > 0);
    const ways = Promotion.ways(cands, acts, s);
    // The aim this place is about, if one is; said on coming somewhere new, at the opening and on resuming, and when
    // the aims have changed, not on every page (the owner, OWN-53: restrained, and only what is truly held).
    const turned = !!told?.feedback.aims?.length || !!told?.feedback.amended?.length;
    // A new aim just taken up is the one said; otherwise the aim followed (see Undertakings).
    const aim = told?.feedback.aims?.at(-1) ?? screen.aims?.find(a => a.followed)?.text ?? screen.objectives[0];
    // Not again beneath "A new aim" that has just said it. Coming somewhere new is an occasion only where the aim
    // followed bears on it: it had been said at every new room on the way (the terminal line's second play).
    const bearing = arrival === 'first' && Undertakings.bears(campaign, screen, here);
    const said = aim && !(arrival === 'opening' && telling.opened) && !told?.feedback.aims?.includes(aim)
      && (['opening', 'resume'].includes(arrival) || bearing || turned);
    const need = [...this.need(screen, cands.some(c => c.kind === 'light' && !c.barred), !!reading.needs.dark),
      ...Threshold.barred(screen, reading.named, campaign),
      ...continuance?.kind === 'frontier' && continuance.need ? [continuance.said] : []],
      after = told && this.after(campaign, told, { screen, acts, scene });
    // The first page says the company's own errand as its first goal, once, followed or not (round 13, PL-30).
    const goal = arrival === 'opening' ? screen.aims?.find(a => a.own)?.text : undefined;
    LedAgain.led(campaign, acts, cands);
    return { arrival, ...asks.length ? { asks } : {}, ...GlanceLines.said(lines), acts, ways,
      offer: Offers.scene(acts, ways, cands, { campaign, out, screen }),
      ...this.aimed(campaign, screen, reading, continuance), ...Threshold.leads(campaign, screen, reading.named),
      ...recall.back(screen, Itineraries.enclosed(campaign, here)), lenses: Promotion.lenses(cands, scene, s, acts),
      ...reading.idle?.size ? { idle: [...reading.idle] } : {}, ...sensed.length ? { sensed } : {},
      ...said ? { aim } : {}, ...goal ? { goal } : {}, ...need.length ? { need } : {}, ...after ? { after } : {},
      rail: Surfaces.rail(screen) };
  }
  // What came of the act just done, and what it made relevant (REV-05; see DecisionFrame).
  private static after(campaign: Campaign, told: Told, at: { screen: Screen; acts: Promoted[]; scene: Scene }) {
    const choices = PlayerFrame.of(campaign).rows.map(r => ({ command: r.choice.id, label: r.choice.name,
      ...r.action.schema ? { schema: r.action.schema } : {} }));
    return DecisionFrame.after({ feedback: told.feedback, moved: told.moved, failed: told.event.result === 'failure',
      place: at.screen.place.name }, at.acts, { names: new Map(at.scene.subjects.map(x => [x.id, x.name])), choices });
  }
  // What an author writes to be done with a thing (Change … from … to …), by the rules' kinds of it.
  static readonly changes = ['change_thing', 'change_thing_paying', 'change_thing_spending'];
  // The host's part: the journey set out on and not yet come to the end of is gone on with first of what the aims ask
  // ("Go on to Gaudumport"), and the game taken up again opens as a return.
  // Engaged (at: the frame it was made for), no journey is gone on with until the threat is answered (OR-163), or the
  // occasion left (OR-177).
  static held(glance: View, host: Host, at?: Pick<Screen, 'warned' | 'engaged'>): View {
    const { bound } = at && Engaged.holds(at) ? { bound: undefined } : HeldActs.of(host);
    const acts = bound ? this.first(glance.acts, bound) : glance.acts;
    const offer = bound && glance.offer ? Offers.headed(glance.offer, bound) : undefined;
    return { ...glance, ...host.resumed ? { arrival: 'resume' as const } : {}, acts,
      ways: glance.ways.filter(id => !acts.some(a => a.choice === id)),
      ...offer ? { offer } : {} };
  }
  // The journey held, at the head of what the aim asks, and the rest capped again: three at most, two ways.
  private static first(acts: Promoted[], bound: Promoted): Promoted[] {
    // After what the aim is about where the company stands: a journey stopped by the fresh ruts goes on after them.
    const rest = acts.filter(a => a.choice !== bound.choice), at = rest.findIndex(a => a.tier > 0 && a.why !== 'about');
    const all = at < 0 ? [...rest, bound] : [...rest.slice(0, at), bound, ...rest.slice(at)];
    const ways = all.filter(a => (a.exit || a.choice.startsWith('travel:')) && a.why !== 'retreat');
    return Promotion.continued(all.filter(a => !ways.slice(2).includes(a)).slice(0, Promotion.cap));
  }
  // A journey just made, in one line: by where, and when it came there, or why it stopped; and its legs, where it had
  // more than one, opened by a quiet word of their own.
  static readonly legs = 'The way here…';
  static came(glance: View, travel: { to: string; arrived: boolean; stopped?: string;
    legs: { place: string; at: string }[] }): View {
    const last = travel.legs.at(-1); if (!last) { return glance; }
    const via = [...new Set(travel.legs.slice(0, -1).map(l => l.place))].slice(-2);
    // The hour ends with its own stop ("1:32 p.m."), and is not given a second ("1:32 p.m..").
    const at = last.at.replace(/\.$/, ''), came = travel.arrived ? `${via.length ? `By ${via.join(' and ')}, to` : 'To'} ${travel.to}: ${at}.`
      : travel.stopped ?? `On the way to ${travel.to}: ${at}.`;
    return { ...glance, came, ...travel.legs.length > 1 ? { legs: Glance.legs } : {} };
  }
  // The company's state, said only when something is wrong: who is low or down, and what holds anyone (asleep,
  // stunned), which had been said nowhere while lying as you are was all there was to do (the owner's trap, 11
  // November).
  // Dark with a light to hand is said as it is, not as a want: "No light" beside "Haze: light a candle" had the player
  // arbitrate between the two (the blind playtest, 13 November).
  // So with the dark ahead, nothing to see it by: why the way down is not led with (see CompanyLight). And dark with a
  // light to hand says the light is there: "Need: Dark" had read as a want of the dark (cold play 5, CL-38).
  private static need({ expedition: e, dark, party }: Screen, lightable: boolean, ahead: boolean): string[] {
    return [...e.hungry ? ['Hungry'] : [], ...e.weary ? ['Weary'] : [],
      ...dark ? [lightable ? 'Dark, a light to hand' : 'No light'] : ahead ? ['No light'] : [],
      ...party.filter(m => m.hp < m.maxHp / 2 || m.conditions.length).map(m => `${m.name}: ${[
        ...m.hp <= 0 ? ['down'] : m.hp < m.maxHp / 2 ? [`${m.hp} of ${m.maxHp}`] : [],
        ...m.conditions.map(c => c.toLowerCase())].join(', ')}`)];
  }
  // Every choice that goes where the aims name: the ways, the walks about the town, the journeys known; those of the
  // aim followed first, and said apart (following), so that the page's "your aim" is that aim's and no other's. In
  // Karir's chandlery, following the crypt, the corn-store of another aim had stood alone as "your aim", the
  // churchyard's walk folded into its quarter (the fresh playtest of 7 November).
  // And the aim followed's next step, and where it was learned (US-07).
  private static aimed(campaign: Campaign, screen: Screen, r: Reading, continuance?: View['continuance']):
    Pick<View, 'aimed' | 'following' | 'lead' | 'continuance'> {
    const byId = EntityIndex.of(campaign.module.entities).byId, lead = AimLeading.of(campaign, screen);
    const following = [...new Set(this.going({ screen, r, byId }, r.named, 'toward'))];
    const aimed = [...new Set([...following, ...this.going({ screen, r, byId }, r.held, 'held')])];
    return { aimed, ...following.length ? { following } : {}, ...lead ? { lead } : {},
      ...continuance ? { continuance } : {} };
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
    at: { recall: CompanyRecall; life?: string; pointed: Set<string>; sensed: Sensed[]; told?: Told }): Reading {
    const here = screen.place.id, recall = at.recall, frame = PlayerFrame.of(campaign), rows = frame.rows;
    const schema = new Map(rows.map(r => [r.choice.id, r.action.searchPlace ? 'search' : r.action.schema ?? r.action.id]));
    const args = frame.bound();
    const touches = new Map(rows.map(r => [r.choice.id,
      new Set((r.action.success ?? []).flatMap(c => c.call?.args ?? []))]));
    // With an aim followed and the dark ahead, nothing to see by: whoever sells a light is the aim's way.
    const light = CompanyLight.of(campaign, screen, to => KnownWays.first(campaign, here, to, { able: true }));
    const seller = screen.aims?.some(a => a.followed) ? light.sellers : null;
    const named = AimRoute.routed(campaign, screen, this.inside(campaign, screen, this.whereabouts(campaign, screen,
      new Set([...this.named(campaign), ...seller ?? [], ...this.saidHere(campaign, screen)]),
      this.addressed(campaign, screen))));
    const held = this.inside(campaign, screen,
      new Set([...screen.aimed ?? []].filter(id => !named.has(id) && id !== campaign.playerActor)));
    const spent = AimLeads.spent(campaign, screen, named), by = [...screen.around ?? [], ...screen.destinations ?? []];
    const idle = new Set([...by.map(d => d.id), ...screen.exits.map(e => e.destination.id), ...named, ...held]
      // Never idle while the aim followed is unmet where it names, or on its way: twice in Mik's shop without asking
      // him, the gold had gone out of the town for good (the laboratory's lost turns); passed twice over Lowmouth's
      // green, the way out of the general store toward Ironkeep had been nobody's (EX-01's navigational confusion).
      // What it names and has nothing more for now is spent instead (AimLeads.spent).
      // Nor where a light is to be had, with the dark ahead and nothing to see by (see CompanyLight).
      .filter(id => (recall.idle(id) && !named.has(id)
        && !this.sells(campaign, id, seller ?? undefined)) || spent.has(id)));
    // The way back from a danger: out of the site the company is in, toward the nearest place outside it, where there
    // is one; else the way it came (OR-411: back the way it came had led a son at Windtower down into its dead end).
    const back = this.outOf(campaign, screen)
      ?? (recall.came && screen.exits.find(e => e.destination.id === recall.came)?.destination.id);
    const commands = this.commands(screen);
    const authored = new Set(rows.filter(r => this.changes.includes(r.action.schema ?? '')).map(r => r.choice.id));
    const aim = screen.aims?.find(a => a.followed)?.text, advances = AimLeads.advances(campaign, rows);
    const alternatives = Alternatives.of(rows), seen = [...screen.people, ...screen.things].map(t => t.id);
    const coin = AimAdvances.wants(campaign), holding = this.holding(campaign, screen, named);
    return { ...aim ? { aim } : {}, ...advances.size ? { advances } : {}, ...coin ? { coin } : {}, holding, schema,
      ...alternatives.size ? { alternatives } : {},
      args, touches, authored, serves: Undertakings.serving(campaign, rows),
      speakers: new Set(rows.filter(r => r.action.speaker).map(r => r.choice.id)),
      willing: new Set(rows.filter(r => r.action.speaker && (r.action.success ?? []).some(c => c.kind === 'assert'
        && c.call?.name.replace(/^.*__/, '') === 'willing' && c.call.args[0] === r.action.speaker)).map(r => r.choice.id)),
      named, held, occupied: AimLeads.occupied(campaign, named), companions: Companions.possible(campaign),
      sensed: Perception.notes(campaign, at.sensed), opened: new Set(at.told?.feedback.opened),
      ...this.ways(campaign, screen, { named, held, idle }),
      ...back ? { back } : {}, here, signs: this.signs(campaign, screen, recall), ...at.life ? { life: at.life } : {},
      pointed: at.pointed, marvels: Knowing.marvels(campaign, seen), ...AimAside.reading(campaign, screen),
      done: this.done(commands, { recall, here, advances }), ...TalkingWith.of(campaign, at.told),
      ...Acquainted.of(campaign, screen, recall), idle,
      needs: { hungry: screen.expedition.hungry, rations: screen.purse.rations, weary: !!screen.expedition.weary,
        hurt: new Set(screen.party.filter(m => m.hp < m.maxHp / 2).map(m => m.id)),
        night: screen.expedition.daylight === 'night',
        settled: screen.path.some(p => ['settlement', 'site'].includes(p.kind)),
        open: screen.exits.some(e => !!e.bearing), alone: screen.party.length === 1,
        ...this.bed(campaign, screen, schema), ...light } };
  }
  // What the company has done here: not the aim's step only tried and not come off, whose fresh try is still the step
  // (OR-241; see CompanyRecall.missed).
  private static done(commands: string[], at: { recall: CompanyRecall; here: string; advances: Set<string> }):
    Set<string> {
    const { recall, here, advances } = at;
    return new Set(commands.filter(c => recall.did(here, c) && !(advances.has(c) && recall.missed(here, c))));
  }
  private static sells(campaign: Campaign, place: string, sellers: Set<string> | undefined): boolean { // OR-881
    return !!sellers && [...sellers].some(p => CompanyRecall.shop(campaign, p) === place);
  }
  // Where a bed is to be had a step from here, in a settlement at night, when no one here offers one: whoever offers
  // lodging, where they are.
  private static bed(campaign: Campaign, screen: Screen, schema: Map<string, string>): { bed?: string } {
    const w = campaign.world;
    if (screen.expedition.daylight !== 'night' || !w.relates('offers') || !w.relates('serviceOf')
      || [...schema.values()].some(k => k.startsWith('take_lodging'))) { return {}; }
    // Only a bed the company can pay for: one too dear had been led to as "a bed for the night", and nothing there to
    // take (round 8, M: a hayloft at a hamlet's yard, the purse short).
    const purse = w.number(ModuleWriter.call('quantity', campaign.playerActor ?? 'party', 'gold'));
    const hosts = w.related('offers').filter(r => w.test(ModuleWriter.call('serviceOf', r.args[1]!, 'lodging'))
      && w.number(ModuleWriter.call('fee', r.args[1]!)) <= purse);
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
  // led back to the shop just left with nothing to pay (the owner, 7 November). Where the aim gives their address
  // ("Lothar at Brockfield"), they are sought there until they are seen.
  private static whereabouts(campaign: Campaign, screen: Screen, ids: Set<string>, addresses: Set<string>):
    Set<string> {
    const byId = EntityIndex.of(campaign.module.entities).byId;
    if ([...ids].some(id => byId.get(id)?.space?.kind === 'room')) { return ids; }
    const known = new Set([...screen.map.map(p => p.id), ...screen.exits.map(e => e.destination.id)]);
    // Where the company last saw them, or, never seen, the most particular address the aim's words give: never where
    // they went unseen (OR-880), nor the room within the address the world has them in, never told (OR-881).
    const at = [...ids].map(id => CompanyRecall.whereabouts(campaign, screen, id))
      .filter((s): s is string => !!s && known.has(s) && !ids.has(s));
    const unseen = [...ids].some(id => !byId.get(id)?.space && !CompanyRecall.whereabouts(campaign, screen, id));
    const told = unseen ? [...addresses].filter(a => !['region', 'plane'].includes(byId.get(a)?.space?.kind ?? '')
      && ![...addresses].some(b => b !== a && Spatial.ancestry(byId, b).some(e => e.id === a))) : [];
    return at.length || told.length ? new Set([...ids, ...at, ...told]) : ids;
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
  // The places that hold what the aim names (its town, its site), and the outside a site it names is entered from (the
  // ground before Lunalac's door, set out for to bring its reading-glass up): a journey to any of them is toward it.
  // Where the company knows them to be (OR-880).
  private static holding(campaign: Campaign, screen: Screen, named: Set<string>): Set<string> {
    const byId = EntityIndex.of(campaign.module.entities).byId;
    const held = new Set([...named].flatMap(id => {
      const at = CompanyRecall.whereabouts(campaign, screen, id);
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
  private static addressed(campaign: Campaign, screen: Screen): Set<string> {
    const def = Undertakings.followed(campaign);
    return def ? Stakes.addresses(campaign, def, id => CompanyRecall.whereabouts(campaign, screen, id)) : new Set();
  }
  // Where the company stands, where the words of the aim followed say it: "the den in the quarry adit under the old
  // quarry pit", the adit reached, is the aim's place, and its ways on its way (down in thorn's adit nothing had led on
  // to the den, and the gold had gone back up to the pit: OR-326).
  private static saidHere(campaign: Campaign, screen: Screen): string[] {
    const def = Undertakings.followed(campaign), here = screen.place.id;
    return def && Stakes.said(campaign, def).has(here) ? [here] : [];
  }
  private static names(campaign: Campaign, def: Objective): Set<string> {
    let kept = this.namings.get(campaign.module);
    if (!kept) { kept = new Map(); this.namings.set(campaign.module, kept); }
    if (!kept.has(def.id)) { kept.set(def.id, Stakes.named(campaign, def)); }
    return new Set([...kept.get(def.id)!, ...AimLeads.sellers(campaign, def)]);
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
    // Someone the aim names is gone to where the company has seen them (the merchant owed word of the nest, from the
    // nest: nothing had led back up toward him, round 7); never where it has not been, nor where they went (OR-880).
    const seen = new Set(screen.map.filter(p => p.visited).map(p => p.id)), named = CompanyRecall
      .placed(campaign, screen, aims.named).filter(id => byId.get(id)?.space && (seen.has(id) || aims.named.has(id)));
    const places = [...straight ? [] : named.map(id => [id, 'toward'] as const),
      ...held.map(id => [id, 'held'] as const)]
      .filter(([id]) => byId.get(id)?.space && !around.has(id) && !been.has(id) && !aims.idle.has(id)
        && !direct.has(id))
      // A room to stand in before the area round it: an aim at Gaudumport's far end names the site too, and the way
      // in, once the speaking door was open, had not been led with (OWN-57's play).
      // The aim followed's before another's: two at most are walked toward, and a held aim's room had crowded out the
      // churchyard the followed aim is gone to by (the owner's play of 11 November).
      .sort((a, b) => Number(a[1] === 'held') - Number(b[1] === 'held')
        || Number(byId.get(b[0])?.space?.kind === 'room') - Number(byId.get(a[0])?.space?.kind === 'room'))
      .slice(0, 2);
    for (const [id, why] of places) {
      const near = !!area && Spatial.ancestry(byId, id).some(e => e.id === area);
      // By a way the company can take now, if any (OR-411: not toward the crypt's stair, barred and dark, and back).
      const over = { here, id, byId, ...near ? { area } : {} };
      const first = this.leading(campaign, { ...over, able: true }) ?? this.leading(campaign, over);
      // No known way to it, but a way from here into the site it is in: that (the far end of a hold not yet walked,
      // through its door just opened). Within the site already, a way on into it not yet taken, never one back: in
      // Porthalen Hall, toward the muniment room no known way reached, the forecourt had led to the great hall and the
      // great hall back to the forecourt, fifty times on the first quarter hour's walk (OR-171).
      const site = Spatial.ancestry(byId, id).find(e => e.space?.kind === 'site')?.id, inside = !!site && around.has(site);
      // Where no way to it is known yet, the heart of the town's quarter it stands in: from Tuck's yard, the landing
      // the inn stands on had been led only as somewhere not yet been, not as the way toward the aim (Mission 20).
      const to = first ?? (near && id !== here ? screen.quarters?.find(q => q.places.includes(id))?.heart : undefined);
      const exit = to && to !== here ? screen.exits.find(e => e.destination.id === to)
        : site ? screen.exits.find(e => Spatial.ancestry(byId, e.destination.id).some(a => a.id === site) && !e.blocked
          && !(inside && e.visited))
          : undefined;
      // Or the walk about the town that goes there.
      const walk = !exit && to && screen.around?.some(d => d.id === to) ? `travel:${to}` : undefined;
      const way = exit?.id ?? walk;
      if (way && !out.has(way)) { out.set(way, why); }
    }
    // No known way toward the aim shown, nor a journey to it: in the open country, the step that goes nearest it
    // (REV-08).
    const aim = places.find(([, why]) => why === 'toward')?.[0];
    const journey = (screen.destinations ?? []).some(d => aim && Itineraries.within(byId, aim, d.id));
    const step = aim && !journey && ![...out.values()].includes('toward') && LandModel.tract.test(here)
      ? Headings.toward(campaign.module, { path: screen.path, here, exits: screen.exits }, { id: aim, entities: byId })
      : undefined;
    const on = step ?? (![...out.values()].includes('toward') ? AimRoute.door(campaign, screen, aims.named) : undefined);
    if (on && !out.has(on)) { out.set(on, 'toward'); }
    return out;
  }
  // The ways toward the aims, and into a site: no step across the country toward an aim while there is a way into a
  // site here (the barrow's door beside the company, and the page had led with the map "toward your aim").
  private static ways(campaign: Campaign, screen: Screen,
    aims: { named: Set<string>; held: Set<string>; idle: Set<string> }): Pick<Reading, 'toward' | 'inward' | 'within' | 'on'> {
    const inward = this.inward(campaign, screen), sought = this.sought(campaign, screen);
    const within = AimLeads.within(campaign, screen, aims.named);
    // Where what the aim waits on is hidden elsewhere and the way there is known, that way is the aim's, and no other.
    const toward = sought ? new Map([[sought, 'toward' as const]]) : this.toward(campaign, screen, aims);
    AimRoute.join(campaign, screen, toward, { open: !sought, within: !!within });
    if (inward.size) {
      for (const [id] of toward) { if (screen.exits.find(e => e.id === id)?.bearing) { toward.delete(id); } }
    }
    // Where every way goes somewhere been, the one that leads on to the unseen (OR-1502).
    const on = LeadsOn.of(campaign, screen, { ways: KnownWays.unseen, named: aims.named, inward });
    return { toward, inward, within, ...on };
  }
  // The first way toward the nearest place where something the aim waits on lies hidden (see AimAdvances.sought), from
  // anywhere but there, by the ways the world joins: a site's way back out included, which is otherwise never led.
  // Or a place it waits on having been in, by the ways known (a side room of a hold gone into, its well-room still to
  // come to, had led nowhere: PB-16, EX-03).
  private static sought(campaign: Campaign, screen: Screen): string | undefined {
    const here = screen.place.id, places = AimAdvances.ahead(campaign).filter(p => p !== here);
    if (!places.length || AimAdvances.sought(campaign).includes(here)) { return undefined; }
    // The nearest by the known ways (KnownWays), its first step by a way open now (the bailey's breach down to the door
    // is barred).
    const open = new Map(screen.exits.filter(e => !e.blocked).map(e => [e.destination.id, e.id]));
    const first = KnownWays.first(campaign, here, id => places.includes(id), { first: new Set(open.keys()) });
    return first && open.get(first);
  }
  // The ways into a site (a barrow, a cave, a ruin) not yet taken, or further into the one the company is in, by the
  // world's own nesting of its places, never by their names: from its outside its way in, from each room the rooms
  // beyond. Not out of one site into another. In a town, only a way straight into a site (the cellar under it), not
  // out to the ground a site stands in: the landing at Thornhaven had led a newcomer out to Lapisrecs' mound, "further
  // in", where its mummy waits (register M19-233; Mission 20).
  private static inward(campaign: Campaign, screen: Screen): Set<string> {
    const byId = EntityIndex.of(campaign.module.entities).byId, here = this.siteOf(byId, screen.place.id);
    const town = screen.path.some(p => p.kind === 'settlement');
    // A site's outside (the mound a barrow's door is in) is the way into it too: a place outside any site a way joins
    // to one of its rooms (the barrow's mound, beside the wood, had been only under Every way).
    const outsides = SiteOutsides.of(campaign.world, byId);
    // From a town's own ground, only a way down into a site under it: the Hall and the old stones on the hill, a walk
    // from the landing, had been led as "further in" ahead of the town's own people (Mission 20's outskirts).
    const inward = new Set(screen.exits.filter(e => {
      const there = !e.visited && !e.blocked && (!town || here || e.destination.underground)
        && (this.siteOf(byId, e.destination.id) ?? (town ? undefined : outsides.get(e.destination.id)));
      return there && (!here || there === here) && e.destination.id !== screen.place.id;
    }).map(e => e.id));
    return inward.size || !here ? inward : this.onward(campaign, screen, { byId, site: here });
  }
  // From a room of a site with no way on from it not yet taken (a side recess), the way toward the nearest room of
  // the site known of and not yet entered, by the known ways: the rest of the site, not the way out of it.
  private static onward(campaign: Campaign, screen: Screen, at: { byId: Map<string, Entity>; site: string }):
    Set<string> {
    const visited = new Set(screen.map.filter(p => p.visited).map(p => p.id)), graph = Itineraries.able(campaign);
    const rooms = [...new Set([...graph.values()].flat().map(w => w.to))]
      .filter(id => !visited.has(id) && this.siteOf(at.byId, id) === at.site);
    for (const id of rooms) {
      const first = this.leading(campaign, { here: screen.place.id, id, byId: at.byId, area: at.site, able: true });
      const exit = first && screen.exits.find(e => e.destination.id === first && !e.blocked);
      if (exit) { return new Set([`~${exit.id}`]); }
    }
    return this.outward(campaign, screen, at);
  }
  // Nothing in it left to go into: the way back out of it, toward the nearest place outside it (the hobs' hold walked
  // to its last room, and the page had led with nothing at all: Mission 20's honest play).
  private static outward(campaign: Campaign, screen: Screen,
    at: { byId: Map<string, Entity>; site: string }): Set<string> {
    const here = screen.place.id;
    const first = KnownWays.first(campaign, here, id => this.siteOf(at.byId, id) !== at.site, { able: true });
    const exit = first && screen.exits.find(e => e.destination.id === first && !e.blocked);
    return new Set(exit ? [`^${exit.id}`] : []);
  }
  // The first place on the way out of the site the company is in, by a way open now; none outside a site.
  private static outOf(campaign: Campaign, screen: Screen): string | undefined {
    const byId = EntityIndex.of(campaign.module.entities).byId, site = this.siteOf(byId, screen.place.id);
    if (!site) { return undefined; }
    const first = KnownWays.first(campaign, screen.place.id, id => this.siteOf(byId, id) !== site, { able: true });
    return first && screen.exits.some(e => e.destination.id === first && !e.blocked) ? first : undefined;
  }
  private static siteOf(byId: Map<string, Entity>, id: string): string | undefined {
    return SiteOutsides.siteOf(byId, id);
  }
  // The first place on the way to a place: within the area when it lies in it, two legs away at most when not; by the
  // known ways (KnownWays), the quickest first, or only those the company can take now (able).
  private static leading(campaign: Campaign,
    at: { here: string; id: string; byId: Map<string, Entity>; area?: string; able?: boolean }): string | undefined {
    return KnownWays.first(campaign, at.here, id => Itineraries.within(at.byId, id, at.id),
      { ...at.area ? { area: at.area } : { legs: 2 }, ...at.able ? { able: true } : {} });
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
