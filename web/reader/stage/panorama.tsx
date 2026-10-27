import type { Exchange } from '../../../src/presentation/narrator';
import type { Choice } from '../../../src/ui/choice-list';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';

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
  static readonly sight = new RegExp('^To the (north|north-east|east|south-east|south|south-west|west|north-west), '
    + '(not far off|some way off|a long way off|far off, through the glass): (.+)\\.$');
  static readonly known = /^You know it by its look: that is (.+)\.$/;
  static readonly credit = /^It is .+ that makes it out\.$/;
  static readonly way = /^The way to .+?: (.+)\.$/;
  static readonly beyond = /^Beyond it, over the march: (.+)\.$/;
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
      const m = this.sight.exec(l.text), k = this.known.exec(l.text), w = this.way.exec(l.text), last = sights.at(-1);
      const after = told.has(i - 1), over = this.beyond.exec(l.text);
      if (m) {
        sights.push({ bearing: m[1]!, distance: m[2]!, place: m[3]!, seen: m[3]! });
        told.add(i);
      } else if (k && last && after) {
        last.place = k[1]!;
        told.add(i);
      } else if (this.credit.test(l.text) && last && after && last.place !== last.seen) {
        last.by = l.text;
        told.add(i);
      } else if (w && last && after) {
        last.way = `The way: ${w[1]!}.`;
        told.add(i);
      } else if (over && last && after) {
        last.beyond = `Beyond it: ${over[1]!}.`;
        told.add(i);
      }
    });
    return { told, sights: sights.sort((a, b) => this.compass.indexOf(a.bearing) - this.compass.indexOf(b.bearing)
      || this.distances.indexOf(a.distance) - this.distances.indexOf(b.distance)) };
  }
  // The notes in the margin the panorama does not already say (a ruin known for what it is, by its name and its look).
  static unsaid(notes: string[], sights: Sight[]): string[] {
    return notes.filter(n => !sights.some(s => s.place !== s.seen && this.plain(n) === this.plain(`Noted: ${s.place}: ${s.seen}`)));
  }
  // Each way, as a row of the compass: where to set out for it, when it is somewhere the company could set out for.
  static View({ sights, going = [], choose }: { sights: Sight[]; going?: Going[]; choose?: (c: Choice) => void }) {
    return (
      <div className="panorama" role="group" aria-label="What can be seen from here" data-id="panorama">
        <p className="kicker">What can be seen from here</p>
        <ol className="compass">{sights.map((s, i) => {
          const d = going.find(x => Panorama.same(x.name, s.place));
          return <li key={i} data-bearing={s.bearing}>
            <span className="toward" title={s.bearing}>{Panorama.short[s.bearing]}</span>
            <span className="sighted"><span className="sight-name">{Typography.curl(Words.upper(s.place))}</span>
              {s.place !== s.seen && <span className="looked">{Typography.curl(`${Words.upper(s.seen)}. ${s.by ?? ''}`
                .trim())}</span>}
              {s.way && <span className="looked">{Typography.curl(s.way)}</span>}
              {s.beyond && <span className="looked beyond">{Typography.curl(s.beyond)}</span>}</span>
            <span className="off">{s.distance}{d?.journey.minutes ? ` · ${Words.span(d.journey.minutes)}` : ''}</span>
            {d && choose && <button type="button" className="act set-out" data-action="set-out" data-id={d.id}
              title={d.journey.label} onClick={() => choose(d.journey)}>Set out</button>}
          </li>;
        })}</ol>
      </div>
    );
  }
  private static same(a: string, b: string): boolean { return this.plain(a) === this.plain(b); }
  private static plain(t: string): string { return t.toLowerCase().replace(/[‘’]/g, '\''); }
}
