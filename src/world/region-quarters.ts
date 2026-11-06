import table from '../../data/generation/town/quarters.json';
import type { Region } from './region-writer';

interface Quarter { name: string; heart: string; roles: string[] }
const quarters = table as unknown as { least: number; quarters: Record<string, Quarter> };

// The quarters of a generated town (the owner, 6 November: a town of navigable organization, not a directory of
// places): what data/generation/town/quarters.json says of each, laid on the places the town was written with. Each
// place a town has is written by its writer as the town's id and its role (s1_shop, s1_waterside), and keeps its
// containment in the town; a quarter is only where it lies (inQuarter) and where it is walked to (heartOf). A town of
// fewer places than the table's least has none; a quarter the town has no place for is not one.
export class RegionQuarters {
  static lines(region: Region, written: string[]): string[] {
    const q = JSON.stringify, out: string[] = [];
    for (const s of region.settlements) {
      const roles = this.roles(s.id, written);
      if (roles.length < quarters.least) { continue; }
      const laid = this.laid(roles);
      for (const [id, { quarter, places }] of Object.entries(laid)) {
        out.push(`  Entity ${s.id}_q_${id}: quarter ${q(quarter.name)}.`,
          `  Initially Assert heartOf(${s.id}_q_${id}, ${s.id}_${places.includes(quarter.heart) ? quarter.heart : places[0]}).`,
          ...places.map(r => `  Initially Assert inQuarter(${s.id}_${r}, ${s.id}_q_${id}).`));
      }
    }
    return out;
  }
  // The roles of the places a town was written with, directly within it (its rooms and buildings).
  static roles(town: string, written: string[]): string[] {
    const within = new RegExp(`^ {2}Place ${town}_([a-z]+) "[^"]*" is (?:room|building) within ${town}\\b`);
    return [...new Set(written.flatMap(l => within.exec(l)?.[1] ?? []))];
  }
  // Each quarter the town has a place for, with them; the rest with the first (the green).
  static laid(roles: string[]): Record<string, { quarter: Quarter; places: string[] }> {
    const all = Object.entries(quarters.quarters), out: Record<string, { quarter: Quarter; places: string[] }> = {};
    const [heart] = all[0]!;
    for (const [id, quarter] of all) {
      const places = roles.filter(r => quarter.roles.includes(r));
      if (places.length || id === heart) { out[id] = { quarter, places }; }
    }
    const placed = new Set(Object.values(out).flatMap(o => o.places));
    out[heart]!.places.push(...roles.filter(r => !placed.has(r)));
    return out;
  }
}
