import type { Campaign } from '../campaign/campaign';
import type { Act, Screen, TargetRow } from '../ui/screen-types';
import { FictionalTime } from '../campaign/fictional-time';
import { Typography } from './typography';

// What an opening told before the first place, by id: the place's telling then leaves it out (see Narrator.leaf).
export interface Opening { apart: ReadonlySet<string> }
// Whoever is met on the way in, as the opening sets them before the first place: who, their likeness, what is going on
// with them, and what can be done about it, each by the command that does it (see Prologue.meeting).
export interface Meeting { who: string; name: string; portrait?: TargetRow['portrait']; emblem?: string; text: string;
  choices: { label: string; command: string }[] }
// The opening as the page tells it: the chapter, and its beats in order; whoever is met on the road, if anyone; and
// what the company means to do first, said once, plainly.
// pages: what each page of it is (CN-09): a beat, and the first aim said after, are no act (the browser moves on by
// itself after a reading time, the terminal continues); the meeting is one act that matters, or several.
export interface Told { title: string; beats: string[]; meeting?: Meeting; aim?: string; pages?: Pages }
// What a page is to the player (the owner, 14 November: a page with one choice and no stakes had been drawn as a
// webapp button, "Go on" after the road meeting): no act at all, one act that matters, or several.
export type Page = 'none' | 'one' | 'several';
export interface Pages { beats: 'none'; meeting?: Exclude<Page, 'none'>; after: 'none' }

// A new game's opening, as a page tells it apart before the first place (the owner's OWN-17): the chapter the
// company's origin names, and a beat or two in the origin's own words for the first moment. First why the company
// came (the letter, the errand, what is owed); then the arrival, naming the town: the way in coming out of the trees,
// or for one who begins under a roof, the walk in to the shop or the shrine. Nothing is written for it: these are the
// lines the origin tells as the game opens. The place under it tells neither again (it had opened on the second beat
// word for word, shortened: the critique of the first opening), but what is there as the company comes: the life of
// the town on the way in, a trouble met there, the creditor at the counter. A campaign whose origin says nothing as it
// opens (an authored one) has no opening.
// On the way in, someone is met with something that wants deciding (the owner, 7 November: a decision on the road that
// reveals your character early): the origin's `meeting`, said near them (data/origins/prologue.kyrt), with every act
// of theirs that answers it, those its author named for them (their id's own prefix), wherever the page would show
// them, on them or on a thing of theirs. Then the first aim, plainly, once.
export class Prologue {
  static readonly arrival = 'origin__arrival';
  static readonly meetingId = 'origin__meeting';
  static of(campaign: Campaign, screen: Screen, title: string): { told: Told; opening: Opening } | undefined {
    const seen = new Map(screen.observed.map(o => [o.id, o.text]));
    // Why: the first of the origin's features where it begins, but the arrival (one over the hills may see the town's
    // trouble after it, which is the place's, happening as the company comes in) and the meeting on the road.
    const why = (campaign.module.observations ?? []).find(o => o.id.startsWith('origin__') && o.id !== this.arrival
      && o.id !== this.meetingId && o.aspect === 'feature' && o.anchor !== 'near' && seen.has(o.id));
    if (!why) { return undefined; }
    const way = seen.get(this.arrival), beats = [seen.get(why.id)!, ...way ? [way] : []]
      .map(t => this.said(t));
    const meeting = this.meeting(campaign, screen, seen), aim = screen.objectives[0];
    return { told: { title, beats, ...meeting ? { meeting } : {}, ...aim ? { aim: this.said(aim) } : {},
      pages: this.pages(meeting) },
      opening: { apart: new Set([why.id, ...way ? [this.arrival] : [], ...meeting ? [this.meetingId] : []]) } };
  }
  // What each page is: the beats and the aim after are read, not chosen; the meeting is chosen.
  static pages(meeting?: Meeting): Pages {
    return { beats: 'none', ...meeting ? { meeting: this.page(meeting.choices.length) as 'one' | 'several' } : {},
      after: 'none' };
  }
  // A page by how many acts it offers: none is no act, one is one act that matters, more is a choice among several.
  static page(acts: number): Page { return acts <= 0 ? 'none' : acts === 1 ? 'one' : 'several'; }
  // Whoever the meeting is said near, and what can be done about them now.
  private static meeting(campaign: Campaign, screen: Screen, seen: Map<string, string>): Meeting | undefined {
    const said = (campaign.module.observations ?? []).find(o => o.id === this.meetingId && seen.has(o.id));
    const who = said && screen.people.find(p => p.id === said.place);
    if (!said || !who) { return undefined; }
    const choices: Meeting['choices'] = [];
    for (const acts of [...[...screen.people, ...screen.things].map(r => r.acts), screen.unplaced]) {
      this.answers(acts, `${who.id}_`, choices);
    }
    if (!choices.length) { return undefined; }
    // In the order their author wrote them.
    const order = campaign.module.actions.map(a => a.id);
    choices.sort((a, b) => order.indexOf(this.id(a.command)) - order.indexOf(this.id(b.command)));
    return { who: who.id, name: who.name.split(', ')[0]!, text: this.said(seen.get(this.meetingId)!), choices,
      ...who.portrait ? { portrait: who.portrait } : {}, ...who.emblem ? { emblem: who.emblem } : {} };
  }
  // Of these acts (and those folded under them), each that answers the meeting: its author's, by the prefix of the
  // one met, and open now.
  private static answers(acts: Act[], own: string, into: Meeting['choices']) {
    for (const a of acts) {
      if (a.command && !a.disabled && a.does?.startsWith(own) && !into.some(c => c.command === a.command)) {
        into.push({ label: a.label, command: a.command });
      }
      this.answers(a.children ?? [], own, into);
    }
  }
  private static id(command: string): string { return command.replace(/\(.*$/, ''); }
  private static said(text: string): string { return Typography.curl(FictionalTime.prose(text)); }
  // The opening as the story keeps it, before anything done: under the chapter, its beats (the herb-wife's errand had
  // been told in the opening and then nowhere, the Story saying "Nothing has happened yet"). It stands apart from the
  // place it was told at, which the story heads by its own name when something is done there.
  static entry(told: Told, screen: Screen) {
    return { id: 0, at: screen.clock, elapsed: screen.elapsed, place: `${screen.place.id}${this.mark}`,
      placeName: told.title, lines: told.beats, notes: [], tone: 'note' as const, title: told.title };
  }
  // Whether a story's entry is its opening, and nothing done.
  static kept(entry: { place: string }): boolean { return entry.place.endsWith(this.mark); }
  private static readonly mark = '#opening';
}
