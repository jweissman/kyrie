import borders from '../../data/generation/scenes/borders.json';
import { RegionGeography } from './region-geography';
import { RegionRoads } from './region-roads';
import { Draw } from './land/draw';
import type { Border } from './land/borders';
import type { Region } from './region-writer';
import type { After } from './countries';
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
    if (beyond?.sea) { return this.shore(b, region, beyond.name); }
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
      `  Observe ${id}_scene at ${id} when true ${q(`${mark}${there}`)}.`,
      ...this.rumour({ room: this.room(b), way: `the road ${b.side}`, seat: b.seat }, beyond, region)];
  }
  // Where the road comes down to a great sea (see WorldShape): the shore, named for the sea and seen from it, and no
  // road over; the sea is crossed by ship, not on foot (the march toward it is not a march: see Frontier.closed).
  private static shore(b: Border, region: Region, sea: string): string[] {
    const q = JSON.stringify, id = this.room(b), [x, y] = RegionGeography.spot(region, b.cell), at = borders.shore;
    const from = region.settlements[b.seat]!, seen = new Draw(`${region.name}:shore:${b.side}`).pick(at.seen);
    return [`  Place ${id}_land ${q(`the ${b.side}ern shore of ${region.name}`)} is wilderness within region at ${x}, ${y}.`,
      `  Place ${id} ${q(this.said(at.room, region, sea))} is room within ${id}_land at 0, 0.`,
      `  Passage ${id}_road ${q(at.road.replaceAll('{side}', b.side))} is road between ${from.id}_green and ${id} taking ${RegionRoads.time(Math.max(60, b.road.hours * RegionRoads.minutesPerHour))}.`,
      `  Observe ${id}_scene at ${id} when true ${q(this.said(seen, region, sea))}.`];
  }
  private static said(text: string, region: Region, sea: string): string {
    return text.replaceAll('{region}', region.name).replaceAll('{sea}', sea);
  }
  // What the folk of every town of the country say of an authored country beyond, asked: whoever keeps travellers
  // tells it, named for what it is about, and the way to it from where they are; and where its news is posted, the
  // notice is nailed up where travellers are kept in each. Either is known from then as heard, and puts the road's
  // end on the company's map; the country's roads, which its folk know, take it there.
  // The same of a province of the country (RegionGates), at its way in: way, the road there as its folk say it.
  static rumour(b: { room: string; way: string; seat: number }, beyond: NonNullable<Region['beyond']>[Border['side']],
    region: Region): string[] {
    if (!beyond?.rumour || !beyond.heard) { return []; }
    const q = JSON.stringify, id = `${b.room}_beyond`, seat = region.settlements[b.seat]!;
    // Once the country marks what is said of it old news (seen through), it is not passed on as news.
    const fresh = this.remembers(beyond) ? ` and not stale(${id})` : '';
    const lines = [`  Discovery ${id} ${q(beyond.heard)}.`, `  Initially Assert leadsTo(${id}, ${b.room}).`,
      ...this.ways(id, beyond),
      ...beyond.notice ? this.notice(b, beyond, region) : []];
    for (const s of region.settlements) {
      const keeper = `${s.id}_innkeeper`, about = beyond.topic ?? b.way;
      const directions = s === seat ? '' : ` '${seat.name} is where ${b.way} goes out from,' {${keeper}} adds.`;
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
  private static notice(b: { room: string }, beyond: NonNullable<NonNullable<Region['beyond']>[Border['side']]>,
    region: Region) {
    const q = JSON.stringify, id = `${b.room}_beyond`, notice = `${b.room}_notice`, after = beyond.after;
    const at = region.settlements.map(s => [s.id, SettlementWriter.standing(region, s, 'innkeeper')] as const);
    return [`  Discovery ${notice} ${q(beyond.notice!.text)} {`, ...at.map(([sid, place]) =>
      `    Source ${notice}_${sid} ${q(beyond.notice!.name)} at ${place} readable by party.`),
    '  }', `  Initially Assert leadsTo(${notice}, ${b.room}).`,
    // The notice is seen where it is nailed up, and talked of, before anyone is asked: once, the first time the company
    // hears it, in whichever town (five notices talked of on every night at an inn had stood between a company and what
    // its own act did: the fresh playtest of 7 November); it stays to be read.
    // (Its fact is named in the talk's own words, so the talk is said once and not noted again by another name.)
    `  Entity ${notice}_talked: fact ${q(beyond.notice!.talk)}.`,
    ...at.map(([sid, place]) => `  Observe ${notice}_${sid}_talk at ${place} when ${this.remembers(beyond)
      ? `not stale(${id}) and ` : ''}not knows(party, ${notice}_talked) ${q(beyond.notice!.talk)}`
      + ` teaches ${notice}_talked.`),
    ...this.remembers(beyond) ? this.afters(id, after!).flatMap(a => at.map(([sid, place]) =>
      `  Observe ${notice}_${sid}_after${a.key} at ${place} when stale(${id})${a.when}`
      + ` and intact(${notice}_${sid}) ${q(a.talk)}.`)) : []];
  }
  // What came down of a country seen through: by which way it went there, where the country says which (each way's
  // word marked stale by it, the first that is), and else its one word (The Quiet in the Sky's friction 4, QIS-02).
  private static afters(id: string, after: After): { key: string; when: string; talk: string; told: string }[] {
    const ways = Object.keys(after.by ?? {});
    return [{ key: '', when: this.none(id, ways), talk: after.talk, told: after.told },
      ...ways.map((k, i) => ({ key: `_${k}`, when: ` and stale(${id}_${k})${this.none(id, ways.slice(0, i))}`,
        talk: after.by![k]!.talk ?? after.talk, told: after.by![k]!.told ?? after.told }))];
  }
  private static none(id: string, ways: string[]): string { return ways.map(k => ` and not stale(${id}_${k})`).join(''); }
  // Each way's word, a fact of its own for the country to mark.
  private static ways(id: string, beyond: NonNullable<Region['beyond']>[Border['side']]): string[] {
    return Object.keys(beyond?.after?.by ?? {}).map(k => `  Entity ${id}_${k}: fact ${JSON.stringify(`${id}, ${k}`)}.`);
  }
  // What is said of a country, and of each way it may go there, for the country to mark (exported to it).
  static words(id: string, after: After | undefined): string[] {
    return [id, ...Object.keys(after?.by ?? {}).map(k => `${id}_${k}`)];
  }
  // The company back from a country seen through, told what the road brought down of it before the company says its
  // own part: the report and the company's own history, said apart (a world that remembers). The notice comes down.
  private static back(b: { room: string }, beyond: NonNullable<NonNullable<Region['beyond']>[Border['side']]>,
    sid: string, place: string) {
    if (!this.remembers(beyond)) { return []; }
    const q = JSON.stringify, id = `${b.room}_beyond`, keeper = `${sid}_innkeeper`;
    const notice = beyond.notice ? `${b.room}_notice_${sid}` : undefined;
    return this.afters(id, beyond!.after!).flatMap(a => [
      `  Topic ${id}_back_${sid}${a.key} with ${keeper} ${q(`Tell {${keeper}} you have been to ${beyond!.name}`)}`
      + ` when stale(${id})${a.when} once {`,
      `    Says ${q(a.told.replaceAll('{keeper}', `{${keeper}}`))}.`,
      ...notice ? [`    On discuss { Retract intact(${notice}). Retract at(${notice}, ${place}). }`] : [], '  }']);
  }
}
