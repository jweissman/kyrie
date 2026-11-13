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

// What pulls once an aim followed is seen through (M21's playability list, PL-06; the lead's ruling, 13 November:
// ranks 1 and 2 only). Said once, as the aim ends, and offered, never followed for the player: an aim seen through had
// left "No aim is held" with the drover's yoke among the bones, and Odo's "I want the yoke back" said nothing more.
// First the deed's own consequence: something carried, or lying here to be taken, that an act elsewhere is for, with
// whoever it is for standing there (the yoke, to be hung over the drover's hearth). Then the strongest lead not
// followed: an aim held, the nearest first; else the nearest place a thing the company knows leads to, not yet been to.
// Later (not built): a person's own trouble glimpsed, the notice last, and, after two or three aims in one town, a lead
// that is a site of the country's history preferred over another notice (T24-18's larger adventure).
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
  // known leads, not yet been to, the nearest.
  private static lead(campaign: Campaign, screen: Screen): Successor | undefined {
    const aim = screen.aims?.find(a => !a.followed);
    if (aim) { return { kind: 'lead', text: Sentences.first(aim.text), aim: aim.id }; }
    const w = campaign.world;
    if (!w.relates('leadsTo')) { return undefined; }
    const been = new Set(screen.map.filter(p => p.visited || p.here).map(p => p.id));
    const known = new Map(PlayerView.observe(campaign).knowledge.map(k => [k.id, k.text]));
    const leads = w.related('leadsTo').filter(l => known.has(l.args[0]!) && !been.has(l.args[1]!))
      .flatMap(l => { const plan = Itineraries.plan(campaign, l.args[1]!);
        return plan ? [{ fact: l.args[0]!, place: l.args[1]!, minutes: plan.minutes }] : []; })
      .toSorted((a, b) => a.minutes - b.minutes);
    const best = leads[0];
    if (!best) { return undefined; }
    const name = ObservationText.label(w, best.place);
    return { kind: 'lead', text: Sentences.first(known.get(best.fact)!), command: `travel:${best.place}`,
      label: `To ${name}` };
  }
}
