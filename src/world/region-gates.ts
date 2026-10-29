import type { Region } from './region-writer';
import { Provinces, type Province } from './provinces';
import { RegionGeography } from './region-geography';
import { RegionRoads } from './region-roads';
import { RegionBorders } from './region-borders';
import { SettlementWriter } from './settlement-writer';

// The ways into a country's provinces (see Provinces), written as a march is (RegionBorders) but inside the country:
// a stretch of its land at the way in, the place the road comes to, the road to it from the nearest town, what is
// seen there, and what the folk of every town say of the province when asked, which puts the way in on the map.
export class RegionGates {
  static lines(region: Region): string[] {
    return (region.provinces ?? []).flatMap(p => [...this.gate(region, p), ...this.rumour(region, p)]);
  }
  static ids(region: Region): string[] {
    return (region.provinces ?? []).flatMap(p => [Provinces.room(p.country), `${Provinces.room(p.country)}_land`,
      `${Provinces.room(p.country)}_beyond`]);
  }
  private static gate(region: Region, p: Province): string[] {
    const q = JSON.stringify, id = Provinces.room(p.country), [x, y] = RegionGeography.spot(region, p.gate.cell);
    const from = region.settlements[p.gate.seat]!, country = Provinces.country(p.country);
    const seen = country.skyline ? ` Ahead, ${country.skyline}.` : '';
    return [`  Place ${id}_land ${q(`the edge of ${p.name}`)} is wilderness within region at ${x}, ${y}.`,
      `  Place ${id} ${q(`the way into ${p.name}`)} is room within ${id}_land at 0, 0.`,
      `  Passage ${id}_road ${q(`the road to ${p.name}`)} is road between ${from.id}_green and ${id} taking `
        + `${RegionRoads.time(Math.max(30, p.gate.road.hours * RegionRoads.minutesPerHour))}.`,
      `  Observe ${id}_scene at ${id} when true ${q(`The road goes on into ${p.name}.${seen}`)}.`];
  }
  // What whoever keeps travellers in each town says of it, asked; known from then as heard, with the way in on the map;
  // and, for one whose news is posted, the notice nailed up where travellers are kept, as for a march (RegionBorders),
  // and what is said once it is seen through.
  private static rumour(region: Region, p: Province): string[] {
    const q = JSON.stringify, room = Provinces.room(p.country), id = `${room}_beyond`, country = Provinces.country(p.country);
    if (!country.rumour || !country.heard) { return []; }
    const seat = region.settlements[p.gate.seat]!, about = country.topic ?? p.name;
    const fresh = RegionBorders.remembers(country) ? ` and not stale(${id})` : '';
    const lines = [`  Discovery ${id} ${q(country.heard)}.`, `  Initially Assert leadsTo(${id}, ${room}).`,
      ...country.notice ? RegionBorders.notice(room, country, region) : []];
    for (const s of region.settlements) {
      const keeper = `${s.id}_innkeeper`;
      const directions = s === seat ? '' : ` '${seat.name} is where the road to it goes out from,' {${keeper}} adds.`;
      lines.push(`  Topic ${id}_told_${s.id} with ${keeper} ${q(`Ask {${keeper}} about ${about}`)} when not knows(actor, ${id})${fresh} {`,
        `    Says ${q(country.rumour.replaceAll('{keeper}', `{${keeper}}`) + directions)}.`,
        `    On discuss { Assert knows(actor, ${id}). }`, '  }',
        ...RegionBorders.back(room, country, s.id, SettlementWriter.standing(region, s, 'innkeeper')));
    }
    return lines;
  }
}
