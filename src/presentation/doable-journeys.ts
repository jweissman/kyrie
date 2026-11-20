import type { Screen } from '../ui/screen-types';
import type { Route } from './glance-types';
import { JourneyFold } from './journey-fold';
import { Typography } from './typography';
import type { Row } from './doable';

interface Journey { command: string; label: string; minutes: number }

// Every journey that can be set out on from here, the engine's (MT-18): the ways about the town the scene's offer
// holds, and the roads, the places further off and a site's way out, which the runner and the page had each made for
// themselves from the screen (the parity measure: 31 journeys the two had drawn apart). Which of them are on the map
// rather than in the rest is said here too (map), by JourneyFold, which the runner alone had read.
export class DoableJourneys {
  // The journeys the scene's offer leaves out, by command, words and time: none to where a way from here already goes
  // (CL-07: the same place offered twice, as a way and as a journey); inside a site, the way out as the compass gives
  // it (Compass.out), the whole route in one act (cold play 4, CL-44).
  static more(flat: readonly Row[], screen: Screen, out?: Route): Journey[] {
    const had = new Set(flat.flatMap(r => r.does ? [r.does, ...this.reached(r.does)] : []));
    const leaving = out?.command && !out.barred && !had.has(out.command)
      ? [{ command: out.command, label: `Out to ${Typography.plain(out.name)}`, minutes: out.minutes }] : [];
    return [...leaving, ...JourneyFold.every(screen).filter(d => !had.has(`travel:${d.id}`))
      .map(d => ({ command: `travel:${d.id}`, label: `Set out for ${d.name}`, minutes: d.minutes }))];
  }
  // The rows with those journeys not kept in the rest marked as on the map; never one the four lead with.
  static mapped(rows: Row[], screen: Screen, out?: Route): Row[] {
    const kept = JourneyFold.kept(screen, out);
    return rows.map(r => r.led ? r : this.mark(r, kept));
  }
  private static mark(r: Row, kept: Set<string>): Row {
    return r.opens ? { ...r, opens: r.opens.map(k => this.mark(k, kept)) }
      : r.does?.startsWith('travel:') && !JourneyFold.keeps(kept, r.does) ? { ...r, map: true } : r;
  }
  private static reached(does: string): string[] {
    const to = /^go\([^,]+,([^)]+)\)$/.exec(does)?.[1];
    return to ? [`travel:${to}`] : [];
  }
}
