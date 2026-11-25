// Layer: the generic player (presentation). Knows no setting; reads the glance and the screen the engine made, never a
// client's state. TB-09's first activity: travel as an engine question.
import type { Screen } from '../ui/screen-types';
import type { Glance } from './glance-types';
import { MapRows } from './map-rows';

// Where the company may set out for from here, asked by the engine for every client: its words, and a row a place,
// each with the command that sets out (travel:<place>, or a way's go(…)), its minutes and the kind of journey it is.
// The terminal had planned its own (TB-09: travel: rows made from the screen's destinations, the town's places and the
// roads, crossings from LandCrossing, and the glance's onward ways, then folded by JourneyFold), beside the page's
// map, which reads MapRows; both now read this, one list, in the engine's order. Why a journey stopped is the
// engine's too (Travel.go's stopped: Frame.travel, PlaySession.journeyed).
export type TravelKind = 'onward' | 'town' | 'known' | 'roads' | 'across';
export interface TravelRow { id: string; label: string; command: string; place: string; minutes: number;
  kind: TravelKind }
export interface Asked { question: string; rows: TravelRow[] }
export class TravelQuestion {
  static readonly asked = 'Where to?';
  // The leaf with its travel question, where it has a glance.
  static on<L extends { glance?: Glance }>(leaf: L, screen: Screen): L & { travel?: Asked } {
    return leaf.glance ? { ...leaf, travel: this.of(leaf.glance, screen) } : leaf;
  }
  static of(glance: Glance, screen: Screen): Asked {
    const led = new Set([...glance.acts.map(a => a.command), glance.next?.command].filter(c => c !== undefined));
    const lists: [TravelKind, { id: string }[] | undefined][] = [['town', screen.around], ['known', screen.destinations],
      ['roads', screen.roads]];
    const rows = MapRows.of(glance, screen).map(r => {
      const command = r.row.does ?? r.row.id;
      const kind = led.has(command) ? 'onward' : lists.find(([, ds]) => ds?.some(d => d.id === r.place))?.[0] ?? 'across';
      return { id: r.row.id, label: r.row.label, command, place: r.place, minutes: r.minutes, kind };
    });
    return { question: this.asked, rows };
  }
}
