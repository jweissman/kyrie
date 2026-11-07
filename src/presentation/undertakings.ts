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
// player chooses one, the company's own errand is followed while it holds; with none, nothing is, and the page marks
// no way as anyone's aim. An adventure played by itself, with no origin, has the aims its author gave it for its
// errand, and follows the first held. An aim followed that gives way to one other is followed on into it where that
// is the errand's next part, or the aim was the player's choice (asking Bask for the key, then going down for the
// rats): never a rumour that happened to arise as it ended.
export class Undertakings {
  static held(campaign: Campaign): Objective[] {
    const w = campaign.world;
    return (campaign.module.objectives ?? []).filter(o => w.test(o.when));
  }
  static followed(campaign: Campaign, held = this.held(campaign)): Objective | undefined {
    const kept = campaign.tickState.current.following;
    return held.find(o => o.id === kept?.id) ?? held.find(o => this.errand(campaign, o));
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
  // The player's choice in the notes; none, and the game follows for them again.
  static follow(campaign: Campaign, id?: string) {
    const current = campaign.tickState.current;
    if (id && !this.held(campaign).some(o => o.id === id)) { throw new Error(`No aim ${id} is held`); }
    if (id) { current.following = { id, chosen: true }; } else { delete current.following; }
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
    return { objectives: ordered.map(o => o.text), ...ordered.length ? { aims: ordered } : {} };
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
    return [...new Set([...named, ...joined, ...around, ...sought])];
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
  static after(campaign: Campaign, before: string[]) {
    const current = campaign.tickState.current, kept = current.following, held = this.held(campaign);
    const was = new Set(before), now = new Set(held.map(o => o.id));
    const arisen = held.filter(o => !was.has(o.id)), gone = before.filter(id => !now.has(id));
    const then = (campaign.module.objectives ?? []).filter(o => was.has(o.id));
    const followed = then.some(o => o.id === kept?.id) ? kept!.id : this.followed(campaign, then)?.id;
    if (followed && gone.includes(followed)) {
      const next = arisen.length === 1 && (kept?.chosen || this.errand(campaign, arisen[0]!)) ? arisen[0] : undefined;
      if (next) { current.following = { id: next.id, ...kept?.chosen ? { chosen: true } : {} }; }
      else { delete current.following; }
    }
    // The aim followed for the player is kept once taken: three jobs read of on a notice had put the first of them,
    // in the module's order, ahead of the aim the company had been following.
    else if (!current.following && followed) { current.following = { id: followed }; }
  }
}
