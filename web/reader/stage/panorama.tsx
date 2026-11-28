import type { Exchange } from '../../../src/presentation/narrator';
import type { Choice } from '../../../src/ui/choice-list';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../../../src/presentation/words';
import type { Note } from '../../../src/presentation/noted';

export interface Sight {
  bearing: string; distance: string; place: string; seen: string; by?: string; way?: string; beyond?: string;
}
// Somewhere the company could set out for, by its name, and the journey there as it is offered (see MenuModel).
export interface Going { id: string; name: string; journey: Choice }

// What can be seen from somewhere high (Mission 17's vantage points, see RegionSights), set out as what it is: the
// compass, each way and what lies that way and how far, a place known for what it is by its name (what it looked
// like, and whose knowledge named it, under it), and each somewhere to set out for; not each sight one more line of
// the telling, as the first climb of a town's tower read them.
export class Panorama {
  static readonly compass = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];
  static readonly short: Record<string, string> = { north: 'N', 'north-east': 'NE', east: 'E', 'south-east': 'SE',
    south: 'S', 'south-west': 'SW', west: 'W', 'north-west': 'NW' };
  static readonly distances = ['not far off', 'some way off', 'a long way off', 'far off, through the glass'];
  // The sights among an exchange's lines, round the compass and nearest first, and which lines they were told in: a
  // sight, the knowing of it that follows it, whose knowledge that was, the way to it seen from up there, and over a
  // march, what is seen of the country beyond.
  static read(lines: Exchange['lines']): { sights: Sight[]; told: Set<number> } {
    const sights: Sight[] = [], told = new Set<number>();
    lines.forEach((l, i) => {
      const p = l.sight, last = sights.at(-1), after = told.has(i - 1);
      if (p?.part === 'sight') {
        sights.push({ bearing: p.bearing, distance: p.distance, place: p.place, seen: p.place });
      } else if (!p || !last || !after || (p.part === 'credit' && last.place === last.seen)) {
        return;
      } else if (p.part === 'known') {
        last.place = p.place;
      } else if (p.part === 'credit') {
        last.by = l.text;
      } else if (p.part === 'way') {
        last.way = `The way: ${p.way}.`;
      } else {
        last.beyond = `Beyond it: ${p.beyond}.`;
      }
      told.add(i);
    });
    return { told, sights: sights.sort((a, b) => this.compass.indexOf(a.bearing) - this.compass.indexOf(b.bearing)
      || this.distances.indexOf(a.distance) - this.distances.indexOf(b.distance)) };
  }
  // The notes in the margin the panorama does not already say (a ruin known for what it is, by its name and its look).
  static unsaid(notes: Note[], sights: Sight[]): Note[] {
    return notes.filter(n => n.kind !== 'learned'
      || !sights.some(s => s.place !== s.seen && this.plain(n.text) === this.plain(`${s.place}: ${s.seen}`)));
  }
  // The view told once, in words (the owner, 26 November, OR-1250: a climb had yielded a row for each place seen and
  // "View on map" rows): each way round the compass in one line of prose, a place known for what it is by its name,
  // and no row of its own, nor any to set out or to look at the map; taking out the map stays an act of its own. A line
  // of the telling like any other (the owner, 27 November, late, OR-1883: the view had stood apart under a rule and a
  // heading of its own, a fold-out in the narration competing with the four; text is just text). What it shows is
  // known after (Vantage), for the places within the hex to stand where the compass reads them.
  static View({ sights }: { sights: Sight[]; going?: Going[]; choose?: (c: Choice) => void; onMap?: boolean }) {
    return <p className="change view" data-id="panorama">{Typography.curl(Panorama.said(sights))}</p>;
  }
  // The sights in one telling: "To the north, not far off, the edge of the wood; to the west, some way off, Fearnglaed."
  static said(sights: Sight[]): string {
    const parts = sights.map(s => `to the ${s.bearing}, ${s.distance}, ${s.place}${s.place !== s.seen ? ` (${s.seen})` : ''}`);
    return parts.length ? `${Words.upper(parts.join('; '))}.` : '';
  }
  private static same(a: string, b: string): boolean { return this.plain(a) === this.plain(b); }
  private static plain(t: string): string { return t.toLowerCase().replace(/[‘’]/g, '\''); }
}
