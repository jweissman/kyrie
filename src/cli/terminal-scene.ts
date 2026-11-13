import { FictionalTime } from '../campaign/fictional-time';
import { Typography } from '../presentation/typography';
import type { Leaf } from '../presentation/narrator';
import type { Screen } from '../ui/screen-types';

// How a turn is come to: arriving somewhere, doing something where the company stands, or looking deliberately.
export type Turned = 'arrive' | 'act' | 'look';

// What the terminal says of a turn, keeping what it has already said, so the unchanged is not said again. Nearly every
// command had told the place's name, the day, the hour and the familiar surroundings again (the owner, 14 November:
// TM-02). On arrival, the place is told briefly, as the glance tells it. After an act, the terminal tells what happened
// and what changed. A look tells the place whole. The day and the part of it, the weather, the aim and what is
// needed are said when they change, and on a look.
export class TerminalScene {
  private said: Partial<Record<'place' | 'time' | 'weather' | 'aim' | 'need', string>> = {};
  // Each presentation as it was printed, by how its turn was come to: what a walk measures (TerminalWalk).
  readonly told: { turned: Turned; lines: string[] }[] = [];
  lines(screen: Screen, leaf: Leaf, turned: Turned): string[] {
    const whole = turned === 'look', day = screen.date?.short ?? `Day ${FictionalTime.day(screen.elapsed)}`;
    const time = this.fresh('time', `${day}, ${FictionalTime.part(screen.elapsed)}`, whole);
    const place = this.fresh('place', screen.place.name, whole), weather = this.fresh('weather', screen.weather, whole);
    // The hour itself only on a look: the part of the day is what changes how a place is.
    const when = whole ? screen.clock : time;
    const head = turned === 'act' ? [when, weather] : [place ?? screen.place.name, when, weather];
    const header = head.filter(Boolean).join(' · ');
    const seen = whole || !leaf.glanced ? leaf : leaf.glanced;
    const unsaid = new Set(whole ? [] : leaf.glanced?.unsaid ?? []);
    const happened = (leaf.exchange?.lines ?? []).map(l => l.text).filter(t => !unsaid.has(t));
    // After an act, what happened and what changed; the place's own telling is not said again.
    const prose = turned === 'act' ? [...happened, ...leaf.changed]
      : [...seen.situation, ...seen.presence, ...leaf.changed, ...happened];
    const aim = this.fresh('aim', screen.objectives[0], whole);
    const need = this.fresh('need', leaf.glance?.need?.join(' · '), whole);
    const lines = [...header ? ['', header] : [], ...prose.map(l => Typography.plain(l)),
      ...aim ? [`Aim: ${Typography.plain(aim)}`] : [], ...need ? [`Need: ${need}`] : []];
    this.told.push({ turned, lines: lines.filter(l => l && l !== header) });
    return lines;
  }
  // A thing said again only when it has changed since it was last said, or on a look.
  private fresh(key: keyof TerminalScene['said'], value: string | undefined, whole: boolean): string | undefined {
    const changed = value !== undefined && (whole || this.said[key] !== value);
    if (value !== undefined) { this.said[key] = value; }
    return changed ? value : undefined;
  }
}
