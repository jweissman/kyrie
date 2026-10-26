import borders from '../../data/generation/scenes/borders.json';
import { RegionGeography } from './region-geography';
import { RegionRoads } from './region-roads';
import { Draw } from './land/draw';
import type { Border } from './land/borders';
import type { Region } from './region-writer';
import { SettlementWriter } from './settlement-writer';

// The roads out of a region: from the settlement nearest each side, an old road to the edge of the region, marked
// as the kingdom after the makers marked its bounds, or as the land itself is marked (a cairn on a pass, a beacon on
// stilts in a fen), no two borders of a country alike (data/generation/scenes/borders.json). The folk know what the
// country beyond is called and what kind of country it is, and little more; what is there is drawn the first time a
// company goes on (see Frontier).
export class RegionBorders {
  static lines(region: Region): string[] {
    const marks = this.marks(region);
    return (RegionGeography.atlas(region).borders ?? [])
      .flatMap((b, i) => this.border(b, region, marks[i % marks.length]!));
  }
  // The marks a country's borders draw from: the kingdom's first, then the land's, in an order of their own.
  private static marks(region: Region): string[] {
    const s = region.history?.successors;
    const t = borders.terrain as Record<string, string[]>, k = borders.kingdom as Record<string, string[]>;
    const land = new Draw(`${region.name}:borders`).shuffle([...t[region.terrain] ?? [], ...t.plain!]);
    const kingdom = s ? new Draw(`${region.name}:borders:kingdom`).shuffle(k[s.kind] ?? []).slice(0, 1) : [];
    return [...kingdom, ...land].map(m => m.replaceAll('{region}', region.name).replaceAll('{kingdom}', s?.name ?? region.name));
  }
  static room(b: Border): string { return `edge_${b.side}`; }
  private static border(b: Border, region: Region, mark: string): string[] {
    const q = JSON.stringify, id = this.room(b), [x, y] = RegionGeography.spot(region, b.cell);
    const from = region.settlements[b.seat]!, beyond = region.beyond?.[b.side];
    const there = beyond ? ` Beyond it the road goes on ${b.side} into ${beyond.name}, ${RegionGeography.terrain(beyond.terrain)} country, the folk say. Few of them have been.` : '';
    // Where the road leaves for a country folk tell of, the place is the road to it; elsewhere, the country's edge.
    const edge = beyond?.rumour ? `the march-stone of ${beyond.name}` : `the ${b.side}ern edge of ${region.name}`;
    return [`  Place ${id}_land ${q(`the ${b.side}ern marches of ${region.name}`)} is wilderness within region at ${x}, ${y}.`,
      `  Place ${id} ${q(edge)} is room within ${id}_land at 0, 0.`,
      `  Passage ${id}_road ${q(`the old road ${b.side}`)} is road between ${from.id}_green and ${id} taking ${RegionRoads.time(Math.max(60, b.road.hours * RegionRoads.minutesPerHour))}.`,
      `  Observe ${id}_scene at ${id} when true ${q(`${mark}${there}`)}.`, ...this.rumour(b, beyond, region)];
  }
  // What the folk of every town of the country say of an authored country beyond, asked: whoever keeps travellers
  // tells it, named for what it is about, and the way to it from where they are; and where its news is posted, the
  // notice is nailed up where travellers are kept in each. Either is known from then as heard, and puts the road's
  // end on the company's map; the country's roads, which its folk know, take it there.
  private static rumour(b: Border, beyond: NonNullable<Region['beyond']>[Border['side']], region: Region): string[] {
    if (!beyond?.rumour || !beyond.heard) { return []; }
    const q = JSON.stringify, id = `${this.room(b)}_beyond`, seat = region.settlements[b.seat]!;
    const lines = [`  Discovery ${id} ${q(beyond.heard)}.`, `  Initially Assert leadsTo(${id}, ${this.room(b)}).`];
    if (beyond.notice) {
      const notice = `${this.room(b)}_notice`;
      const at = region.settlements.map(s => [s.id, SettlementWriter.standing(region, s, 'innkeeper')] as const);
      lines.push(`  Discovery ${notice} ${q(beyond.notice.text)} {`, ...at.map(([sid, place]) =>
        `    Source ${notice}_${sid} ${q(beyond.notice!.name)} at ${place} readable by party.`),
      '  }', `  Initially Assert leadsTo(${notice}, ${this.room(b)}).`,
      // The notice is seen where it is nailed up, and talked of, before anyone is asked.
      ...at.map(([sid, place]) => `  Observe ${notice}_${sid}_talk at ${place} when true ${q(beyond.notice!.talk)}.`));
    }
    for (const s of region.settlements) {
      const keeper = `${s.id}_innkeeper`, about = beyond.topic ?? `the road ${b.side}`;
      const directions = s === seat ? '' : ` '${seat.name} is where the road ${b.side} goes out from,' {${keeper}} adds.`;
      lines.push(`  Topic ${id}_told_${s.id} with ${keeper} ${q(`Ask {${keeper}} about ${about}`)} when not knows(actor, ${id}) {`,
        `    Says ${q(beyond.rumour.replaceAll('{keeper}', `{${keeper}}`) + directions)}.`,
        `    On discuss { Assert knows(actor, ${id}). }`, '  }');
    }
    return lines;
  }
}
