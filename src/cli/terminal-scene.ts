import { FictionalTime } from '../campaign/fictional-time';
import { Typography } from '../presentation/typography';
import { AimSaid } from '../presentation/aim-said';
import { Signs } from '../presentation/signs';
import { ToldLines } from '../presentation/told-lines';
import { TerminalColour, type Depth } from './terminal-colour';
import type { Leaf } from '../presentation/narrator';
import type { Screen } from '../ui/screen-types';

// How a turn is come to: arriving somewhere, doing something where the company stands, or looking deliberately.
export type Turned = 'arrive' | 'act' | 'look';

// What the terminal says of a turn, as the page's glance says it, keeping what it has already said so that the
// unchanged is not said again. Nearly every command had told the place's name, the day, the hour and the familiar
// surroundings again (the owner, 14 November: TM-02), and an arrival had told the narrator's paragraphs where the page
// shows its glance (TM-03: one presentation).
// - On arrival: how the company came, the place's own line, one sign of life, what has changed since.
// - After an act: what happened and what changed.
// - On a look: the place whole.
// The day and the part of it, the weather, the aim and what is needed are said when they change, and on a look. The
// aim is said by the page's rule (AimSaid): followed, in gold; offered, by its title with how to follow it.
export class TerminalScene {
  private said: Partial<Record<'place' | 'time' | 'weather' | 'aim' | 'need' | 'instruments', string>> = {};
  // Each presentation as it was printed, by how its turn was come to: its prose (the scene's narration, what came of
  // an act), and apart from it what it says for reference (the aim, what is needed), so that a walk measures each
  // (TerminalWalk).
  readonly told: { turned: Turned; lines: string[]; reference: string[] }[] = [];
  // instruments: whether the instruments are said among the lines (the human mode reads them in its picker instead);
  // picked: whether the player picks by keys, so that how to follow an aim is its key, not a command to type.
  constructor(private readonly depth: Depth = 'none', private readonly o: { instruments?: boolean; picked?: boolean } = {}) {}
  lines(screen: Screen, leaf: Leaf, turned: Turned): string[] {
    const whole = turned === 'look', day = screen.date?.short ?? `Day ${FictionalTime.day(screen.elapsed)}`;
    const time = this.fresh('time', `${day}, ${FictionalTime.part(screen.elapsed)}`, whole);
    const place = this.fresh('place', screen.place.name, whole), weather = this.fresh('weather', screen.weather, whole);
    // The hour itself only on a look: the part of the day is what changes how a place is.
    const when = whole ? screen.clock : time;
    const name = turned === 'act' ? undefined : TerminalColour.bold(place ?? screen.place.name, this.depth);
    const header = [name, when, weather].filter(Boolean).join(' · ');
    const unsaid = new Set(whole ? [] : leaf.glanced?.unsaid ?? []);
    const happened = ToldLines.said(leaf.exchange?.lines ?? [], whole).filter(l => !unsaid.has(l.text)).map(l => l.kind === 'speech'
      ? TerminalColour.italic(Typography.plain(l.text), this.depth) : Typography.plain(l.text));
    const g = leaf.glance, seen = [g?.came, g?.sight?.text, g?.life?.text, ...g?.changed ?? []]
      .filter((l): l is string => !!l).map(l => Typography.plain(l));
    // After an act, what happened and what changed; arriving, the glance; looked at, the place whole.
    const placed = [...leaf.situation, ...leaf.presence, ...leaf.changed].map(l => Typography.plain(l));
    const prose = turned === 'act' ? [...happened, ...leaf.changed.map(l => Typography.plain(l))]
      : whole || !g ? [...placed, ...happened] : [...seen, ...happened];
    const reference = [...this.aim(screen, g?.aim, whole), ...this.need(leaf, whole), ...this.instruments(leaf, whole)];
    this.told.push({ turned, lines: prose, reference });
    return [...header ? ['', header] : [], ...prose, ...reference];
  }
  // The aim, by the page's rule, when it has changed (or on a look).
  private aim(screen: Screen, glanced: string | undefined, whole: boolean): string[] {
    const aim = AimSaid.of(screen, glanced), text = aim && Typography.plain(aim.text);
    // Said again when it is followed or let go, as well as when its words change.
    if (!aim || !this.fresh('aim', `${aim.followed ? 'followed' : 'held'}:${text}`, whole)) { return []; }
    const d = this.depth;
    if (aim.followed) { return [TerminalColour.paint('gold', TerminalColour.bold(`Following: ${text}`, d), d)]; }
    const n = (screen.aims ?? []).findIndex(a => a.id === aim.offered) + 1;
    return [`${TerminalColour.bold(`An aim: ${text}`, d)}${n ? this.o.picked ? ' · a to follow' : ` · follow ${n}` : ''}`];
  }
  private need(leaf: Leaf, whole: boolean): string[] {
    const need = this.fresh('need', leaf.glance?.need?.join(' · '), whole);
    return need ? [`Need: ${need}`] : [];
  }
  // The company's instruments (see Instruments): every one it can read on a look; otherwise one that bears on the
  // moment, and only when what it reads has changed. Quiet, each by its emblem's character where it has one.
  private instruments(leaf: Leaf, whole: boolean): string[] {
    if (this.o.instruments === false && !whole) { return []; }
    const shown = (leaf.instruments ?? []).filter(i => whole || i.relevant)
      .map(i => `${i.emblem ? `${Signs.emblem(i.emblem) ?? ''} ` : ''}${i.label}: ${i.said}`);
    const said = this.fresh('instruments', shown.join(' | ') || undefined, whole);
    return said ? shown.map(l => TerminalColour.dim(l, this.depth)) : [];
  }
  // A thing said again only when it has changed since it was last said, or on a look.
  private fresh(key: keyof TerminalScene['said'], value: string | undefined, whole: boolean): string | undefined {
    const changed = value !== undefined && (whole || this.said[key] !== value);
    if (value !== undefined) { this.said[key] = value; }
    return changed ? value : undefined;
  }
}
