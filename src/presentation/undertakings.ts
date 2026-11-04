import type { Campaign } from '../campaign/campaign';
import type { Entity, Objective } from '../lang/module';
import { Stakes } from '../ui/stakes';
import { FictionalTime } from '../campaign/fictional-time';
import { EntityIndex } from '../lang/entity-index';
import { Spatial } from '../spatial';

// The aim the player follows (the owner's "a clearer currently selected quest"; Mission 19, journal and intentions):
// one of the aims the company holds, by its id, kept with the game in its save, and the one every page's "your aim"
// means. It had lived in the browser by the aim's words, apart from the engine, so the glance led toward one aim while
// the page said it followed another (the handoff's first repair).
// Until the player chooses one, the company's own errand is followed, else the first aim held. An aim taken up alone
// (a job asked for) is followed as it comes, unless the player chose another or the company's own errand is followed
// (the page's aim had wandered to whatever was heard of last while the brothers' errand was under way: play 7); the
// page offers to follow it instead. An aim followed that gives way to one other (asking Bask for the key, then going
// down for the rats) is followed on into it.
export class Undertakings {
  static held(campaign: Campaign): Objective[] {
    const w = campaign.world;
    return (campaign.module.objectives ?? []).filter(o => w.test(o.when));
  }
  static followed(campaign: Campaign, held = this.held(campaign)): Objective | undefined {
    const kept = campaign.tickState.current.following;
    return held.find(o => o.id === kept?.id) ?? held.find(o => Stakes.own(o)) ?? held[0];
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
      .map(o => ({ id: o.id, text: FictionalTime.prose(o.text), ...o.id === followed ? { followed: true as const } : {},
        ...o.id === followed && chosen ? { chosen: true as const } : {},
        ...defs.get(o.id) && Stakes.own(defs.get(o.id)!) ? { own: true as const } : {},
        ...defs.get(o.id) ? { places: this.places(campaign, defs.get(o.id)!) } : {} }));
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
    return [...new Set([...named, ...joined, ...around])];
  }
  private static site(byId: Map<string, Entity>, id: string): string | undefined {
    return Spatial.ancestry(byId, id).find(e => e.space?.kind === 'site')?.id;
  }
  // After a command, from the aims held before it.
  static after(campaign: Campaign, before: string[]) {
    const current = campaign.tickState.current, kept = current.following, held = this.held(campaign);
    const was = new Set(before), now = new Set(held.map(o => o.id));
    const arisen = held.filter(o => !was.has(o.id)), gone = before.filter(id => !now.has(id));
    const then = (campaign.module.objectives ?? []).filter(o => was.has(o.id));
    const followed = then.some(o => o.id === kept?.id) ? kept!.id : this.followed(campaign, then)?.id;
    if (followed && gone.includes(followed)) {
      if (arisen.length === 1) { current.following = { id: arisen[0]!.id, ...kept?.chosen ? { chosen: true } : {} }; }
      else { delete current.following; }
    } else if (!this.chosen(campaign) && arisen.length === 1 && !then.some(o => o.id === followed && Stakes.own(o))) {
      current.following = { id: arisen[0]!.id };
    }
    // The aim followed for the player is kept once taken: three jobs read of on a notice had put the first of them,
    // in the module's order, ahead of the aim the company had been following.
    else if (!current.following && followed) { current.following = { id: followed }; }
  }
}
