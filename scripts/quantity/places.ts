import type { Campaign } from '../../src/campaign/campaign';
import type { CampaignEvent } from '../../src/campaign/campaign';
import { EntityIndex } from '../../src/lang/entity-index';
import { ModuleWriter } from '../../src/lang/module-writer';
import { Spatial } from '../../src/lang/spatial';
import { NoviceCountry, type Country } from '../novice-country';

// Measure 1 as the owner rules it (24 November, OR-321): "more dense combat in specific, easy-to-find locations which
// quests return you to periodically and which reward multiple expeditions", and "roads having a little more danger".
// Where a company stands is one of three: a combat place (inside a site, or under a town: the undertown and the deep
// site below it), a road (out in the country, not in a town or a site), or a town.
export type Ground = 'place' | 'road' | 'town';
// One expedition into a combat place: from going in to coming out, the fights begun and whether it brought anything
// home (coin gained, or a valuable taken up).
export interface Expedition { place: string; fights: number; reward: boolean }
// A walk's time and fights by ground, and its expeditions.
export interface Grounds { place: { minutes: number; fights: number }; road: { minutes: number; fights: number };
  expeditions: Expedition[] }
export class QuantityPlaces {
  static empty(): Grounds {
    return { place: { minutes: 0, fights: 0 }, road: { minutes: 0, fights: 0 }, expeditions: [] };
  }
  // The combat place a place is in (its site, or the ground under its town), if any.
  static place(c: Campaign, at: string): string | undefined {
    const up = Spatial.ancestry(EntityIndex.of(c.module.entities).byId, at);
    // Under a town, its undertown and the deep site below it are one place: the first dungeon, gone down into from it.
    const site = up.find(e => e.space?.kind === 'site'), town = up.find(e => e.space?.kind === 'settlement');
    // (The deep site under a town is its catacombs', RegionUndertown's `<town>_ud_site`; a hall in a town is a site.)
    if (town && (site?.id.endsWith('_ud_site') || (!site && (up[0]?.space?.depth ?? 0) > 0))) { return `${town.id}:below`; }
    return site?.id;
  }
  static ground(c: Campaign, at: string): Ground {
    if (this.place(c, at)) { return 'place'; }
    return NoviceCountry.containing(c, at, 'settlement') ? 'town' : 'road';
  }
  // A turn's time and fights, put to the ground it began on; and an expedition begun, gone on or ended.
  static turn(c: Campaign, g: Grounds, at: { from: string; to: string; minutes: number; events: CampaignEvent[];
    gold: number }) {
    const ground = this.ground(c, at.from), fights = at.events.filter(e => e.combat.some(x => x.type === 'initiative'))
      .length;
    if (ground !== 'town') { g[ground].minutes += at.minutes; g[ground].fights += fights; }
    const was = this.place(c, at.from), now = this.place(c, at.to), open = g.expeditions.at(-1);
    const reward = at.gold > 0 || at.events.some(e => e.changes.some(x => /^\+ ownedItem\(/.test(x)
      && this.valuable(c, x)));
    if (was && open && open.place === was) {
      open.fights += fights;
      open.reward ||= reward;
    }
    if (now && now !== was) { g.expeditions.push({ place: now, fights: 0, reward: false }); }
  }
  private static valuable(c: Campaign, change: string): boolean {
    const item = /^\+ ownedItem\(([^,]+),/.exec(change)?.[1], kind = item && c.world.one('itemKind', item);
    return !!kind && c.world.test(ModuleWriter.call('valuable', kind));
  }
  // The combat places of a first country that quests return a company to: a combat place within four hours of the
  // start with three bands or more in it, which two of the country's aims or more send the company to (its jobs,
  // bounties, the next part of a job done there, the way on below).
  static returned(c: Campaign, country: Country): string[] {
    const far = NoviceCountry.distances(c, country.start), bands = new Map<string, number>();
    const near = new Map<string, number>();
    for (const [g, members] of Object.entries(c.readout.inhabitants)) {
      const at = c.world.one('at', g), place = at && this.place(c, at);
      if (!place || g === c.playerActor || !members.length || c.world.test(ModuleWriter.call('peaceable', g))) { continue; }
      bands.set(place, (bands.get(place) ?? 0) + 1);
    }
    for (const [at, minutes] of far) {
      const place = this.place(c, at);
      if (place && minutes < (near.get(place) ?? Infinity)) { near.set(place, minutes); }
    }
    const sent = new Map<string, number>();
    for (const o of c.module.objectives ?? []) {
      const places = new Set([...o.toward ?? [], ...o.route ? [o.route] : []].map(p => this.place(c, p))
        .filter((p): p is string => !!p));
      for (const p of places) { sent.set(p, (sent.get(p) ?? 0) + 1); }
    }
    return [...bands].filter(([p, n]) => n >= 3 && (near.get(p) ?? Infinity) <= 240 && (sent.get(p) ?? 0) >= 2)
      .map(([p]) => p).sort();
  }
}
