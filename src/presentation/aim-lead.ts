import type { Campaign } from '../campaign/campaign';
import type { ExitRow, Screen } from '../ui/screen-types';
import type { Entity, Objective } from '../lang/module';
import { EntityIndex } from '../lang/entity-index';
import { Spatial } from '../lang/spatial';
import { ModuleWriter } from '../lang/module-writer';
import { Stakes } from '../ui/stakes';
import type { ResolvedTarget } from '../ui/objective-target';
import { AimAdvances } from './aim-advances';
import { Undertakings } from './undertakings';
import { CompanyRecall } from './company-recall';
import { KnownWays } from '../ui/known-ways';
import { AimMeans } from './aim-means';
import { AimPlaced } from './aim-placed';

// Where the next step of the aim followed was learned (US-07, PD-08): the way its author says it is gone to by, not
// yet taken (route); what it is toward, not yet come to (toward); at it, where what it waits on is hidden (hidden) or
// to be learned (taught) or come to (beyond) further in, or what bars the way there (barred); or nothing further in,
// its business here (here).
// Or, with every way into it the company knows shut for what it has not got, whoever sells what would open one (means).
// Or where what it waits on comes true by standing there (placed: the crown brought up into daylight, CL-65).
export type LeadSource = 'route' | 'toward' | 'hidden' | 'taught' | 'beyond' | 'barred' | 'deeper' | 'means' | 'here'
  | 'placed';
// The aim followed, and its next step: one record for every reader, heard (the aim), where the step comes from
// (source) and the step itself (next: the places, people or things it is taken to or done with).
export interface AimLead { aim: string; source: LeadSource; next: string[] }

export class AimLeading {
  // At a1's Mistlake, following the brothers' errand to the old writing, the aim had named only the place the company
  // stood in, and nothing said that the speaking door was the step: the writing is read in the hall beyond it (PB-16b).
  // Worked out once for each world and place (a world is never changed, only replaced), as the glance is drawn again
  // and again.
  private static readonly kept = new WeakMap<object, Map<string, AimLead | undefined>>();
  static of(campaign: Campaign, screen: Screen): AimLead | undefined {
    const def = Undertakings.followed(campaign), w = campaign.world;
    if (!def) { return undefined; }
    const known = this.kept.get(w) ?? this.kept.set(w, new Map()).get(w)!, key = `${def.id}|${screen.place.id}`;
    if (!known.has(key)) { known.set(key, this.lead(campaign, screen, def)); }
    return known.get(key);
  }
  // Whether what the aim followed waits on lies here, to be found or learned: here is then the step, and no way out
  // toward what the aim names (in the drain, its letters unfound, the way to the undercroft had been gold, and there
  // the way back to the drain: the first quarter hour's census, 19 November).
  static lies(campaign: Campaign, screen: Screen): boolean {
    const lead = this.of(campaign, screen);
    return !!lead && ['hidden', 'taught'].includes(lead.source) && lead.next[0] === screen.place.id;
  }
  // The way its author says the aim is gone to by, while it is still to be taken (see AimRoute.routed).
  static route(campaign: Campaign, screen: Screen): AimLead | undefined {
    const def = Undertakings.followed(campaign), t = def && Stakes.target(campaign, def);
    return t?.routeTo && t.routeTo !== t.actionAt && !this.there(campaign, screen, t)
      ? { aim: def!.id, source: 'route', next: [t.routeTo] } : undefined;
  }
  private static lead(campaign: Campaign, screen: Screen, def: Objective): AimLead {
    const route = this.route(campaign, screen), named = Stakes.named(campaign, def), aim = def.id;
    if (route) { return route; }
    const placed = AimPlaced.of(campaign, def);
    if (placed) { return { aim, source: 'placed', next: [placed.place] }; }
    // Gone in past the place it names, what it waits on further in is still the step, not the way back out to it (a
    // hold gone into from its porch had led back to the porch).
    const within = this.within(campaign, screen, def);
    if (!this.at(campaign, screen, named) && !this.entered(campaign, screen, named)) {
      return within ?? AimMeans.lead(campaign, def, named) ?? { aim, source: 'toward', next: [...named] };
    }
    return within ?? this.deeper(campaign, screen, named, aim) ?? AimMeans.lead(campaign, def, named)
      ?? { aim, source: 'here', next: [screen.place.id] };
  }
  // Inside a site gone into from a place the aim names (Ironkeep's gate-passage, from the room before its gate): on
  // the aim's ground still, never led back out to the mouth (the gold had gone in and straight out again).
  private static entered(campaign: Campaign, screen: Screen, named: Set<string>): boolean {
    const byId = EntityIndex.of(campaign.module.entities).byId;
    const site = this.siteOf(byId, screen.place.id), joins = this.joins(campaign);
    return !!site && [...named].some(n => (joins.get(n) ?? []).some(p => this.siteOf(byId, p) === site));
  }
  private static siteOf(byId: Map<string, Entity>, id: string): string | undefined {
    return Spatial.ancestry(byId, id).find(x => x.space?.kind === 'site')?.id;
  }
  // At the mouth of a site the aim names whole (Ironkeep, "what is in such places could pay it"), or in it, with
  // nothing known inside that it waits on: the rooms not yet been to (the owner's trust contracts, B: the gold had
  // said "Set out for Ironkeep" and gone out at its gate, saying nothing).
  private static deeper(campaign: Campaign, screen: Screen, named: Set<string>, aim: string): AimLead | undefined {
    // The aim names the site, or its mouth (a1's Ironkeep is named by the room before its gate): the way in is to a
    // room within a site, from a place the aim names.
    const byId = EntityIndex.of(campaign.module.entities).byId, recall = CompanyRecall.of(campaign);
    const here = this.siteOf(byId, screen.place.id), inward = screen.exits.filter(e => {
      const site = this.siteOf(byId, e.destination.id);
      const ours = !!site && (named.has(site) || named.has(screen.place.id) || site === here);
      return ours && !recall.been(e.destination.id);
    });
    // Nothing it waits on is known to lie within, so the rooms are exploration, never gold (the lead's ruling of 13
    // November, PL-23: the debt's gold had walked the hobs' hold into an empty spy-crack); the lead says so, a frontier
    // the page names (AimContinuity), its next the way in, or what bars it (Ironkeep's portcullis).
    const into = inward.find(e => !this.barred(e)), shut = inward.find(e => this.barred(e));
    const bar = shut && (this.bar(campaign, screen.place.id, shut.destination.id) ?? this.done(shut.acts)[0]);
    // What bars the only way in is the step, as any bar is (AT-14: a winch's wheel had been a 'deeper' lead, and the
    // gold went on elsewhere).
    if (!into && bar) { return { aim, source: 'barred', next: [bar] }; }
    return into ? { aim, source: 'deeper', next: [into.destination.id] } : undefined;
  }
  // In the place it is gone to by, at what it is toward, or on the way from the one to the other.
  static there(campaign: Campaign, screen: Screen, t: ResolvedTarget): boolean {
    const byId = EntityIndex.of(campaign.module.entities).byId, line = Spatial.ancestry(byId, screen.place.id);
    const at = t.actionAt ?? (t.subject ? campaign.world.one('at', t.subject) : undefined);
    return line.some(e => e.id === t.routeTo || e.id === at) || (!!at && this.between(campaign, t.routeTo!, at)
      .has(screen.place.id));
  }
  // Whether the company stands in a place the aim names, or where someone or something it names is.
  private static at(campaign: Campaign, screen: Screen, named: Set<string>): boolean {
    const byId = EntityIndex.of(campaign.module.entities).byId, w = campaign.world;
    const places = new Set([...named].flatMap(id => byId.get(id)?.space ? [id] : w.one('at', id) ?? []));
    return Spatial.ancestry(byId, screen.place.id).some(e => places.has(e.id));
  }
  // Further into the site the company stands in, or at the door of: the nearest place where what the aim waits on is
  // hidden or to be learned, or, where the first way there is barred, what bars it (its acts are the step).
  private static within(campaign: Campaign, screen: Screen, def: Objective): AimLead | undefined {
    const byId = EntityIndex.of(campaign.module.entities).byId, here = screen.place.id;
    const sites = new Set([here, ...screen.exits.map(e => e.destination.id)].flatMap(id => this.site(byId, id) ?? []));
    const found = [...AimAdvances.sought(campaign).map(p => ['hidden', p] as const),
      ...AimAdvances.taughtAt(campaign).map(p => ['taught', p] as const),
      ...AimAdvances.unreached(campaign).map(p => ['beyond', p] as const)]
      .filter(([, p]) => sites.has(this.site(byId, p) ?? ''));
    // Where it lies here, here is the step (the search of this place), never the next place it lies in: in the drain,
    // its letters unfound, the lead had been the ossuary's, and in the undercroft between them the drain's again (the
    // first quarter hour's census, 19 November).
    const own = found.find(([, p]) => p === here);
    if (own) { return { aim: def.id, source: own[0], next: [here] }; }
    const near = found.map(([source, p]) => ({ source, p, way: this.toward(campaign, here, p) }))
      .filter(x => x.way.length > 1).toSorted((a, b) => a.way.length - b.way.length)[0];
    if (!near) { return undefined; }
    const exit = screen.exits.find(e => e.destination.id === near.way[1]), to = near.way[1]!;
    const bar = exit && this.barred(exit) ? this.bar(campaign, here, to) ?? this.done(exit.acts)[0] : undefined;
    return bar ? { aim: def.id, source: 'barred', next: [bar] } : { aim: def.id, source: near.source, next: [near.p] };
  }
  // The site a place is in; or, under the ground with no site over it, the ground under the place it is within: the
  // rooms under a town are one site to what an aim waits on there (the first quarter hour's census, 19 November: the
  // undercroft's flag waiting on letters cut in the drain and the ossuary, and the gold had gone back and forth
  // between the undercroft and the charnel passage, each place's lead by a different reading).
  private static site(byId: Map<string, Entity>, id: string): string | undefined {
    const line = Spatial.ancestry(byId, id), site = line.find(e => e.space?.kind === 'site')?.id;
    const under = byId.get(id)?.space?.shelter === 'underground' ? line[1]?.id : undefined;
    return site ?? (under && `${under}:under`);
  }
  // What stands on the way from one place to the next and bars it now (the speaking door, sealed).
  private static bar(campaign: Campaign, from: string, to: string): string | undefined {
    const w = campaign.world, ways = new Set(w.related('connects').filter(l => l.args[1] === from && l.args[2] === to)
      .map(l => l.args[0]!));
    const on = w.relates('on') ? w.related('on').filter(r => ways.has(r.args[1]!)).map(r => r.args[0]!) : [];
    const blocks = w.relates('blocksWhen') ? w.related('blocksWhen') : [];
    return on.find(t => blocks.some(b => b.args[0] === t && w.test(ModuleWriter.call('state', t, b.args[1]!))))
      ?? [...ways].map(way => this.works(campaign, way)).find(Boolean);
  }
  // A way that opens only while a thing is so (Passage … opening when state(gear, turning), its rule <way>__opens),
  // still shut: what it turns on bars it (AT-14: the barrow's winch had barred the stair, and the lead knew no bar; as
  // GlanceLines.works reads a way's works).
  private static works(campaign: Campaign, way: string): string | undefined {
    const rule = (campaign.module.rules ?? []).find(r => r.id === `${way}__opens`);
    if (!rule || !campaign.world.test(ModuleWriter.call('unopened', way))) { return undefined; }
    const gears: string[] = [];
    ModuleWriter.conditionCalls(rule.when, c => { if (c.name === 'state') { gears.push(c.args[0]!); } return c; });
    return gears[0];
  }
  // Else what the acts at a way are done to (the speaking door, under "Look at the speaking door").
  private static done(acts: ExitRow['acts']): string[] {
    return [...new Set(acts.flatMap(a => [...a.targets ?? [], ...this.done(a.children ?? [])]))];
  }
  // A way nothing open crosses: blocked, or every act at it not to be done now.
  private static barred(e: ExitRow): boolean {
    return !e.acts.some(a => a.moves && !a.disabled) && (!!e.blocked || e.acts.some(a => a.disabled));
  }
  // The places on the quickest way from one place to another (the first first), or none: by the ways the company
  // knows (KnownWays), with those something bars (what bars the first is the step), never through a room it has not
  // been to nor been told of. Over every way the world joins, the lead had walked rooms not yet come to, toward where
  // something lay hidden, and named the bar of a door it had never seen (AR-21).
  static way(campaign: Campaign, from: string, to: string): string[] {
    return KnownWays.places(campaign, from, to, { barred: true });
  }
  // Toward a place in a site by the ways known: there, where they go there; else as far as they go into that site, to
  // the nearest room of it the company knows of and has not been in (the well-room beyond the hall, from the porch):
  // the room the aim waits on is said, never the way to it through rooms not yet seen.
  private static toward(campaign: Campaign, from: string, to: string): string[] {
    const known = this.way(campaign, from, to);
    if (known.length) { return known; }
    const byId = EntityIndex.of(campaign.module.entities).byId, site = this.site(byId, to);
    const recall = CompanyRecall.of(campaign);
    const legs = site ? KnownWays.way(campaign, from, id => this.site(byId, id) === site && !recall.been(id),
      { barred: true })?.legs : undefined;
    return legs ? [from, ...legs.map(l => l.to)] : [];
  }
  // Where each place's ways go, read once for each world.
  private static readonly joined = new WeakMap<object, Map<string, string[]>>();
  private static joins(campaign: Campaign): Map<string, string[]> {
    const w = campaign.world, kept = this.joined.get(w);
    if (kept) { return kept; }
    const next = new Map<string, string[]>();
    for (const l of w.related('connects')) { next.set(l.args[1]!, [...next.get(l.args[1]!) ?? [], l.args[2]!]); }
    this.joined.set(w, next);
    return next;
  }
  static between(campaign: Campaign, from: string, to: string): Set<string> {
    return new Set(this.way(campaign, from, to));
  }
}
