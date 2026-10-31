import { FictionalTime } from '../campaign/fictional-time';
import type { Mark } from '../presentation/glance-types';
import { ChoiceList, type Choice, type Section } from './choice-list';
import { Patience } from './patience';
import type { Act, ExitRow, Screen, TargetRow } from './screen-types';

// What a choice risks, said on it before it is chosen, wherever it is drawn (the glance, every way, More): a way with
// no coming back, what cannot be undone, a fight and how it would go, a trap, a risk on something not looked at
// closely, something heard in a way in, a bitter night in the open, someone who will not wait, a journey that ends
// after dark (the cold review's quick corrections: mark one-way, irreversible or danger-advancing choices before
// activation).
// Pure: read from the screen's own rows, by what each act is, never by its words.
interface Here {
  acts: Map<string, Act>; exits: ExitRow[]; threat?: TargetRow; screen: Screen;
  // What is done toward whoever warns the company off is no wait to them (see ChoiceList.marked).
  toward?: string;
}
export class Marks {
  static on(screen: Screen, sections: Section[]): Section[] {
    const here: Here = { acts: this.acts(screen), exits: screen.exits, screen,
      ...screen.warned?.id ? { toward: screen.warned.id } : {} };
    const threat = screen.people.find(p => Marks.threat(p));
    if (threat) { here.threat = threat; }
    return sections.map(s => ({ ...s, choices: s.choices.map(c => this.marked(c, s, here)) }));
  }
  private static marked(c: Choice, s: Section, here: Here): Choice {
    const marks = this.of(c, s, here);
    return { ...c, ...marks.length ? { marks } : {},
      ...c.children ? { children: c.children.map(k => this.marked(k, s, here)) } : {} };
  }
  // Every mark one choice carries, the gravest first.
  static of(c: Choice, s: Section, here: Here): Mark[] {
    const act = c.command ? here.acts.get(c.command) : undefined;
    const exit = s.tone === 'way' ? here.exits.find(e => c.id === e.id || c.id.startsWith(`${e.id}/`)) : undefined;
    const marks: Mark[] = [];
    if (exit?.oneWay && c.command) { marks.push({ kind: 'one-way', said: ChoiceList.oneWay, ask: true }); }
    const exposed = !!act?.until && !!c.grave;
    if (c.grave && !exposed && c.grave !== ChoiceList.oneWay) { marks.push({ kind: 'grave', said: c.grave, ask: true }); }
    if (exposed) { marks.push({ kind: 'exposed', said: c.grave! }); }
    const fight = this.fight(c, s, here, act);
    if (fight) { marks.push(fight); }
    // A risk is asked about before it is taken, as what cannot be undone is: a wrong word on a speaking door, chosen
    // for something else, had killed a company (the owner's play, 31 October).
    else if (c.risk && c.command) { marks.push({ kind: 'trap', said: exit?.hazard ?? 'It could go wrong.', ask: true }); }
    if (c.note?.split(' · ').includes(ChoiceList.unexamined)) {
      marks.push({ kind: 'unlooked', said: 'Not looked at closely yet.' });
    }
    if (exit && c.command && this.heard(exit)) { marks.push({ kind: 'heard', said: 'Something is in there.' }); }
    const warned = this.warned(c, s, here);
    if (warned) { marks.push(warned); }
    if (exit && c.command && (c.minutes ?? 0) > 10 && this.journey(here.screen.elapsed, c.minutes!)) {
      marks.push(this.dusk);
    }
    return marks;
  }
  // A fight it begins, as the company reckons it: an attack on someone it could fight, or a challenge taken up. It is
  // asked again only when it could be lost.
  private static fight(c: Choice, s: Section, here: Here, act?: Act): Mark | undefined {
    const row = here.screen.people.find(p => p.id === s.id);
    const reckoning = act?.reckoned ?? (row?.reckoning && c.label === 'Attack' ? row.reckoning : undefined);
    if (!reckoning || !c.command) { return undefined; }
    return { kind: 'fight', said: [ChoiceList.chances[reckoning.danger], reckoning.text].filter(Boolean).join(': '),
      ...['grave', 'deadly'].includes(reckoning.danger) ? { ask: true } : {} };
  }
  // A danger here: someone the company could fight who is not with it, nor down (as SceneModel.threat has it).
  static threat(this: void, row: TargetRow): boolean { return !!row.reckoning && !row.companion && !row.state; }
  // Something to be drawn out of the way in is something heard there (see ChoiceGrouping's draw_out).
  private static heard(exit: ExitRow): boolean {
    return this.leaves(exit.acts).some(a => a.command?.startsWith('draw_out('));
  }
  // Warned off, whatever would take the company past the minutes they will wait; and beside a danger, whatever the
  // company would do by itself and take its time over (waiting, camping, searching), which it will not be let do.
  private static warned(c: Choice, s: Section, here: Here): Mark | undefined {
    const warned = here.screen.warned;
    const toward = !!here.toward && new RegExp(`[(,]${here.toward}[,)]`).test(c.command ?? '');
    if (warned && c.command && !toward && (c.minutes ?? 0) >= warned.left) {
      return { kind: 'warned', said: Patience.note(warned.by) };
    }
    if (here.threat && s.tone === 'company' && c.command && (c.minutes ?? 0) >= 10) {
      return { kind: 'warned', said: `Not with ${ChoiceList.inline(here.threat.name.split(', ')[0]!)} here.` };
    }
    return undefined;
  }
  static readonly dusk: Mark = { kind: 'night', said: 'You would come there after dark.' };
  // Whether a journey set out on now would end after dark, or go on through the night: said before it is begun (the
  // play-structure investigation's PT-31: a journey arrived at night, though the way had been told with "go in
  // daylight"). The day's hours as the world keeps them (FictionalTime.night): the first morning begins at eight, and
  // it is dark from nine in the evening to six (a journey had kept night an hour early: the navigation review).
  static journey(elapsed: number, minutes: number): boolean {
    const start = elapsed * 10, end = start + minutes;
    return this.night(end) || this.dusks(start) !== this.dusks(end);
  }
  static night(minutes: number): boolean {
    const hour = (8 + Math.floor(minutes / 60)) % 24, { falls, lifts } = FictionalTime.night;
    return hour >= falls || hour < lifts;
  }
  // How many nightfalls since the first morning.
  private static dusks(minutes: number): number {
    return Math.floor((minutes / 60 + 8 - FictionalTime.night.falls) / 24);
  }
  // Each act on the screen by its command: the place's people and things, its ways, the company's own.
  private static acts(screen: Screen): Map<string, Act> {
    const all = [...screen.people, ...screen.things, ...screen.exits].flatMap(r => r.acts);
    return new Map(this.leaves([...all, ...screen.camp, ...screen.unplaced]).map(a => [a.command!, a]));
  }
  private static leaves(acts: Act[]): Act[] {
    return acts.flatMap(a => a.children?.length ? this.leaves(a.children) : a.command ? [a] : []);
  }
}
