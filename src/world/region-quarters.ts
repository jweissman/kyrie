import table from '../../data/generation/town/quarters.json';
import type { Region } from './region-writer';

interface Quarter { name: string; heart: string; roles: string[] }
interface Laid { quarter: Quarter; places: string[]; heart: string }
const quarters = table as unknown as { least: number; quarters: Record<string, Quarter> };

// The quarters of a generated town (the owner, 6 November: a town of navigable organization, not a directory of
// places): what data/generation/town/quarters.json says of each, laid on the places the town was written with. Each
// place a town has is written by its writer as the town's id and its role (s1_shop, s1_waterside), and keeps its
// containment in the town; a quarter is only where it lies (inQuarter) and where it is walked to (heartOf). A town of
// fewer places than the table's least has none; a quarter the town has no place for is not one.
// A quarter is come into at an open place of its own, a square, a street, a bank, never by a shop's door (the owner's
// play of 7 November, in Reedford: Go… sent the company to "the market", and it came into the herb-shop; the shops of a
// generated town all open off its heart, and the market had no ground of its own to stand on). A quarter with no open
// place is no quarter apart: its places are the heart's, where their doors are. And the heart's quarter is called as
// the town calls its heart ("the market-place"), not by the table's word for every town's ("the green"): standing on
// the market-place of Reedford, the page had called where the company stood "the green", and the shops "the market".
export class RegionQuarters {
  static lines(region: Region, written: string[]): string[] {
    const q = JSON.stringify, out: string[] = [];
    for (const s of region.settlements) {
      const roles = this.roles(s.id, written);
      if (roles.length < quarters.least) { continue; }
      const laid = this.laid(roles, this.open(s.id, written));
      for (const [id, { quarter, places, heart }] of Object.entries(laid)) {
        out.push(`  Entity ${s.id}_q_${id}: quarter ${q(this.named(quarter.name, { town: s, heart, written }))}.`,
          `  Initially Assert heartOf(${s.id}_q_${id}, ${s.id}_${heart}).`,
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
  // The roles of the town's open places: those a way goes to that is not a door (a path to the waterside, a road to
  // the heart), as against a room come into by its door.
  static open(town: string, written: string[]): Set<string> {
    const way = new RegExp(`^ {2}Passage \\S+ "[^"]*" is (\\w+) between (\\S+) and (\\S+)\\b`), out = new Set<string>();
    for (const line of written) {
      const m = way.exec(line);
      if (!m || ['door', 'doorway'].includes(m[1]!)) { continue; }
      for (const side of [m[2]!, m[3]!]) {
        const role = side.startsWith(`${town}_`) ? side.slice(town.length + 1) : '';
        if (/^[a-z]+$/.test(role)) { out.add(role); }
      }
    }
    return out;
  }
  // Each quarter the town has an open place for, with them, come into at its own heart where that is open, else at the
  // first of its open places; the rest with the first (the green), whose heart is always the town's heart.
  static laid(roles: string[], open: Set<string>): Record<string, Laid> {
    const all = Object.entries(quarters.quarters), out: Record<string, Laid> = {};
    const [first, main] = all[0]!;
    out[first] = { quarter: main, places: roles.filter(r => main.roles.includes(r)), heart: main.heart };
    for (const [id, quarter] of all.slice(1)) {
      const places = roles.filter(r => quarter.roles.includes(r));
      const heart = [quarter.heart, ...places].find(r => places.includes(r) && open.has(r));
      if (heart) { out[id] = { quarter, places, heart }; }
    }
    const placed = new Set(Object.values(out).flatMap(o => o.places));
    out[first]!.places.push(...roles.filter(r => !placed.has(r)));
    return out;
  }
  // A quarter's name, or where the table says "{heart}", the name of its heart as the town was written with it, less
  // the town's own name ("the market-place of Reedford" is the market-place).
  private static named(name: string, at: { town: { id: string; name: string }; heart: string; written: string[] }):
    string {
    if (!name.includes('{heart}')) { return name; }
    const line = at.written.find(l => l.startsWith(`  Place ${at.town.id}_${at.heart} "`));
    const heart = /^ {2}Place \S+ "([^"]*)"/.exec(line ?? '')?.[1] ?? 'the green';
    const town = at.town.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return name.replace('{heart}', heart.replace(new RegExp(` (?:at|of|in|by) ${town}$`), ''));
  }
}
