import { Draw } from './land/draw';
import { RegionGeography } from './region-geography';
import type { Region, Settlement } from './region-writer';
import tables from '../../data/generation/scenes/settlements.json';

// What a settlement looks like from its green and from its taproom: its size, the trade it lives by, where it lies
// and how its inn and shrine stand to each other. What its name means and who its people are belong to the journal,
// not to the scene.
export class SettlementScenes {
  static green(region: Region, i: number, cult: string): string {
    const s = region.settlements[i]!, draw = new Draw(`${s.id}:green`);
    const trade = tables.trade as Record<string, string>;
    const size = (tables.green as Record<string, string[]>)[s.size] ?? tables.green.village;
    const first = draw.pick(size).replaceAll('{name}', s.name).replace('{trade}', trade[s.trade] ?? 'smoke from the chimneys');
    const inn = draw.pick(tables.inn).replace('{inn}', SettlementScenes.inline(s.inn)).replace('{cult}', cult);
    return [first, RegionGeography.placement(region, i).trim(), SettlementScenes.upper(inn)].filter(Boolean).join(' ');
  }
  static taproom(s: Settlement): string {
    const room = (tables.room as Record<string, string>)[s.size] ?? tables.room.village;
    return [room, (tables.drinkers as Record<string, string>)[s.trade] ?? ''].filter(Boolean).join(' ');
  }
  private static inline(name: string): string { return name.replace(/^The /, 'the '); }
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
}
