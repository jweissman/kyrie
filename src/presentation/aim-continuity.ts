import type { Campaign } from '../campaign/campaign';
import { Knowing } from './knowing';
import type { Screen } from '../ui/screen-types';
import type { Candidate, Situation } from '../ui/promotion';
import { Promotion } from '../ui/promotion';
import { PlayerFrame } from './player-frame';
import { EntityIndex } from '../lang/entity-index';
import { Spatial } from '../lang/spatial';
import { Itineraries } from '../ui/itinerary';
import { Undertakings } from './undertakings';
import { Stakes } from '../ui/stakes';
import { CompanyLight } from './company-light';
import { AimLeading, type AimLead } from './aim-lead';
import type { Promoted } from './glance-types';
import type { Entity } from '../lang/index';
import { KnownWays } from '../ui/known-ways';
import { AimAdvances } from './aim-advances';
import { Outmatched } from './outmatched';
import { Guarded } from './guarded';
import { Shut } from './shut';
import { Unread } from './unread';
import { AimMeans } from './aim-means';

// How the aim followed goes on from here (the owner's trust contracts, 18 November, B: "Gold must not vanish silently
// because the route planner and local opportunity projection interpret an objective differently"). Gold had been an
// act's reasons (what the aim names, as the route planner reads it) and the lead (AimLeading, the resolved
// objective-target) said the step apart; where they parted (inside a site the aim names whole, at a bar nothing here
// opens, where a search found nothing) the lead named a step and nothing was gold. Now the lead decides, and one of
// four is always so, said with the glance (Glance.continuance):
//   step:     an act of the four is the step, gold (Promotion.continued);
//   gilded:   none was, but one offered here acts on the lead's step: it is led with, gold;
//   led:      the step is here and grave (a fight, a trap, a one-way drop): led with, never gold (PB-16b), and said;
//   frontier: nothing offered acts on it: what stands is said (what bars the way, that the place has given what it
//             had), never a silent nothing; need: said with the needs too (a keeper beyond the way: Guarded).
export type Continuance = { kind: 'step' | 'gilded' | 'led'; witness: string; said?: string }
  | { kind: 'frontier'; said: string; need?: true };

// What was led with, what could be, and, where the aim's fight would end the one who goes alone, who to take along.
// out: the ways out of what the aim is about (Threshold.leaving), each a retreat.
type Led = { acts: Promoted[]; cands: Candidate[]; s: Situation; help?: { who: string; at: string }; aside?: string;
  out?: Set<string> };

export class AimContinuity {
  static readonly grave = ['grave', 'fight', 'trap', 'one-way'];
  static readonly dark = 'Your aim\'s way goes into the dark, and you have nothing to see by.';
  static of(campaign: Campaign, screen: Screen, at: Led): { acts: Promoted[]; continuance?: Continuance } {
    const { acts, cands } = at, lead = AimLeading.of(campaign, screen);
    if (!Undertakings.followed(campaign) || !lead) { return { acts }; }
    // Where the aim's fight would end the one who goes alone (Outmatched's help), the aim's way is no step: someone to
    // take along is led, and said (OR-412: thorn's lone warrior had been led down to the she-bear and the keeper).
    const early = this.early(campaign, at);
    if (early) { return early; }
    // A way gold by the glance's reading is the step only where it goes on the lead's way, when it goes back to a
    // place already been to (AT-14: from the back-stone the gold had led back to the chamber the lead had come from,
    // and the two pointed at each other) or where another way offered here does go on it (AT-15: from the chamber,
    // the back-stone and the stair down from it known, the gold had gone into a side recess); taken off, the lead
    // decides. Toward a place, or by the author's route or the means, the glance's ways are the lead's; a way toward
    // where what the aim waits on lies hidden, a way into what is not yet seen with nothing else known, and an act done
    // here (the ruts followed, the search), are the glance's to gild, as before.
    // A wait is led with only in the dark, except where the aim's step is to stand here until the day (AimPlaced).
    const dawn = lead.source === 'placed' && lead.next[0] === screen.place.id;
    const eligible = cands.filter(c => !c.barred && !c.held && (Promotion.eligible(c, at.s) || (dawn && c.kind === 'wait')));
    const gold = acts.find(a => a.continues), way = gold && cands.find(c => c.choice === gold.choice)?.exit;
    const back = way ? screen.exits.find(e => e.id === way) : undefined;
    // The way back in to a keeper met there, that the company reckons beyond it: no step of the aim's, and said (see
    // Guarded; the vault's stair had been gold and back again forty times on the first quarter hour's walk).
    const guard = back && Guarded.beyond(campaign, back.destination.id);
    // Nor led at all: the page leads into no fight that could end the one who plays (OR-412); unless it is the only
    // way on from here, which is led plain, never gold (OR-411: a lone warrior at Windtower's well-chamber, its one
    // way out past the lookouts, had been led nothing at all).
    if (gold && back && guard) {
      return { acts: this.guarded(acts, gold, { cands, exit: back.id, screen }),
        continuance: { kind: 'frontier', said: Guarded.said(back.way ?? back.name, guard), need: true } };
    }
    // What shuts the company out of the aim's place, met and with nothing to open it, or a keeper beyond the company
    // at the aim's place itself, from further off than the way in: no step either (see Shut; OR-171).
    const shut = this.shut(campaign, screen, lead);
    if (shut) {
      return { acts: this.besides(campaign, { acts, cands }), continuance: { kind: 'frontier', said: shut, need: true } };
    }
    // Where what the aim waits on lies here to be found or learned (AimLeading.lies), no way out is its step: in the
    // ossuary, the lettered flag's ring to be found there, the way on into the crypt had been gold, and in the crypt
    // nothing, and the way back (OR-168).
    if (gold && back && AimLeading.lies(campaign, screen)) {
      return this.of(campaign, screen, { ...at, acts: acts.map(a => a === gold ? this.plain(a) : a) });
    }
    const weighed = !!gold && !!back && !['route', 'toward', 'means'].includes(lead.source);
    const on = weighed ? this.acting(campaign, screen, lead, eligible) : [];
    const off = weighed && (on.length > 0 || !!back.visited) && !on.some(c => c.choice === gold.choice)
      && !this.sought(campaign, screen, back.destination.id, lead.aim);
    if (gold && !off) { return { acts, continuance: { kind: 'step', witness: gold.choice } }; }
    if (gold) { return this.of(campaign, screen, { ...at, acts: acts.map(a => a === gold ? this.plain(a) : a) }); }
    // Inside a site with nothing known to lie within (AimLeading.deeper): a frontier, named, its rooms exploration.
    if (lead.source === 'deeper') { return { acts, continuance: { kind: 'frontier', said: this.deeper(campaign, screen) } }; }
    // Never a way into the dark with nothing to see by (CompanyLight): said, the need beside it saying why.
    const unlit = CompanyLight.of(campaign, screen).dark;
    const ways = new Map(screen.exits.map(e => [e.id, e.destination.id]));
    const reached = this.acting(campaign, screen, lead, eligible);
    const acting = reached.filter(c => !c.exit || !unlit?.has(ways.get(c.exit) ?? ''));
    if (!acting.length && reached.length) {
      return { acts, continuance: { kind: 'frontier', said: this.dark } };
    }
    const safe = acting.find(c => !c.marks.some(m => this.grave.includes(m.kind)));
    if (safe) {
      const gilded = Promotion.gild(safe), rest = acts.filter(a => a.choice !== safe.choice);
      const kept = Promotion.continued([gilded, ...rest].slice(0, Promotion.all));
      return { acts: kept, continuance: { kind: 'gilded', witness: safe.choice } };
    }
    const grave = acting[0];
    if (grave) {
      return { acts, continuance: { kind: 'led', witness: grave.choice, said: `${grave.label}: your aim's way, at a risk.` } };
    }
    // The step just tried here and not come off, where nothing led it again (a fresh try at the aim's step is led, and
    // gold: CompanyRecall.missed, OR-241): never said to be nothing that bears on the aim (cold play 5's 10, CL-33:
    // failed at the windlass, the frontier had said nothing here bore on the aim; the next try shut the gate).
    const retry = this.retry(campaign, cands);
    if (retry) {
      return { acts, continuance: { kind: 'frontier', said: `${retry.label.split(' · ')[0]}: that try did not come off.`
        + ' Another may, or more hands.' } };
    }
    // Something can be done to the bar, but none of it is the step yet (the speaking door's words, a guess until its
    // letters are read): never "nothing here opens it".
    const tried = PlayerFrame.of(campaign).rows.some(r => Object.entries(r.action.bindings ?? {})
      .some(([k, v]) => k !== 'actor' && lead.next.includes(v)));
    // With nothing led here but the bare ways on, the way out toward the town (OR-411: in the ossuary, the crypt's
    // stair up barred and dark, the gold had gone to the crypt and back nine times, nothing marked).
    const bare = acts.length > 0 && acts.every(a => a.why === 'way'), said = this.frontier(campaign, lead, tried);
    return { acts: bare ? this.townward(campaign, at) : acts, continuance: { kind: 'frontier', said } };
  }
  // Where the aim's place is shut to the company from here (Shut): not where the bar itself is the step, or the means.
  // The four without the way into a keeper beyond the company; where that leaves nothing, the way back the company came
  // in by, plain, out toward the town (OR-411: the son at Windtower's door, led in and out again); and where the way in
  // is the only way there is (the well-chamber's), that way plain.
  private static guarded(acts: Promoted[], gold: Promoted,
    at: { cands: Candidate[]; exit: string; screen: Screen }): Promoted[] {
    const { cands, exit, screen } = at, rest = acts.filter(a => a !== gold);
    if (rest.length) { return rest; }
    const visited = new Set(screen.exits.filter(e => e.visited && !e.blocked && e.id !== exit).map(e => e.id));
    const home = cands.find(c => c.exit && visited.has(c.exit) && ['way', 'travel'].includes(c.kind));
    return home ? [this.plain(Promotion.gild(home))] : [this.plain(gold)];
  }
  // What leads besides the aim, where its place is shut to the company: never its ways, which go on toward what is
  // shut (thorn's walk, the vault's keeper beyond the company: the way toward the vault had led on, plain, the
  // undercroft and the charnel passage to and fro, nothing marked: OR-411). With nothing else, the way out toward the
  // town, where the next lead is.
  private static besides(campaign: Campaign, at: Pick<Led, 'acts' | 'cands' | 'out'>): Promoted[] {
    const own = at.acts.filter(a => !a.continues && a.why !== 'way' && !Promotion.continuing.includes(a.why));
    return own.length ? own : this.townward(campaign, at);
  }
  // Help to be had leads first (Outmatched); else, set aside while a keeper met bars its way (AimAside): no step,
  // and the need says why.
  private static early(campaign: Campaign, at: Led): { acts: Promoted[]; continuance: Continuance } | undefined {
    if (at.help) { return this.helped(campaign, at.acts, at.help.who); }
    if (!at.aside) { return undefined; }
    // What leads for its own sake stays; with nothing but the bare ways on, the way toward the nearest town, where the
    // notice or the next true lead is (the coordinator's call on OR-411: not to and fro outside; see besides).
    return { acts: this.besides(campaign, at), continuance: { kind: 'frontier', said: at.aside, need: true } };
  }
  // The way toward the first town (else the nearest); or what was led, where there is none. Also where nothing at all
  // is led (see Glance): the next true lead, not nothing (OR-417). Its ground, not the workings under it: from the
  // ossuary, under the town and so within it, the nearest of the town had been the charnel passage next door. Led as
  // the way out (OR-411): somewhere true to go, where the notice, the pay owed or the next lead is, and said so by its
  // icon; plain, on thorn's walk the way back up had been one of the fifteen turns with nothing marked.
  static townward(campaign: Campaign, at: Pick<Led, 'acts' | 'cands' | 'out'>): Promoted[] {
    // Never a retreat drawn as worth a look (test/small/frontier): the way out of what the aim is about is led plain.
    const way = this.homeward(campaign, at.cands);
    const back = !!way && (way.whys.includes('retreat') || !!at.out?.has(way.exit ?? ''));
    return way ? [back ? Promotion.wayOn(way) : Promotion.wayOut(way)] : at.acts;
  }
  private static homeward(campaign: Campaign, cands: Candidate[]): Candidate | undefined {
    const byId = EntityIndex.of(campaign.module.entities).byId, here = Knowing.here(campaign);
    // The first town, where the notice on the well-post is, before any other (else the nearest).
    const post = campaign.module.entities.find(e => /_u_notice_post$/.test(e.id))?.id;
    const home = post
      && Spatial.ancestry(byId, campaign.world.one('at', post) ?? '').find(e => e.space?.kind === 'settlement')?.id;
    const first = here ? KnownWays.first(campaign, here, id => this.above(byId, id) && Spatial.ancestry(byId, id)
      .some(e => home ? e.id === home : e.space?.kind === 'settlement'), { able: true }) : undefined;
    return first ? cands.find(c => !!c.exit && c.exit.endsWith(first)) : undefined;
  }
  // A place on the ground, not under it.
  private static above(byId: Map<string, Entity>, id: string): boolean {
    const space = byId.get(id)?.space;
    return space?.shelter !== 'underground' && !space?.depth;
  }
  private static helped(campaign: Campaign, acts: Promoted[], who: string):
    { acts: Promoted[]; continuance: Continuance } {
    return { acts: acts.map(a => a.continues ? this.plain(a) : a), continuance: { kind: 'frontier', need: true,
      said: `Your aim's fight is beyond ${this.alone(campaign) ? 'you alone' : 'the company as it is'}: `
        + Outmatched.asked(campaign, who) } };
  }
  // Whether the one who plays goes alone: no one of the company, nor travelling with it, besides.
  private static alone(campaign: Campaign): boolean {
    const me = campaign.playerActor;
    const w = campaign.world;
    return campaign.readout.partyIds.length <= 1
      && !(w.relates('travelsWith') && w.related('travelsWith').some(f => f.args[1] === me));
  }
  private static shut(campaign: Campaign, screen: Screen, lead: AimLead): string | undefined {
    if (['barred', 'means', 'placed', 'route'].includes(lead.source) || !lead.next[0]) { return undefined; }
    const byId = EntityIndex.of(campaign.module.entities).byId, next = lead.next[0];
    const to = byId.get(next)?.space ? next : campaign.world.one('at', next);
    const def = Undertakings.followed(campaign), unread = to && def ? Unread.at(campaign, to, def) : undefined;
    if (unread) { return Unread.said(campaign, unread); }
    if (!to || to === screen.place.id) { return undefined; }
    const keeper = Guarded.beyond(campaign, to);
    const shut = !keeper ? this.shutFrom(campaign, screen.place.id, to) : undefined;
    return keeper ? Guarded.said(byId.get(to)?.name ?? to, keeper) : shut && Shut.said(campaign, shut);
  }
  // Whether the aim's place is closed to the company from here, for now (a keeper beyond it, a way shut, what it
  // waits on there not to be read): what the first quarter's walker reads as the need says.
  static closed(campaign: Campaign, from: string, to: string): boolean {
    const def = Undertakings.followed(campaign);
    return !!Guarded.beyond(campaign, to) || !!this.shutFrom(campaign, from, to)
      || (!!def && !!Unread.at(campaign, to, def));
  }
  // Whether a place is shut to the company from another (see AimMeans.shutFrom).
  static shutFrom(campaign: Campaign, from: string, to: string): ReturnType<typeof Shut.of> {
    return AimMeans.shutFrom(campaign, from, to);
  }
  // The offered act that was the last thing done, and did not come off: a fresh try at it is still the aim's step.
  private static retry(campaign: Campaign, cands: Candidate[]): Candidate | undefined {
    const last = campaign.history.at(-1);
    return last?.result === 'failure' ? cands.find(c => !c.barred && c.command === last.action) : undefined;
  }
  // What stands, where nothing offered acts on the step.
  private static frontier(campaign: Campaign, lead: AimLead, tried: boolean): string {
    const bar = lead.next[0]!, name = EntityIndex.of(campaign.module.entities).byId.get(bar)?.name ?? bar;
    if (lead.source === 'barred') {
      return `${this.upper(name)} bars the way, and ${tried ? 'what opens it is still to be worked out' : 'nothing here opens it yet'}.`;
    }
    return 'Nothing here bears on your aim now: what it waits on is still to be found.';
  }
  private static deeper(campaign: Campaign, screen: Screen): string {
    const byId = EntityIndex.of(campaign.module.entities).byId;
    const site = [screen.place.id, ...screen.exits.map(e => e.destination.id)]
      .flatMap(id => Spatial.ancestry(byId, id)).find(e => e.space?.kind === 'site');
    return `Nothing here is known to hold what your aim waits on: ${site?.name ?? 'this place'} is still to be explored.`;
  }
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
  // Whether a way goes toward where what the aim waits on lies hidden, is to be learned or is to be come to, which the
  // glance reads and the lead may not (a1's cross under the door-stone, outside the site gone into past it:
  // test/gold-thread; a hold's rooms each to be been in, in the glance's order: test/small/aim-lead's survey).
  // And where one the aim names stands (the rats of a job to clear them, back in their runs: test/small/idle-aim).
  private static sought(campaign: Campaign, screen: Screen, to: string, aim: string): boolean {
    const named = campaign.module.objectives?.find(o => o.id === aim)?.toward ?? [];
    const there = new Set([...AimAdvances.sought(campaign), ...AimAdvances.taughtAt(campaign),
      ...AimAdvances.unreached(campaign), ...named.flatMap(id => campaign.world.one('at', id) ?? [])]);
    return there.has(to) || (there.size > 0
      && KnownWays.first(campaign, screen.place.id, id => there.has(id), { able: true }) === to);
  }
  // An act no longer gold: not continuing, nor of the aim.
  private static plain(a: Promoted): Promoted {
    const rest = { ...a, aspects: a.aspects.filter(x => x !== 'undertaking') };
    delete rest.continues;
    return rest;
  }
  // The offered acts that act on the lead's step: done to or with what it names, a way to where it is, a journey to
  // the town or site it lies in (as RunnerLed reads the four).
  static acting(campaign: Campaign, screen: Screen, lead: AimLead, cands: Candidate[]): Candidate[] {
    if (!lead.next.length) { return []; }
    const w = campaign.world, byId = EntityIndex.of(campaign.module.entities).byId;
    const def = Undertakings.followed(campaign);
    // At the place the aim names, what its words are about is the step too: the pawl the aim is to bring up out of the
    // gate-well, found there, is taken for it (cold play 5, CL-33: "Collect the sea-gate's pawl" unmarked, the
    // frontier saying nothing here bore on the aim).
    const about = lead.source === 'here' && def ? [...Stakes.read(campaign, def)].filter(id => !byId.get(id)?.space) : [];
    // Where what it waits on lies here to be found, the search of here acts on it (the drain's letters).
    const search = AimLeading.lies(campaign, screen);
    const step = new Set([...lead.next, ...about,
      ...lead.next.flatMap(id => byId.get(id)?.space ? [] : w.one('at', id) ?? [])]);
    // Where the step is what bars the way, an act whose site is the bar acts on it too (the speaking door's words).
    const skip = lead.source === 'barred' ? ['actor'] : ['actor', 'site'];
    const bound = PlayerFrame.of(campaign).bound(skip);
    const ways = new Map(screen.exits.map(e => [e.id, e.destination.id]));
    // A way is on the step too where it is the first of the known way there (CL-65: from the barrow's halls the way
    // out to the daylight is two rooms long, and only a way straight to the step had counted).
    const here = screen.place.id;
    const first = KnownWays.first(campaign, here, id => id !== here && step.has(id), { able: true });
    // Where the step is to stand here until the day (AimPlaced), the wait for first light acts on it.
    const dawn = lead.source === 'placed' && lead.next[0] === screen.place.id;
    return cands.filter(c => {
      // A way by where it goes; an act at a way (a look at the door on it) by what it is done to.
      const id = c.command ?? c.choice, way = c.exit && c.kind === 'way' ? ways.get(c.exit) : undefined;
      const far = c.choice.startsWith('travel:') ? c.choice.slice('travel:'.length) : undefined;
      return (search && c.kind === 'search') || (!way && !far && (bound.get(id) ?? []).some(x => step.has(x)))
        || (!!way && (step.has(way) || way === first)) || (dawn && /^wait_for_light\b/.test(c.command ?? ''))
        || (!!far && [...step].some(x => Itineraries.within(byId, x, far)));
    });
  }
}
