import { FictionalTime } from '../campaign/fictional-time';
import { Typography } from '../presentation/typography';
import { AimSaid } from '../presentation/aim-said';
import { Signs } from '../presentation/signs';
import { ToldLines } from '../presentation/told-lines';
import { RecruitSaid } from '../presentation/recruit-said';
import { Prologue } from '../presentation/prologue';
import type { Campaign } from '../campaign/campaign';
import { TerminalColour, type Depth } from './terminal-colour';
import { TerminalWidth } from './terminal-width';
import { Narrator, type Leaf, type Told } from '../presentation/narrator';
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
  private said: Partial<Record<'place' | 'time' | 'weather' | 'aim' | 'need' | 'instruments' | 'recruit', string>> = {};
  // Each presentation as it was printed, by how its turn was come to: its prose (the scene's narration, what came of
  // an act), and apart from it what it says for reference (the aim, what is needed), so that a walk measures each
  // (TerminalWalk).
  readonly told: { turned: Turned; lines: string[]; reference: string[] }[] = [];
  // instruments: whether the instruments are said among the lines (the human mode reads them in its picker instead);
  // picked: whether the player picks by keys, so that how to follow an aim is its key, not a command to type.
  constructor(private readonly depth: Depth = 'none', private readonly o: { instruments?: boolean; picked?: boolean } = {}) {}
  private opened = false;
  // What of the last act's telling has been said, line by line: a look after it says only what was not (the dice,
  // what the budget held back), never the act again. Owain's whole answer, and the dog's greeting, had been said again
  // on a follow's look (cold play 4, CL-47).
  private heard = { of: '', said: new Set<string>() };
  // The narrator's leaf, with the game's opening as the page tells it apart before the first place (see Prologue): on
  // the first turn, before anything is done, and once. The terminal and the runner had opened on the quay's gulls, and
  // why the company was there (Bran taken, the tally-stick at your feet, Owain your cousin) came only with a second
  // look (cold play 4, CL-42). The place told with it leaves out what it told (Narrator.leaf's opening).
  leaf(campaign: Campaign, screen: Screen, told?: Told): Leaf {
    const first = !this.opened && !told && !campaign.history.length;
    this.opened = true;
    const opening = first ? Prologue.of(campaign, screen, Prologue.title(campaign, screen)) : undefined;
    const leaf = Narrator.leaf(campaign, screen, told, opening?.opening);
    return opening ? { ...leaf, prologue: opening.told } : leaf;
  }
  lines(screen: Screen, leaf: Leaf, turned: Turned): string[] {
    const whole = turned === 'look', day = screen.date?.short ?? `Day ${FictionalTime.day(screen.elapsed)}`;
    const time = this.fresh('time', `${day}, ${FictionalTime.part(screen.elapsed)}`, whole);
    const place = this.fresh('place', screen.place.name, whole), weather = this.fresh('weather', screen.weather, whole);
    // The hour itself only on a look: the part of the day is what changes how a place is. On the one calendar: a
    // look had said "Day 1, 12:18 p.m." under "17 Smoke, afternoon" (cold play 4, CL-47's 6).
    const when = whole ? screen.clock.replace(/^Day \d+(?=, )/, day) : time;
    // The place as a heading, in the stage's ivory, the day and the weather quiet beside it, a faint rule under it
    // where there is colour (headless, the line alone).
    const d = this.depth, named = turned === 'act' ? undefined : place ?? screen.place.name;
    const name = named && TerminalColour.bold(TerminalColour.ink('ivory', named, d), d);
    const beside = [when, weather].filter(Boolean).join(' · ');
    const header = [name, beside && (name ? TerminalColour.ink('dim', beside, d) : beside)].filter(Boolean).join(' · ');
    const rule = header && d !== 'none' ? [TerminalColour.ink('faint', '─'.repeat(Math.min(60,
      TerminalWidth.of(header))), d)] : [];
    const unsaid = new Set(whole ? [] : leaf.glanced?.unsaid ?? []), exchange = leaf.exchange?.lines ?? [];
    const of = exchange.map(l => l.text).join('\n');
    // Another act's telling is said afresh, though its words be the same ("An hour passes." each hour).
    if (!whole || this.heard.of !== of) { this.heard = { of, said: new Set() }; }
    const lines = ToldLines.said(exchange, whole).filter(l => !unsaid.has(l.text) && !this.heard.said.has(l.text));
    lines.forEach(l => this.heard.said.add(l.text));
    const happened = lines.map(l => l.kind === 'speech'
      ? TerminalColour.italic(Typography.plain(l.text), this.depth) : Typography.plain(l.text));
    const g = leaf.glance, seen = [g?.came, g?.sight?.text, g?.life?.text, g?.contents?.text, ...g?.changed ?? []]
      .filter((l): l is string => !!l).map(l => Typography.plain(l));
    // After an act, what happened and what changed; arriving, the glance; looked at, the place whole.
    const placed = [...leaf.situation, ...leaf.presence, ...leaf.changed].map(l => Typography.plain(l));
    const prose = turned === 'act' ? [...happened, ...leaf.changed.map(l => Typography.plain(l))]
      : whole || !g ? [...placed, ...happened] : [...seen, ...happened];
    // The opening's aim is the aim the place would have said (the glance leaves it to the opening: Glance.of).
    const reference = [...this.aim(screen, g?.aim ?? leaf.prologue?.aim, whole), ...this.recruits(screen, whole),
      ...this.need(leaf, whole), ...this.instruments(leaf, whole)];
    this.told.push({ turned, lines: prose, reference });
    return [...this.prologue(leaf), ...header ? ['', header, ...rule] : [], ...prose, ...reference];
  }
  // The opening, before the first place: its chapter, its beats, whoever is met on the way in. Its own pages on the
  // page, so not counted with the place's telling (TerminalWalk's budget).
  private prologue(leaf: Leaf): string[] {
    const p = leaf.prologue;
    if (!p) { return []; }
    const d = this.depth;
    return ['', TerminalColour.bold(TerminalColour.ink('ivory', p.title, d), d),
      ...[...p.beats, ...p.meeting ? [p.meeting.text] : []].map(l => Typography.plain(l))];
  }
  // The aim, said once for each change, never by comparing its words: when the glance says it (Glance.aim: on a first
  // arrival, where no act serves it, when it has changed), when the aim followed has changed (Follow this, or let go),
  // and on a look. Followed, it is said as followed, even before anything is done: following is the change. It had been
  // said two and three times over as its words lengthened once it was held (the human mode's assessment).
  private aim(screen: Screen, glanced: string | undefined, whole: boolean): string[] {
    const followed = screen.aims?.find(a => a.followed), state = followed?.id ?? '';
    const turned = this.said.aim !== undefined && this.said.aim !== state;
    this.said.aim = state;
    if (!whole && !glanced && !turned) { return []; }
    const d = this.depth;
    if (followed) {
      return [TerminalColour.paint('gold', TerminalColour.bold(`Following: ${Typography.plain(followed.text)}`, d), d)];
    }
    const aim = AimSaid.of(screen, glanced);
    if (!aim) { return []; }
    const n = (screen.aims ?? []).findIndex(a => a.id === aim.offered) + 1;
    return [`${TerminalColour.bold(`An aim: ${Typography.plain(aim.text)}`, d)}${n ? this.o.picked ? ' · a to follow'
      : ` · follow ${n}` : ''}`];
  }
  // Who would join the company here, and what they would bring, as the page's talk says it (RecruitSaid): said when
  // it changes, and on a look.
  private recruits(screen: Screen, whole: boolean): string[] {
    const lines = (screen.people ?? [])
      .flatMap(p => p.recruit ? [RecruitSaid.line(p.name, p.recruit, screen.purse.coin)] : []);
    return this.fresh('recruit', lines.join('\n') || undefined, whole) ? lines : [];
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
