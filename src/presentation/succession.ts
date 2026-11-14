import type { Campaign } from '../campaign/campaign';
import type { Entity, Operator } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { EntityIndex } from '../lang/entity-index';
import { ObservationText } from '../lang/observation-text';
import { Spatial } from '../spatial';
import { Itineraries } from '../ui/itinerary';
import type { Screen } from '../ui/screen-types';
import type { Successor } from './glance-types';
import { PlayerView } from './player-view';
import { Sentences } from './sentences';
import type { Told } from './narrator';
import { Undertakings } from './undertakings';
import { SeenThrough } from '../ui/seen-through';

// What pulls once an aim followed is seen through (M21's playability list, PL-06; the lead's ruling, 13 November:
// ranks 1 and 2 only). Said once, as the aim ends, and offered, never followed for the player: an aim seen through had
// left "No aim is held" with the drover's yoke among the bones, and Odo's "I want the yoke back" said nothing more.
// First the deed's own consequence: something carried, or lying here to be taken, that an act elsewhere is for, with
// whoever it is for standing there (the yoke, to be hung over the drover's hearth). Then the strongest lead not
// followed: an aim held, the nearest first; else the nearest place a thing the company knows leads to, not yet been to.
// Then an act here that would tell of somewhere not yet been to, and the nearest site on the map; and, once two aims
// are seen through, a site something known leads to before another of the town's jobs (T24-18's larger adventure).
export class Succession {
  // The glance's part: after an act, what pulls next, where anything does.
  static next(campaign: Campaign, screen: Screen, told?: Told): { next?: Successor } {
    const next = told && this.of(campaign, screen, told);
    return next ? { next } : {};
  }
  static of(campaign: Campaign, screen: Screen, told: Told): Successor | undefined {
    if (told.feedback.closed) { return this.consequence(campaign, screen) ?? this.lead(campaign, screen); }
    // And the thing that consequence is for, just taken with no aim followed: where it is to be taken now, once.
    const done = campaign.operator(told.event.action);
    return !Undertakings.followed(campaign) && this.takes.includes(done?.schema ?? '') && done?.bindings?.find
      ? this.consequence(campaign, screen, done.bindings.find) : undefined;
  }
  private static readonly takes = ['take_item', 'take_out'];
  // An act written for one thing (Requires … ownedItem(yoke, …)), the thing carried or lying here, someone the act
  // asks for standing where it would be done: done there, it is offered as the place to take it; lying here, the
  // taking of it.
  private static consequence(campaign: Campaign, screen: Screen, only?: string): Successor | undefined {
    const w = campaign.world, actor = campaign.playerActor ?? 'party', rows = PlayerView.choices(campaign);
    const byId = EntityIndex.of(campaign.module.entities).byId;
    const taking = new Map(rows.filter(r => this.takes.includes(r.action.schema ?? ''))
      .map(r => [r.action.bindings?.find ?? '', r] as const));
    for (const a of campaign.module.actions) {
      const calls = this.calls(a);
      const thing = calls.flatMap(c => c.args).find(id => byId.get(id)?.type === 'item' && (!only || id === only)
        && (taking.has(id) || w.test(ModuleWriter.call('carries', actor, id))));
      const who = calls.find(c => c.name === 'at' && c.args[0] !== 'actor' && byId.get(c.args[0]!)?.type === 'group');
      const place = who && w.one('at', who.args[0]!);
      if (!thing || !place || place === screen.place.id || !this.would(campaign, a, { place, thing })) { continue; }
      const take = taking.get(thing), there = this.town(byId, place, screen.place.id);
      if (!take && !Itineraries.plan(campaign, there)) { continue; }
      return { kind: 'consequence', text: a.name, at: ObservationText.label(w, there),
        ...take ? { command: take.choice.id, label: take.choice.name }
          : { command: `travel:${there}`, label: `To ${ObservationText.label(w, there)}` } };
    }
    return undefined;
  }
  private static calls(a: Operator): { name: string; args: string[] }[] {
    const out: { name: string; args: string[] }[] = [];
    ModuleWriter.conditionCalls(a.requires, c => { out.push(c); return c; });
    return out;
  }
  // Whether the act would be offered were the company standing there with the thing: carried already, or as if it
  // were taken (by the first of the company).
  private static would(campaign: Campaign, a: Operator, at: { place: string; thing: string }): boolean {
    const w = campaign.world, actor = campaign.playerActor ?? 'party', here = w.one('at', actor);
    const member = w.related('memberOf').find(r => r.args[1] === actor)?.args[0];
    if (!here || !member) { return false; }
    const lying = !w.test(ModuleWriter.call('carries', actor, at.thing)), was = w.one('at', at.thing);
    const moved = w.apply([{ kind: 'retract', call: ModuleWriter.call('at', actor, here) },
      { kind: 'assert', call: ModuleWriter.call('at', actor, at.place) },
      ...lying ? [{ kind: 'assert' as const, call: ModuleWriter.call('ownedItem', at.thing, member) },
        ...was ? [{ kind: 'retract' as const, call: ModuleWriter.call('at', at.thing, was) }] : []] : []]);
    return campaign.operators.applicable(moved, actor, new Set([a.id])).length > 0;
  }
  // The town or site a place lies in, as the company sets out for it; the place itself where it lies in neither, or
  // in the one the company is in.
  private static town(byId: Map<string, Entity>, place: string, here: string): string {
    const town = this.within(byId, place);
    return town && town !== this.within(byId, here) ? town : place;
  }
  private static within(byId: Map<string, Entity>, id: string): string | undefined {
    return Spatial.ancestry(byId, id).find(e => ['settlement', 'site'].includes(e.space?.kind ?? ''))?.id;
  }
  // An aim held and not followed, as the notes order them (where the company stands first); else where something
  // known leads, not yet been to, the nearest; else an act here that would tell of such a place (Eamon's "what is out
  // in the country round"); else the nearest site on the company's map not yet been to. Once two aims have been seen
  // through, a site something known leads to comes before another of the town's jobs, so that the first hour bends
  // toward one larger place (round 12's T24-18: after each job it moved on to the next notice, and then nothing).
  private static lead(campaign: Campaign, screen: Screen): Successor | undefined {
    const aim = screen.aims?.find(a => !a.followed);
    const larger = SeenThrough.of(campaign).length >= 2 ? this.known(campaign, screen, true) : undefined;
    if (larger) { return larger; }
    if (aim) { return { kind: 'lead', text: Sentences.first(aim.text), aim: aim.id }; }
    return this.known(campaign, screen, false) ?? this.telling(campaign, screen) ?? this.site(campaign, screen);
  }
  // Where something the company knows leads, not yet been to, the nearest (a site only, where sites is asked).
  private static known(campaign: Campaign, screen: Screen, sites: boolean): Successor | undefined {
    const w = campaign.world;
    if (!w.relates('leadsTo')) { return undefined; }
    const been = this.been(screen), byId = EntityIndex.of(campaign.module.entities).byId;
    const known = new Map(PlayerView.observe(campaign).knowledge.map(k => [k.id, k.text]));
    const leads = w.related('leadsTo').filter(l => known.has(l.args[0]!) && !been.has(l.args[1]!)
      && (!sites || this.inSite(byId, l.args[1]!)))
      .flatMap(l => { const plan = Itineraries.plan(campaign, l.args[1]!);
        return plan ? [{ fact: l.args[0]!, place: l.args[1]!, minutes: plan.minutes }] : []; })
      .toSorted((a, b) => a.minutes - b.minutes);
    const best = leads[0];
    if (!best) { return undefined; }
    const name = ObservationText.label(w, best.place);
    return { kind: 'lead', text: Sentences.first(known.get(best.fact)!), command: `travel:${best.place}`,
      label: `To ${name}` };
  }
  // An act here that would tell the company of a place it has not been to (a question whose answer leads there).
  private static telling(campaign: Campaign, screen: Screen): Successor | undefined {
    const w = campaign.world, been = this.been(screen);
    const leads = new Set(w.related('leadsTo').filter(l => !been.has(l.args[1]!)).map(l => l.args[0]!));
    const known = new Set(PlayerView.observe(campaign).knowledge.map(k => k.id));
    const row = leads.size ? PlayerView.choices(campaign).find(r => r.action.success.some(c => c.kind === 'assert'
      && c.call.name === 'knows' && leads.has(c.call.args[1]!) && !known.has(c.call.args[1]!))) : undefined;
    return row && { kind: 'lead', text: row.choice.name, command: row.choice.id, label: row.choice.name };
  }
  // The nearest site on the company's map it has not been to, that it can set out for.
  private static site(campaign: Campaign, screen: Screen): Successor | undefined {
    const byId = EntityIndex.of(campaign.module.entities).byId;
    const best = screen.map.filter(p => !p.visited && !p.here && byId.get(p.id)?.space?.kind === 'site')
      .flatMap(p => { const plan = Itineraries.plan(campaign, p.id);
        return plan ? [{ p, minutes: plan.minutes }] : []; })
      .toSorted((a, b) => a.minutes - b.minutes)[0];
    return best && { kind: 'lead', text: best.p.name, command: `travel:${best.p.id}`, label: `To ${best.p.name}` };
  }
  private static been(screen: Screen): Set<string> {
    return new Set(screen.map.filter(p => p.visited || p.here).map(p => p.id));
  }
  private static inSite(byId: Map<string, Entity>, place: string): boolean {
    return Spatial.ancestry(byId, place).some(e => e.space?.kind === 'site');
  }
}
