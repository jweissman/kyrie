import { RegionGeography } from './region-geography';
import { RegionZones } from './region-zones';
import { RegionBorders } from './region-borders';
import { RegionWeather } from './region-weather';
import { Vantage, type Sighting } from './vantage';
import type { Region } from './region-writer';
import type { Land } from './land/terrain';
import { SettlementWriter } from './settlement-writer';
import { RegionSites } from './region-sites';
import { Foundings } from './founding';

// What can be seen from each high place of wild country once it is climbed (the crag, the cairn, the oak, the
// willow): the settlements, the sites, the marches and the landmarks of other wild country in sight of it (see
// Vantage), each told by where it lies and how far off, as the company knows it then; the far ones only when the sky
// is clear of haze. Each is known from then on, and somewhere to set out toward (leadsTo): Mission 17's vantage
// points, built on the climbs that told the lie of the land below. A site not far off is seen with the way to it.
// Through a spyglass, on a clear day, what lies past the edge of sight is seen too, and what is a long way off is
// seen well enough to be known for what it is, and the way to it. Over a march, on a clear day, something of the
// authored country beyond is seen (its skyline): a mountain hanging in the sky over the Corrow.
export class RegionSights {
  static readonly haze = ['foggy', 'misty', 'stormy', 'snowy', 'rainy'];
  static lines(region: Region): string[] {
    const atlas = RegionGeography.atlas(region), land = atlas.land, q = JSON.stringify;
    const kinds = region.calendar ? RegionWeather.kinds(region, region.calendar) : [];
    const hazy = kinds.filter(k => this.haze.includes(k));
    const clear = hazy.map(k => ` and not state(sky, weather_${k})`).join('');
    const highs = [...atlas.zones.flatMap(zone => RegionZones.landmarks(region, zone).filter(l => l.view).map(l => ({
      at: l.id, cell: l.cell, kind: l.kind, besides: RegionZones.rooms(region, zone) }))),
    ...region.settlements.filter(t => SettlementWriter.towered(t) && SettlementWriter.rooms(region, t).shrine)
      .map(t => ({ at: `${t.id}_shrine`, cell: t.cell!, kind: 'tower', besides: [t.id] })),
    // A founding's own height (a fortress's gate-tower): climbed, it sees as a shrine's tower does.
    ...region.settlements.flatMap((t, i) => {
      const own = Foundings.of(region, i).place;
      return own?.view ? [{ at: `${t.id}_${own.id}`, cell: t.cell!, kind: 'tower', besides: [t.id] }] : [];
    })];
    const places = this.places(region);
    const lines = highs.flatMap(h => this.sighted(land, h, places.filter(p => !h.besides.includes(p.id)))
      .flatMap((s, k) => {
      const glass = s.glass ? ' and holding(party, spyglass)' : '';
      const fact = `${h.at}_saw${k + 1}`, text = this.told(s), seen = `state(${h.at}_view, above)${glass}${s.far ? clear : ''}`;
      return [`  Entity ${fact}: fact ${q(text)}.`, `  Initially Assert leadsTo(${fact}, ${s.id}).`,
        `  Observe ${fact}_seen at ${h.at} as sign when ${seen} ${q(text)} teaches ${fact}.`,
        ...this.site(region, s, { id: fact, at: h.at, seen }),
        ...this.beyond(region, s, { id: fact, at: h.at, seen: s.far ? seen : `${seen}${clear}` })];
    }));
    // A glass is a kind of thing in this country whether or not anyone here sells one (one bought elsewhere serves).
    return lines.some(l => l.includes('holding(party, spyglass)')) ? ['  Entity spyglass: itemkind "Spyglass".', ...lines] : lines;
  }
  // A site seen from up there is known for what it is by one who knows the old works or the lie of the country: its
  // name, as the folk would tell it. Not far off, the way to it can be seen from up there, as the innkeeper would
  // tell it, landmark by landmark (see RegionSites.way): somewhere to set out for, all the way.
  private static site(region: Region, s: Sighting, o: { id: string; at: string; seen: string }): string[] {
    const seat = RegionGeography.seats(region).find(x => x.site.id === s.id), { id, at } = o, q = JSON.stringify;
    if (!seat) { return []; }
    // A long way off, only the glass shows it well enough (past the edge of sight, it is seen through the glass only).
    const seen = `${o.seen}${s.far && !s.glass ? ' and holding(party, spyglass)' : ''}`;
    return [`  Observe ${id}_known at ${at} as sign when ${seen} and not knows(party, ${s.id}_named)`
      + ` and (capable(party, lore) or capable(party, wayfinding)) ${q(`You know it by its look: that is ${seat.site.name}.`)}`
      + ` teaches ${s.id}_named.`,
    `  Observe ${id}_way at ${at} as sign when ${seen} and not knows(party, ${s.id}_found)`
      + ` ${q(RegionSites.way(seat, region))} teaches ${s.id}_found.`];
  }
  // Over a march-stone seen from up there, something of the country beyond it, when its authors give it a skyline.
  private static beyond(region: Region, s: Sighting, o: { id: string; at: string; seen: string }): string[] {
    const side = RegionGeography.atlas(region).borders.find(b => RegionBorders.room(b) === s.id)?.side;
    const skyline = side && region.beyond?.[side]?.skyline;
    return skyline ? [`  Observe ${o.id}_beyond at ${o.at} as sign when ${o.seen} ${JSON.stringify(`Beyond it, over the march: ${skyline}.`)}.`] : [];
  }
  // What is seen from a high place: by eye, and past the edge of sight through the glass, a few.
  private static sighted(land: Land, h: { cell: number; kind?: string }, places: { id: string; cell: number }[]) {
    return [...Vantage.seen(land, h.cell, places, { kind: h.kind }),
      ...Vantage.seen(land, h.cell, places, { kind: h.kind, glass: true, most: 3 })];
  }
  // "To the north-east, a long way off: {w2}." The place by the name the company knows it by when it is told.
  private static told(s: Sighting): string {
    return `To the ${s.bearing}, ${Vantage.said(s)}: {${s.id}}.`;
  }
  // The places of the region on the land: its settlements, its sites, the ends of its roads at its marches, and the
  // landmarks of its wild country.
  private static places(region: Region): { id: string; cell: number }[] {
    const atlas = RegionGeography.atlas(region);
    return [...region.settlements.map(s => ({ id: s.id, cell: s.cell! })),
      ...region.sites.filter(w => w.cell !== undefined).map(w => ({ id: w.id, cell: w.cell! })),
      ...atlas.borders.map(b => ({ id: RegionBorders.room(b), cell: b.cell })),
      ...atlas.zones.flatMap(z => RegionZones.landmarks(region, z).map(l => ({ id: l.id, cell: l.cell })))];
  }
}
