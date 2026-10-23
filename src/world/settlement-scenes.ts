import { Draw } from './land/draw';
import { RegionGeography } from './region-geography';
import type { Region, Settlement } from './region-writer';
import tables from '../../data/generation/scenes/settlements.json';

// What a settlement looks like from its green and from its taproom: its size, the trade it lives by, where it lies
// and how its inn and shrine stand to each other, and what is going on there by day. What its name means and who its
// people are belong to the journal, not to the scene. No two settlements of a country are told alike: of those of a
// size, each takes the next of that size's openings (and each the next way its inn and shrine stand, and the next
// taproom), from a start drawn for the country.
export class SettlementScenes {
  static green(region: Region, i: number, cult: string): string {
    const s = region.settlements[i]!, trade = tables.trade as Record<string, string>;
    const size = (tables.green as Record<string, string[]>)[s.size] ?? tables.green.village;
    const first = this.nth(region, i, size, 'green').replaceAll('{name}', s.name)
      .replace('{trade}', trade[s.trade] ?? 'smoke from the chimneys');
    const inn = this.nth(region, i, tables.inn, 'inn').replace('{inn}', SettlementScenes.inline(s.inn))
      .replace('{cult}', cult);
    return [first, RegionGeography.placement(region, i).trim(), SettlementScenes.upper(inn)].filter(Boolean).join(' ');
  }
  static taproom(region: Region, i: number): string {
    const s = region.settlements[i]!, rooms = (tables.room as Record<string, string[]>)[s.size] ?? tables.room.village;
    return [this.nth(region, i, rooms, 'room'), (tables.drinkers as Record<string, string>)[s.trade] ?? '']
      .filter(Boolean).join(' ');
  }
  // What the settlement's trade has people doing on the green by day.
  static life(s: Settlement): string | undefined { return (tables.life as Record<string, string>)[s.trade]; }
  // The next of a list for this settlement among those of its size (or among all of the country's, for the way its
  // inn and shrine stand, which does not go by size), from a start drawn for the country.
  private static nth(region: Region, i: number, list: readonly string[], what: string): string {
    const s = region.settlements[i]!;
    const same = what === 'inn' ? region.settlements : region.settlements.filter(x => x.size === s.size);
    const start = new Draw(`${region.name}:${s.size}:${what}`).int(list.length);
    return list[(same.indexOf(s) + start) % list.length]!;
  }
  private static inline(name: string): string { return name.replace(/^The /, 'the '); }
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
}
