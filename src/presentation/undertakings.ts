import type { Campaign } from '../campaign/campaign';
import type { Entity, Objective } from '../lang/module';
import { Stakes } from '../ui/stakes';
import { FictionalTime } from '../campaign/fictional-time';
import { EntityIndex } from '../lang/entity-index';
import { Spatial } from '../spatial';
import { ObservationText } from '../lang/observation-text';
import { AimWords } from './aim-words';

// The aim the player follows (the owner's "a clearer currently selected quest"; Mission 19, journal and intentions):
// one of the aims the company holds, by its id, kept with the game in its save, and the one every page's "your aim"
// means. It had lived in the browser by the aim's words, apart from the engine, so the glance led toward one aim while
// the page said it followed another (the handoff's first repair).
// Followed is the player's choice, or the company's own errand, and nothing else (the owner's play of 7 November:
// "gold, dots and 'your aim' appear only for an aim the company actually holds and is following"; the evidence
// sessions saw the aim followed go over by itself to a roofless abbey the innkeeper had named among three). Until the
// player chooses one, nothing is followed, the errand included, and the page marks no way as anyone's aim (the owner,
// 12 November). An aim followed that gives way to one other is followed on into it where that is the errand's or the
// same story's next part (asking Bask for the key, then going down for the rats): never a rumour that happened to
// arise as it ended.
export class Undertakings {
  static held(campaign: Campaign): Objective[] {
    const w = campaign.world;
    return (campaign.module.objectives ?? []).filter(o => w.test(o.when));
  }
  // Only what the player chose to follow (the owner, 12 November: gold only after Follow this; with none followed, no
  // gold at all). The company's own errand is no longer followed for them: it is held, and offered to be followed.
  static followed(campaign: Campaign, held = this.held(campaign)): Objective | undefined {
    const kept = campaign.tickState.current.following;
    return kept?.chosen ? held.find(o => o.id === kept.id) : undefined;
  }
  // The company's own errand: the aim its origin sets (see Stakes.own); in an adventure with no origin, any it holds.
  static errand(campaign: Campaign, o: Objective): boolean {
    return Stakes.own(o) || !this.originated(campaign);
  }
  // Whether the company came into the country by an origin, a life chosen at the start (its parts are origin__'s).
  private static originated(campaign: Campaign): boolean {
    const m = campaign.module;
    return [...m.objectives ?? [], ...m.observations ?? [], ...m.entities].some(x => /^origin__/.test(x.id));
  }
  // Whether the player chose it (in the notes), not the game for them.
  static chosen(campaign: Campaign): boolean {
    const kept = campaign.tickState.current.following;
    return !!kept?.chosen && this.held(campaign).some(o => o.id === kept.id);
  }
  // The player's choice in the notes; none, and nothing is followed.
  static follow(campaign: Campaign, id?: string) {
    const current = campaign.tickState.current;
    if (id && !this.held(campaign).some(o => o.id === id)) { throw new Error(`No aim ${id} is held`); }
    if (id) { current.following = { id, chosen: true }; } else { delete current.following; }
  }
  // The aim followed, where a journey set out for is a place it names (or within one): only such a journey ends when
  // the aim changes. One of the player's own (a march-stone on the map) had been dropped on the road when the debt
  // went on from "you owe" to "ask at the inn", and could not be gone on with.
  static aimedAt(campaign: Campaign, destination: string): string | undefined {
    const followed = this.followed(campaign);
    if (!followed) { return undefined; }
    const def = (campaign.module.objectives ?? []).find(o => o.id === followed.id);
    const byId = EntityIndex.of(campaign.module.entities).byId;
    const within = Spatial.ancestry(byId, destination).map(e => e.id);
    return def && this.places(campaign, def).some(p => within.includes(p)) ? followed.id : undefined;
  }
  // The aims as the page shows them: the one followed first, then as they bear on where the company stands (see
  // Stakes.here); in words, and by id.
  static shown(campaign: Campaign, held: { id: string; text: string }[], here: string) {
    const followed = this.followed(campaign)?.id, chosen = this.chosen(campaign);
    const defs = new Map((campaign.module.objectives ?? []).map(o => [o.id, o]));
    const ordered = Stakes.here(campaign, held, here)
      .toSorted((a, b) => Number(b.id === followed) - Number(a.id === followed))
      .map(o => ({ o, def: defs.get(o.id) })).map(({ o, def }) => ({ id: o.id, text: FictionalTime.prose(o.text),
        ...o.id === followed ? { followed: true as const } : {},
        ...o.id === followed && chosen ? { chosen: true as const } : {},
        ...def && Stakes.own(def) ? { own: true as const } : {},
        ...def ? { places: this.places(campaign, def) } : {}, ...def && this.who(campaign, def).length
          ? { who: this.who(campaign, def) } : {} }));
    const folded = this.folded(campaign, ordered);
    return { objectives: folded.map(o => o.text), ...folded.length ? { aims: folded } : {} };
  }
  // A work's own aim (somewhere named, to be gone into: its _sought) is part of another aim held for the same site,
  // not an aim beside it: "Your sister went into Albustagn" and "The springs … were held somewhere under Albustagn"
  // had stood as two quests for one place, neither saying what the other was to it (the owner's play of 10 November).
  // It is told under that aim as what is known of the place; followed, it stands alone.
  private static folded<T extends { id: string; text: string; followed?: true; places?: string[] }>(
    campaign: Campaign, aims: T[]): (T & { about?: string[] })[] {
    const byId = EntityIndex.of(campaign.module.entities).byId, into = new Map<string, string>();
    for (const b of aims.filter(x => /_sought$/.test(x.id) && !x.followed)) {
      // The work itself: the first, most particular place its aim names (its outside, or its site).
      const work = b.places?.[0], site = work && (this.site(byId, work) ?? work);
      // Not a job asked after in a town ("Ask Peren about the old quarry"), which had been told under the crypt's aim
      // for naming the same town (round 9, Q).
      if (work && !this.site(byId, work) && Spatial.ancestry(byId, work).some(e => e.space?.kind === 'settlement')) { continue; }
      const host = work && aims.find(a => a !== b && !/_sought$/.test(a.id)
        && (a.places ?? []).some(p => p === work || p === site || this.site(byId, p) === site));
      if (host) { into.set(b.id, host.id); }
    }
    return aims.filter(a => !into.has(a.id)).map(a => {
      const about = aims.filter(b => into.get(b.id) === a.id).map(b => b.text);
      return about.length ? { ...a, about } : a;
    });
  }
  // The places an aim is about, by id, most particular first: those its words or condition name; then the outside of
  // a site among them (the barrow's outside, where the map has it); then what they lie in (the inn's town). For the
  // page to find the aim on the map and among the journeys by id, not by matching the aim's words against place names
  // (the owner, 4 November).
  private static places(campaign: Campaign, o: Objective): string[] {
    const byId = EntityIndex.of(campaign.module.entities).byId, w = campaign.world;
    const named = [...Stakes.named(campaign, o)].filter(id => byId.get(id)?.space);
    // A site's outside: a place outside the site a way joins to one of its rooms.
    const inside = new Map(named.flatMap(id => { const s = this.site(byId, id); return s ? [[id, s] as const] : []; }));
    const joined = w.related('connects').flatMap(r => [[r.args[1]!, r.args[2]!], [r.args[2]!, r.args[1]!]] as const)
      .flatMap(([a, b]) => inside.has(a) && this.site(byId, b) !== inside.get(a) ? [b] : []);
    const around = named.flatMap(id => Spatial.ancestry(byId, id).slice(1)
      .filter(e => !['plane', 'region'].includes(e.space?.kind ?? '')).map(e => e.id));
    // And where whoever it names is found, where its words do not say (see AimWords): tell Kellen the dead are still.
    const sought = AimWords.strangers(w, o).flatMap(id => AimWords.whereabouts(w, id));
    // Toward someone its author names, the town or site they are in (Naillil at Elmham): not the room, which the map
    // has no business knowing before the company does.
    const target = Stakes.target(campaign, o), at = target.subject ? w.one('at', target.subject) : undefined;
    const addressed = at ? Spatial.ancestry(byId, at).slice(1)
      .filter(e => ['settlement', 'site'].includes(e.space?.kind ?? '')).map(e => e.id) : [];
    // And the places its words say, which the company has been told ("the child at the market-place").
    const told = [...Stakes.said(campaign, o)].filter(id => byId.get(id)?.space);
    return [...new Set([...target.routeTo ? [target.routeTo] : [], ...named, ...joined, ...around, ...sought,
      ...addressed, ...told])];
  }
  // Those an aim names who are someone (said with a he, a she or a they), by the names the company knows them by: who
  // might know where it is, when the map cannot show it (the product-design review's PD-12).
  // Not one the aim says where to find (see AimWords): "Kellen may know where" had been said of Kellen, whom the aim
  // was to find.
  private static who(campaign: Campaign, o: Objective): string[] {
    const w = campaign.world, byId = EntityIndex.of(campaign.module.entities).byId;
    if (!w.relates('pronouns')) { return []; }
    const placed = new Set(AimWords.strangers(w, o));
    return [...Stakes.named(campaign, o)].filter(id => byId.get(id)?.type === 'group' && id !== campaign.playerActor
      && !!w.one('pronouns', id) && !placed.has(id)).map(id => ObservationText.label(w, id));
  }
  private static site(byId: Map<string, Entity>, id: string): string | undefined {
    return Spatial.ancestry(byId, id).find(e => e.space?.kind === 'site')?.id;
  }
  // After a command, from the aims held before it: the aim followed, gone, goes on into the one aim that arose with
  // its going, where that is the errand's or the player chose the one gone; an aim heard of is never followed for them.
  // The story an aim is part of: the installation it was written in.
  private static story(id: string): string { return id.replace(/__.*$/, ''); }
  // Whether one aim is the next part of another: their ids alike but for the last word (…_rats_job_aim, …_job_run).
  private static part(id: string, of: string): boolean {
    const a = id.split('_'), b = of.split('_');
    return a.length === b.length && a.length > 2 && a.slice(0, -1).join('_') === b.slice(0, -1).join('_');
  }
  static after(campaign: Campaign, before: string[]) {
    const current = campaign.tickState.current, kept = current.following, held = this.held(campaign);
    const was = new Set(before), now = new Set(held.map(o => o.id));
    const arisen = held.filter(o => !was.has(o.id)), gone = before.filter(id => !now.has(id));
    const then = (campaign.module.objectives ?? []).filter(o => was.has(o.id));
    const followed = kept?.chosen && then.some(o => o.id === kept.id) ? kept.id : undefined;
    if (followed && gone.includes(followed)) {
      // Or the one aim of the same story that arose with its going: the feverwort given, keeping the cups (the owner, 9
      // November: the errand's next part had been one aim among the town's, and the page had led off to the rats).
      // Or, among several that arose, the one that is the same job's next part, by its id alone (the rats' cellar
      // cleared, the nest down their run, beside the old ways onward: the owner's play of 11 November had fallen back
      // from the rats, chosen, to the errand, and no way was gold).
      const part = arisen.filter(o => this.part(o.id, followed));
      const lone = arisen.length === 1 && (this.errand(campaign, arisen[0]!)
        || this.story(arisen[0]!.id) === this.story(followed)) ? arisen[0] : undefined;
      const next = part.length === 1 ? part[0] : lone;
      // Followed on into its next part, as the player's own choice still.
      if (next) { current.following = { id: next.id, chosen: true }; } else { delete current.following; }
    }
  }
}
