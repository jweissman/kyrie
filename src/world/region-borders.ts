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
    const marks = this.marks(region), borders = RegionGeography.atlas(region).borders ?? [];
    return [...borders.flatMap((b, i) => this.border(b, region, marks[i % marks.length]!)), ...this.further(region)];
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
    const land = beyond && `${beyond.name}, ${RegionGeography.terrain(beyond.terrain)} country`;
    // An authored country entered from another side: the folk know there is no road over into it from here.
    const there = !beyond ? '' : beyond.closed ? ` Beyond it lies ${land}, the folk say; but no road goes over into it from this side.${beyond.way ? ` The way in is from ${beyond.way}, they say.` : ''}`
      : ` Beyond it the road goes on ${b.side} into ${land}, the folk say. Few of them have been.`;
    // The place is named for the country beyond, as the folk call it, so every way, mark and lead to it says where it
    // goes (a generated neighbour's had been "the eastern edge of Acornweald", and a lead to Thrume, by Highfells,
    // "Set out for the southern edge of Acornweald": the navigation review); the country's edge where none is known.
    const edge = beyond ? `the march-stone of ${beyond.name}` : `the ${b.side}ern edge of ${region.name}`;
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
    // Once the country marks what is said of it old news (seen through), it is not passed on as news.
    const fresh = this.remembers(beyond) ? ` and not stale(${id})` : '';
    const lines = [`  Discovery ${id} ${q(beyond.heard)}.`, `  Initially Assert leadsTo(${id}, ${this.room(b)}).`,
      ...beyond.notice ? this.notice(b, beyond, region) : []];
    for (const s of region.settlements) {
      const keeper = `${s.id}_innkeeper`, about = beyond.topic ?? `the road ${b.side}`;
      const directions = s === seat ? '' : ` '${seat.name} is where the road ${b.side} goes out from,' {${keeper}} adds.`;
      lines.push(`  Topic ${id}_told_${s.id} with ${keeper} ${q(`Ask {${keeper}} about ${about}`)} when not knows(actor, ${id})${fresh} {`,
        `    Says ${q(beyond.rumour.replaceAll('{keeper}', `{${keeper}}`) + directions)}.`,
        `    On discuss { Assert knows(actor, ${id}). }`, '  }', ...this.back(b, beyond, s.id,
          SettlementWriter.standing(region, s, 'innkeeper')));
    }
    return lines;
  }
  // What the folk of every town have heard of the authored countries further off, beyond the countries next to
  // theirs, asked about what lies beyond each: whoever keeps travellers tells it, and each is known from then as
  // heard, and puts the road out toward it on the company's map.
  private static further(region: Region): string[] {
    const q = JSON.stringify, lines: string[] = [], sides = [...new Set((region.further ?? []).map(f => f.side))];
    for (const side of sides) {
      const heard = region.further!.filter(f => f.side === side), via = heard[0]!.via, id = `edge_${side}_further`;
      for (const f of heard) {
        const where = f.then === side ? `further ${f.then}` : `${f.then} of it`;
        lines.push(`  Discovery ${id}_${f.id} ${q(`${this.cap(f.name)} lies beyond ${via}, ${where}: ${RegionGeography.terrain(f.terrain)} country, where ${f.far}. The road ${side} goes to ${via}.`)}.`,
          `  Initially Assert leadsTo(${id}_${f.id}, ${this.room({ side } as Border)}).`);
      }
      const told = heard.map(f => `${f.then === side ? `On ${f.then} beyond it` : `${this.cap(f.then)} of it`} there is ${f.name}, ${RegionGeography.terrain(f.terrain)} country, they say, where ${f.far}.`);
      for (const s of region.settlements) {
        const keeper = `${s.id}_innkeeper`;
        lines.push(`  Topic ${id}_told_${s.id} with ${keeper} ${q(`Ask {${keeper}} about what lies beyond ${via}`)} when not knows(actor, ${id}_${heard[0]!.id}) {`,
          `    Says ${q(`'Beyond ${via}?' says {${keeper}}. '${told.join(' ')} Folk in ${via} would know more of it than I do.'`)}.`,
          `    On discuss { ${heard.map(f => `Assert knows(actor, ${id}_${f.id}).`).join(' ')} }`, '  }');
      }
    }
    return lines;
  }
  private static cap(text: string): string { return text.charAt(0).toUpperCase() + text.slice(1); }
  // Whether a country beyond says when it is seen through, so the country below can take it as old news.
  static remembers(beyond: NonNullable<Region['beyond']>[Border['side']] | undefined): boolean {
    return !!(beyond?.after && beyond.rumour && beyond.heard);
  }
  // The notice nailed up where travellers are kept in each town, talked of until the news is old, and then talked of
  // as old news until it comes down.
  private static notice(b: Border, beyond: NonNullable<NonNullable<Region['beyond']>[Border['side']]>, region: Region) {
    const q = JSON.stringify, id = `${this.room(b)}_beyond`, notice = `${this.room(b)}_notice`, after = beyond.after;
    const at = region.settlements.map(s => [s.id, SettlementWriter.standing(region, s, 'innkeeper')] as const);
    return [`  Discovery ${notice} ${q(beyond.notice!.text)} {`, ...at.map(([sid, place]) =>
      `    Source ${notice}_${sid} ${q(beyond.notice!.name)} at ${place} readable by party.`),
    '  }', `  Initially Assert leadsTo(${notice}, ${this.room(b)}).`,
    // The notice is seen where it is nailed up, and talked of, before anyone is asked.
    ...at.map(([sid, place]) => `  Observe ${notice}_${sid}_talk at ${place} when ${this.remembers(beyond)
      ? `not stale(${id})` : 'true'} ${q(beyond.notice!.talk)}.`),
    ...this.remembers(beyond) ? at.map(([sid, place]) => `  Observe ${notice}_${sid}_after at ${place} when stale(${id})`
      + ` and intact(${notice}_${sid}) ${q(after!.talk)}.`) : []];
  }
  // The company back from a country seen through, told what the road brought down of it before the company says its
  // own part: the report and the company's own history, said apart (a world that remembers). The notice comes down.
  private static back(b: Border, beyond: NonNullable<NonNullable<Region['beyond']>[Border['side']]>, sid: string,
    place: string) {
    if (!this.remembers(beyond)) { return []; }
    const q = JSON.stringify, id = `${this.room(b)}_beyond`, keeper = `${sid}_innkeeper`;
    const notice = beyond.notice ? `${this.room(b)}_notice_${sid}` : undefined;
    return [`  Topic ${id}_back_${sid} with ${keeper} ${q(`Tell {${keeper}} you have been to ${beyond.name}`)} when stale(${id}) once {`,
      `    Says ${q(beyond.after!.told.replaceAll('{keeper}', `{${keeper}}`))}.`,
      ...notice ? [`    On discuss { Retract intact(${notice}). Retract at(${notice}, ${place}). }`] : [], '  }'];
  }
}
