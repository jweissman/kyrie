import type { Campaign } from '../src/campaign/campaign';
import type { Entity } from '../src/lang/module';
import { EntityIndex } from '../src/lang/entity-index';
import { ModuleWriter } from '../src/lang/module-writer';
import { Spatial } from '../src/spatial';
import { Itineraries } from '../src/ui/itinerary';
import { RegionWriter } from '../src/world/region-writer';

// A band of the first country that a company could meet: who they are, where they stand (the site they are in, if
// any), what put them there (the region itself, or a trouble placed in it: a den, a raiders' hold, a toll), and how
// far that is from where the company begins, over the country's ways.
export interface Band {
  id: string; name: string; members: string[]; place: string; site?: string; where: string; installation: string;
  trouble: string; minutes: number;
}
// The one at the first town's inn who would come along for their hire, and what the company has to pay it with.
export interface Hire { group: string; name: string; members: string[]; calling: string; fee: number; gold: number }
export interface Site { id: string; name: string; minutes: number; bands: number }
export interface Country {
  seed: string; start: string; town?: string; bands: Band[]; sites: Site[]; firstRuin?: string; bigRuin?: string;
  hire?: Hire; wayIn: string[];
}

// The first country as a novice meets it, read from the game itself rather than from the ids its generator writes:
// a band is a group that is not peaceable, standing out in a site or the wild country (not in a town), with someone
// in it still on their feet; a place's site and town are what the place is contained by (Spatial.ancestry); the
// first ruin is the nearest of the region's own sites with a band in it, by the time its ways take (the audit's
// "first ruin", where 7 of 17 solo mages fell), and the big ruin the one with the most (PT-11's "big ruin").
export class NoviceCountry {
  static readonly own = 'The country\'s own sites and wild';
  static read(campaign: Campaign, seed: string): Country {
    const world = campaign.world, party = campaign.playerActor!, start = world.one('at', party) ?? '';
    const town = this.containing(campaign, start, 'settlement')?.id;
    const far = this.distances(campaign, start);
    const bands = Object.keys(campaign.readout.inhabitants).flatMap(g => this.band(campaign, g, far));
    const sites = this.sites(campaign, far, bands);
    const own = sites.filter(s => bands.some(b => b.site === s.id && b.installation === RegionWriter.id));
    const firstRuin = [...own].sort((a, b) => a.minutes - b.minutes || NoviceCountry.order(a.id, b.id))[0]?.id;
    const bigRuin = [...own].sort((a, b) => b.bands - a.bands || a.minutes - b.minutes)[0]?.id;
    const hire = town ? this.hire(campaign, town) : undefined;
    // The way in: the first ruin's three nearest bands, those met before any deeper (a keeper at the bottom of a
    // barrow is not where a novice begins).
    const wayIn = bands.filter(b => b.site && b.site === firstRuin)
      .sort((a, b) => a.minutes - b.minutes || NoviceCountry.order(a.id, b.id)).slice(0, 3).map(b => b.id);
    return { seed, start, ...town ? { town } : {}, bands, sites, ...firstRuin ? { firstRuin } : {},
      ...bigRuin ? { bigRuin } : {}, ...hire ? { hire } : {}, wayIn };
  }
  static order(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
  private static entities(campaign: Campaign): Map<string, Entity> {
    return EntityIndex.of(campaign.module.entities).byId;
  }
  static containing(campaign: Campaign, place: string, kind: string): Entity | undefined {
    return Spatial.ancestry(this.entities(campaign), place).find(e => e.space?.kind === kind);
  }
  static named(campaign: Campaign, id: string): string {
    return (this.entities(campaign).get(id)?.name ?? id).split(', ')[0]!;
  }
  private static band(campaign: Campaign, group: string, far: Map<string, number>): Band[] {
    const world = campaign.world, place = world.one('at', group);
    if (group === campaign.playerActor || !place || world.test(ModuleWriter.call('peaceable', group))) { return []; }
    const rows = Spatial.ancestry(this.entities(campaign), place), kinds = rows.map(e => e.space?.kind);
    if (kinds.includes('settlement') || !(kinds.includes('site') || kinds.includes('wilderness'))) { return []; }
    const creatures = campaign.readout.creatures;
    const members = (campaign.readout.inhabitants[group] ?? [])
      .filter(id => (creatures.find(c => c.id === id)?.state.hp ?? 0) > 0);
    if (!members.length) { return []; }
    const site = rows.find(e => e.space?.kind === 'site');
    const installed = campaign.installations.find(m => m.actors.includes(group));
    const installation = installed?.id ?? RegionWriter.id;
    const where = site ? site.name : installation === RegionWriter.id ? this.named(campaign, place) : installed!.name;
    return [{ id: group, name: this.named(campaign, group), members, place, ...site ? { site: site.id } : {},
      where: where.split(', ')[0]!, installation,
      trouble: installed && installation !== RegionWriter.id ? installed.name.split(': ')[0]! : this.own,
      minutes: far.get(place) ?? Infinity }];
  }
  // Every site and how near its nearest place is to the start, with how many bands are in it.
  private static sites(campaign: Campaign, far: Map<string, number>, bands: Band[]): Site[] {
    const near = new Map<string, number>();
    for (const [place, minutes] of far) {
      const site = this.containing(campaign, place, 'site')?.id;
      if (site && minutes < (near.get(site) ?? Infinity)) { near.set(site, minutes); }
    }
    const held = [...new Set(bands.flatMap(b => b.site ? [b.site] : []))];
    return held.map(id => ({ id, name: this.named(campaign, id), minutes: near.get(id) ?? Infinity,
      bands: bands.filter(b => b.site === id).length }));
  }
  // How long the quickest way from the start to every place takes, over every way of the country, known or not.
  private static distances(campaign: Campaign, from: string): Map<string, number> {
    const next = new Map<string, { to: string; minutes: number }[]>();
    for (const c of campaign.world.related('connects')) {
      const [passage, a, b] = c.args;
      if (!passage || !a || !b) { continue; }
      const out = next.get(a) ?? [];
      out.push({ to: b, minutes: Itineraries.minutes(campaign, passage) });
      next.set(a, out);
    }
    const best = new Map<string, number>([[from, 0]]), open = new Set([from]);
    while (open.size) {
      const at = [...open].sort((a, b) => best.get(a)! - best.get(b)! || NoviceCountry.order(a, b))[0]!;
      open.delete(at);
      for (const way of next.get(at) ?? []) {
        const minutes = best.get(at)! + way.minutes;
        if (minutes < (best.get(way.to) ?? Infinity)) { best.set(way.to, minutes); open.add(way.to); }
      }
    }
    return best;
  }
  // The first town's hire: whoever there has a hire (people.kyr's recruit), the cheapest first.
  private static hire(campaign: Campaign, town: string): Hire | undefined {
    const world = campaign.world, party = campaign.playerActor!;
    const offers = world.measured('hire').flatMap(m => {
      const group = m.call.args[0], place = group && world.one('at', group);
      const here = group && place && this.containing(campaign, place, 'settlement')?.id === town;
      return here ? [{ group, fee: m.value }] : [];
    }).sort((a, b) => a.fee - b.fee || NoviceCountry.order(a.group, b.group));
    const offer = offers[0], members = offer ? campaign.readout.inhabitants[offer.group] ?? [] : [];
    if (!offer || !members.length) { return undefined; }
    const calling = campaign.readout.creatures.find(c => c.id === members[0])?.classId ?? '';
    return { group: offer.group, name: this.named(campaign, offer.group), members, calling, fee: offer.fee,
      gold: world.number(ModuleWriter.call('quantity', party, 'gold')) };
  }
}
