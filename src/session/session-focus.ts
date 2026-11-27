import type { Campaign, CampaignEvent } from '../campaign/campaign';
import type { Frame } from '../creation/protocol';
import type { Question } from '../frame/talk-question';
import type { TalkLine } from '../frame/talk-lines';
import type { Operator } from '../lang/index';
import { Focusing, type Focus, type Conversation } from './focus';

// The session's focus and the conversation under way (OR-1451, engine-focus.md §2 and §3), kept by the session beside
// its steps: set by its own commands (focus:…) and by the kind of each act of the world. Each client tells it the
// frame it draws and the question asked of it (QuestionAsked.settle, src/frame): the conversation's lines are told from
// that frame's exchange, once a step, and the question is what was there to say before the next thing said.
export interface Focused { focus: Focus; conversation?: Conversation }
// An act about to be done, as the focus reads it after it (see ahead).
export interface Ahead { op?: Operator; at?: string; elapsed: number; heard?: string[] }
// The frame last told (its screen and glance) and the question asked of it.
export interface Told { screen: Frame['screen']; glance: Frame['leaf']['glance']; question: Question }
export class SessionFocus {
  private now: Focused = { focus: Focusing.place };
  // What was there when the company turned to someone, and the words of what was then said.
  private seen?: Told;
  constructor(kept?: Focused) { if (kept) { this.now = structuredClone(kept); } }
  get focus(): Focus { return this.now.focus; }
  get conversation(): Conversation | undefined { return this.now.conversation; }
  get kept(): Focused { return structuredClone(this.now); }
  get before(): Told | undefined { return this.seen; }
  // A command of its own (focus:…): no time, no world fact.
  command(command: string, campaign: Campaign): void {
    const parsed = Focusing.parse(command);
    if (!parsed) { throw new Error(`Unknown focus: ${command}`); }
    const turned = parsed.kind === 'talk' ? this.turned(parsed.with) : [];
    this.now = Focusing.turned({ ...this.now, command: parsed, campaign, turned });
  }
  // What the act about to be done is, as the focus reads it after: the act, where the company stands, how long since,
  // and (in a talk) what could be said to them as the question last asked had it.
  ahead(campaign: Campaign, id: string): Ahead {
    const heard = this.now.focus.kind === 'talk' ? this.seen?.question.talk?.rows.flatMap(r => r.command ?? [])
      : undefined;
    const op = campaign.operator(id) ?? campaign.offered().find(o => o.id === id);
    return { ...op ? { op } : {}, at: Focusing.where(campaign), elapsed: campaign.tickState.current.elapsed,
      ...heard ? { heard } : {} };
  }
  // After an act of the world: the focus its kind sets, and its words, for the lines. fought: whether a fight was
  // fought in it.
  after(campaign: Campaign, act: { command: string; event: CampaignEvent; ahead: Ahead; fought: boolean }): void {
    const { op, at, elapsed, heard } = act.ahead, moved = at !== Focusing.where(campaign);
    const person = op?.schema === 'talk_to' ? Focusing.whom(op) : undefined;
    const row = this.seen?.question.talk?.rows.find(r => r.command === act.command), said = row?.label;
    const next = Focusing.after({ ...this.now, ...op ? { op } : {}, command: act.command, event: act.event, moved,
      fought: act.fought, campaign, before: elapsed, turned: person ? this.turned(person) : [],
      ...row ? { asked: row.id } : {}, ...heard ? { heard } : {} });
    this.now = next.conversation?.untold && said
      ? { ...next, conversation: { ...next.conversation, untold: { ...next.conversation.untold, said } } } : next;
  }
  // The lines a frame told the step untold with, added to the conversation.
  told(lines: TalkLine[]): void {
    const c = this.now.conversation;
    if (!c) { return; }
    const rest = { ...c, lines: [...c.lines, ...lines] };
    delete rest.untold;
    this.now = { ...this.now, conversation: rest };
  }
  // The question asked of a frame told: kept as what was there; a talk whose subject is gone is over, here, once.
  asked(told: Told): void {
    if (told.question.focus.kind !== this.now.focus.kind) { this.now = { focus: told.question.focus }; }
    this.seen = told;
  }
  // What the place led with about someone as the company turned to them: the acts inside their talk, by command.
  private turned(person: string): string[] {
    return (this.seen?.glance?.acts ?? []).filter(a => a.subject === person)
      .flatMap(a => (a.inside ?? []).map(x => x.command));
  }
}
