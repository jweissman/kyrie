import { Terrain } from './land/terrain';
import { Histories } from './history/histories';
import { RegionEcology } from './region-ecology';
import { RegionGeography, type Seat } from './region-geography';
import { RegionRoads } from './region-roads';
import { RegionZones } from './region-zones';
import type { Region } from './region-writer';

// The sites of a generated region as a stranger meets them. A site is seen for what it looks like (a lone tower, a
// grassed mound) until the company learns its name: from the people of the settlement it is reached from, who know
// what it is called and what is said of it, or, at the old sites, from the name cut over the door in the old script.
// A site in wild country stands in it, reached from the part it is in; deeper in, its track is not seen until
// someone finds it by searching there or is told the way. A site in open country stands in a stretch of its own,
// reached from the nearest road or settlement.
export class RegionSites {
  static readonly seen: Record<string, string> = { cave: 'a cave in the hillside', barrow: 'a grassed mound',
    ruin: 'the fallen walls', tower: 'a lone tower', grove: 'an old grove', bog: 'a black bog', mine: 'the old workings',
    sinkhole: 'a pit in the ground' };
  // What the people nearby say of each kind of site.
  static readonly said: Record<string, string> = { cave: 'There is always something living in it.',
    barrow: 'Old dead. Leave them be.', ruin: 'Older than the town. Folk take stone from it, when they dare.',
    tower: 'Nobody has lived there since my grandmother\'s day.', grove: 'We do not cut there.',
    bog: 'Keep to the stakes, if you go.', mine: 'Worked out, my father said, and he would know.',
    sinkhole: 'Sheep go in. They do not come out.' };
  // Where an old site carries its name.
  static readonly cut: Record<string, string> = { tower: 'Over the door, cut in the old script',
    barrow: 'On the stone across the entrance, in the old script', ruin: 'On a fallen lintel, in the old script' };
  // What a site is called until its name is known: how it looks, and, where the region has others that look the
  // same, where it is (a grassed mound north of Faennslím; a cave in the hillside deep in Bruinforwest).
  static seenAs(seat: Seat, region: Region): string {
    const { site } = seat, seen = this.look(site);
    const like = region.sites.filter(s => s !== site && this.look(s) === seen);
    if (!like.length) { return seen; }
    const zone = RegionGeography.atlas(region).zones.find(z => z.id === site.zone);
    if (zone) {
      // Two alike in the same part of the same wild country: the eastern old workings, the western.
      const twin = like.find(s => s.zone === zone.id && s.part === site.part);
      const side = twin && RegionGeography.compass(RegionGeography.spot(region, twin.cell!), seat.spot);
      const which = side && side !== 'here' ? seen.replace(/^(a|an|the) /, `the ${side}ern `) : seen;
      return like.some(s => s.zone === zone.id) ? `${which} ${RegionZones.where(zone, site.part ?? 0)}`
        : `${seen} in ${zone.naming.name}`;
    }
    const side = RegionGeography.compass(RegionGeography.spot(region, seat.town.cell!), seat.spot);
    return `${seen} ${side === 'here' ? 'near' : `${side} of`} ${seat.town.name}`;
  }
  // How a site looks from outside: a makers' work as its plan says; anything else by its kind.
  static look(site: Region['sites'][number]): string {
    return site.work ? Histories.plan(site.work.plan).seen : this.seen[site.kind] ?? 'a place';
  }
  static lines(region: Region, taken: Record<string, string> = {}): string[] {
    return RegionGeography.seats(region).flatMap(seat => this.seat(seat, region, !!taken[seat.site.id]));
  }
  private static seat(seat: Seat, region: Region, claimed: boolean): string[] {
    const q = JSON.stringify, { site, town } = seat, id = site.id, keeper = `${town.id}_innkeeper`;
    const where = this.where(seat, region), seen = this.look(site), called = this.seenAs(seat, region);
    const way = called === seen ? `${seen} in ${where}` : called, great = !!site.work?.great;
    const hidden = great || (!claimed && (site.part ?? 0) > 0);
    const lines = [...this.stand(seat, region, { where, hidden }),
      `  Discovery ${id}_named ${q(`${site.name}: ${seen} in ${where}.${site.work ? '' : RegionGeography.meaning(site)}`)}.`,
      // A work's own plan says how it looks; what is said here of it is the life of the place, told after.
      `  Observe ${id}_scene at ${id}${site.work ? ' as ambience' : ''} when true ${q(this.scene(seat, region))}.`,
      `  Observe ${id}_known at ${id} as feature when knows(party, ${id}_named) ${q(`This is ${site.name}${this.worn(region, site) ? ', as the folk call it' : ''}.`)}.`,
      // A work's own people tell of it in its plan's words (RegionWorks); anything else, the innkeeper knows.
      ...site.work ? [] : [`  Topic ${id}_asked with ${keeper} ${q(`Ask {${keeper}} about {${id}}`)} when not knows(actor, ${id}_named) once {`,
        `    Says ${q(`'${site.name},' says {${keeper}}.${this.gloss(site)} '${this.saying(region, site)}'${hidden ? ` And {${keeper}} tells you how to find it in ${where}.` : ''}`)}.`,
        `    On discuss { Assert knows(actor, ${id}_named).${hidden ? ` Assert knows(actor, ${id}_found).` : ''} }`, '  }']];
    // Every site's way can be learned; one deep in wild country can also be found by searching where it starts.
    lines.push(hidden && !great ? `  Discovery ${id}_found ${q(`The way to ${way}.`)} { Found by searching ${RegionZones.room(RegionGeography.atlas(region).zones.find(z => z.id === site.zone)!, site.part!)}. }`
      : `  Discovery ${id}_found ${q(`The way to ${way}.`)}.`);
    if (this.cut[site.kind] && !site.work) {
      lines.push(`  Observe ${id}_letters at ${id} when true ${q(`${this.cut[site.kind]}: ${site.name.toUpperCase()}.`)} teaches ${id}_named.`);
    }
    return lines;
  }
  // The site's place and the track to it.
  private static stand(seat: Seat, region: Region, at: { where: string; hidden: boolean }): string[] {
    const q = JSON.stringify, { site } = seat, id = site.id, seen = this.seenAs(seat, region);
    const zone = RegionGeography.atlas(region).zones.find(z => z.id === site.zone), { where, hidden } = at;
    if (zone) {
      const from = RegionZones.room(zone, site.part ?? 0);
      const [x, y] = seat.spot;
      return [`  Place ${id} ${q(site.name)} is room within ${zone.id} at ${x}, ${y} seen as ${q(seen)} until ${id}_named.`,
        `  Passage ${id}_track ${q(`the track to {${id}}`)} is track between ${from} and ${id} taking 1 hour${hidden ? ` hidden until ${id}_found` : ''}.`];
    }
    const [x, y] = seat.spot, start = this.start(seat, region);
    return [`  Place ${seat.land} ${q(where)} is wilderness within region at ${x}, ${y}.`,
      `  Place ${id} ${q(site.name)} is room within ${seat.land} at 1, 1 seen as ${q(seen)} until ${id}_named.`,
      `  Passage ${id}_track ${q(`the track to {${id}}`)} is track between ${start.from} and ${id} taking ${RegionRoads.time(start.minutes)}${hidden ? ` hidden until ${id}_found` : ''}.`];
  }
  // Which of the sites in the same part of the same wild country this is, for its place on the chart.
  private static rank(region: Region, seat: Seat): number {
    return region.sites.filter(s => s.zone === seat.site.zone && s.part === seat.site.part).indexOf(seat.site);
  }
  // Where a track to a site in open country starts: the nearer of the nearest settlement and the nearest road.
  private static start(seat: Seat, region: Region): { from: string; minutes: number } {
    const land = RegionGeography.atlas(region).land, cell = seat.site.cell!;
    const town = { from: `${seat.town.id}_green`, gap: Terrain.distance(land, seat.town.cell!, cell) };
    const road = RegionGeography.roads(region).map(r => ({ from: r.way,
      gap: Math.min(...r.route.cells.map(c => Terrain.distance(land, c, cell))) })).sort((a, b) => a.gap - b.gap)[0];
    const best = road && road.gap < town.gap ? road : town;
    return { from: best.from, minutes: Math.max(30, Math.round(best.gap * RegionRoads.minutesPerHour / 10) * 10) };
  }
  // Where a site is, as people say it: the wild country it stands in, or which way it lies from the settlement.
  static where(seat: Seat, region: Region): string {
    const zone = RegionGeography.atlas(region).zones.find(z => z.id === seat.site.zone);
    if (zone) { return zone.naming.name; }
    const side = RegionGeography.compass(RegionGeography.spot(region, seat.town.cell!), seat.spot);
    return `the ${RegionGeography.country[region.terrain] ?? 'country'} ${side === 'here' ? 'around' : `${side} of`} ${seat.town.name}`;
  }
  // Whether the folk call a work by something other than what its letters say.
  private static worn(region: Region, site: Region['sites'][number]): boolean {
    const old = region.history?.works.find(w => w.id === site.id)?.old.name;
    return !!site.work && !!old && old.toLowerCase() !== site.name.toLowerCase();
  }
  // How a site looks, before or after its name is known: what it is, and its animals.
  private static scene(seat: Seat, region: Region): string {
    const { site } = seat, zone = RegionGeography.atlas(region).zones.find(z => z.id === site.zone);
    const habitat = zone ? RegionZones.habitat[zone.wild] : RegionEcology.habitat(region, site);
    const fen = habitat === 'fen' ? ' Reeds hiss in the wind.' : '';
    // A work's plan says how it looks; the place around it is the region's.
    const look = site.work ? '' : RegionGeography.looks[site.kind] ?? '';
    return `${look}${fen} ${RegionEcology.sign(habitat, site.id)}`.trim();
  }
  // What the folk say of a site: of a work, what they say of its makers' works; of anything else, of its kind.
  private static saying(region: Region, site: Region['sites'][number]): string {
    const makers = site.work && region.history?.makers.find(m => m.art === site.work!.art);
    return makers ? makers.said[Number(site.id.slice(1)) % makers.said.length]! : this.said[site.kind] ?? '';
  }
  // What a name means, as the people who say it would put it.
  private static gloss(site: { gloss?: string; tongue?: string; work?: object }): string {
    if (!site.gloss) { return ''; }
    if (site.work) { return ' \'An old name; nobody knows what it means.\''; }
    return site.tongue === 'Aenean' ? ` 'The old tongue: ${site.gloss}.'` : ` 'It means ${site.gloss}.'`;
  }
}
