import { Draw } from './land/draw';
import { RegionGeography } from './region-geography';
import { Foundings } from './founding';
import type { Region, Settlement } from './region-writer';
import tables from '../../data/generation/scenes/settlements.json';

// What a settlement looks like from its heart and from the house where travellers sleep: what its founding made it (a
// ford, a pit-head, a gate-yard), or for a farming place its green by its size and trade; where it lies; and for a
// green with both, how its inn and shrine stand to each other. What its name means and who its people are belong to
// the journal, not to the scene. No two greens of a country are told alike: of those of a size, each takes the next of
// that size's openings (and each the next way its inn and shrine stand, and the next taproom), from a start drawn for
// the country.
export class SettlementScenes {
  static green(region: Region, i: number, cult: string): string {
    const s = region.settlements[i]!, f = Foundings.of(region, i);
    const first = f.scene ?? this.farm(region, i);
    const both = f.kind === 'farm' && f.keeping === 'inn' && f.holy === 'shrine';
    const inn = both ? SettlementScenes.upper(this.nth(region, i, tables.inn, 'inn').replace('{inn}', SettlementScenes.inline(s.inn))
      .replace('{cult}', cult)) : '';
    // A harbour or a fishing hamlet has already said what its shore is.
    const placed = RegionGeography.placement(region, i, !['harbour', 'fishing'].includes(f.kind)).trim();
    return [first, placed, inn].filter(Boolean).join(' ');
  }
  private static farm(region: Region, i: number): string {
    const s = region.settlements[i]!, trade = tables.trade as Record<string, string>;
    const size = (tables.green as Record<string, string[]>)[s.size] ?? tables.green.village;
    return this.nth(region, i, size, 'green').replaceAll('{name}', s.name)
      .replace('{trade}', trade[s.trade] ?? 'smoke from the chimneys');
  }
  // The room travellers drink and sleep in: an inn's taproom by its size and the trade of those at its tables, or
  // what the founding keeps instead (someone's front room, a guest-hall, a canteen).
  static taproom(region: Region, i: number): string {
    const s = region.settlements[i]!, f = Foundings.of(region, i), drinkers = (tables.drinkers as Record<string, string>)[s.trade] ?? '';
    if (f.keeping !== 'inn') {
      const scenes = Foundings.table.keeping[f.keeping].scene ?? [];
      const room = scenes.length ? new Draw(`${region.name}:${s.id}:room`).pick(scenes).replaceAll('{keeper}', s.innkeeper) : '';
      return [room, f.keeping === 'alehouse' ? drinkers : ''].filter(Boolean).join(' ');
    }
    const rooms = (tables.room as Record<string, string[]>)[s.size] ?? tables.room.village;
    return [this.nth(region, i, rooms, 'room'), drinkers].filter(Boolean).join(' ');
  }
  // The heart after dark: whose light still shows.
  static night(region: Region, i: number): string {
    const s = region.settlements[i]!, f = Foundings.of(region, i);
    return Foundings.fill(Foundings.table.keeping[f.keeping].night, { name: s.name, keeper: s.innkeeper,
      inn: SettlementScenes.inline(s.inn) });
  }
  // What goes on at the heart by day: the founding's own life, or the trade's.
  static life(region: Region, i: number): string | undefined {
    return Foundings.of(region, i).life ?? this.trade(region.settlements[i]!);
  }
  static trade(s: Settlement): string | undefined { return (tables.life as Record<string, string>)[s.trade]; }
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
