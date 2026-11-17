import type { Campaign } from '../campaign/campaign';
import type { ExitRow, Screen } from '../ui/screen-types';
import type { Entity, Objective } from '../lang/module';
import { EntityIndex } from '../lang/entity-index';
import { Spatial } from '../spatial';
import { ModuleWriter } from '../lang/module-writer';
import { Stakes } from '../ui/stakes';
import type { ResolvedTarget } from '../ui/objective-target';
import { AimAdvances } from './aim-advances';
import { Undertakings } from './undertakings';

// Where the next step of the aim followed was learned (US-07, PD-08): the way its author says it is gone to by, not
// yet taken (route); what it is toward, not yet come to (toward); at it, where what it waits on is hidden (hidden) or
// to be learned (taught) or come to (beyond) further in, or what bars the way there (barred); or nothing further in,
// its business here (here).
export type LeadSource = 'route' | 'toward' | 'hidden' | 'taught' | 'beyond' | 'barred' | 'here';
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
  // The way its author says the aim is gone to by, while it is still to be taken (see AimRoute.routed).
  static route(campaign: Campaign, screen: Screen): AimLead | undefined {
    const def = Undertakings.followed(campaign), t = def && Stakes.target(campaign, def);
    return t?.routeTo && t.routeTo !== t.actionAt && !this.there(campaign, screen, t)
      ? { aim: def!.id, source: 'route', next: [t.routeTo] } : undefined;
  }
  private static lead(campaign: Campaign, screen: Screen, def: Objective): AimLead {
    const route = this.route(campaign, screen), named = Stakes.named(campaign, def), aim = def.id;
    if (route) { return route; }
    if (!this.at(campaign, screen, named)) { return { aim, source: 'toward', next: [...named] }; }
    return this.within(campaign, screen, def) ?? { aim, source: 'here', next: [screen.place.id] };
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
      .filter(([, p]) => p !== here && sites.has(this.site(byId, p) ?? ''));
    const near = found.map(([source, p]) => ({ source, p, way: this.way(campaign, here, p) }))
      .filter(x => x.way.length > 1).toSorted((a, b) => a.way.length - b.way.length)[0];
    if (!near) { return undefined; }
    const exit = screen.exits.find(e => e.destination.id === near.way[1]), to = near.way[1]!;
    const bar = exit && this.barred(exit) ? this.bar(campaign, here, to) ?? this.done(exit.acts)[0] : undefined;
    return bar ? { aim: def.id, source: 'barred', next: [bar] } : { aim: def.id, source: near.source, next: [near.p] };
  }
  private static site(byId: Map<string, Entity>, id: string): string | undefined {
    return Spatial.ancestry(byId, id).find(e => e.space?.kind === 'site')?.id;
  }
  // What stands on the way from one place to the next and bars it now (the speaking door, sealed).
  private static bar(campaign: Campaign, from: string, to: string): string | undefined {
    const w = campaign.world, ways = new Set(w.related('connects').filter(l => l.args[1] === from && l.args[2] === to)
      .map(l => l.args[0]!));
    const on = w.relates('on') ? w.related('on').filter(r => ways.has(r.args[1]!)).map(r => r.args[0]!) : [];
    const blocks = w.relates('blocksWhen') ? w.related('blocksWhen') : [];
    return on.find(t => blocks.some(b => b.args[0] === t && w.test(ModuleWriter.call('state', t, b.args[1]!))));
  }
  // Else what the acts at a way are done to (the speaking door, under "Look at the speaking door").
  private static done(acts: ExitRow['acts']): string[] {
    return [...new Set(acts.flatMap(a => [...a.targets ?? [], ...this.done(a.children ?? [])]))];
  }
  // A way nothing open crosses: blocked, or every act at it not to be done now.
  private static barred(e: ExitRow): boolean {
    return !e.acts.some(a => a.moves && !a.disabled) && (!!e.blocked || e.acts.some(a => a.disabled));
  }
  // The places on the shortest way from one place to another, as the world joins them (the first first), or none.
  static way(campaign: Campaign, from: string, to: string): string[] {
    const next = this.joins(campaign), came = new Map<string, string>([[from, '']]);
    for (const queue = [from]; queue.length && !came.has(to);) {
      const here = queue.shift()!;
      for (const there of next.get(here) ?? []) {
        if (!came.has(there)) { came.set(there, here); queue.push(there); }
      }
    }
    const on: string[] = [];
    for (let at = came.has(to) ? to : ''; at; at = came.get(at)!) { on.unshift(at); }
    return on;
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
