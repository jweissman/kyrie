import type { Campaign, CampaignEvent } from '../campaign/campaign';
import type { Operator } from '../lang/index';
import type { TalkLine } from '../frame/talk-lines';

// What the company is attending to: the step the question is asked from (OR-1451, engine-focus.md §2). The place, or
// someone talked with (the page of their replies shown, and whether their wares are open). The session's own, never a
// world fact: no rule reads it and the Digest does not change with it. Examination, the map, the parts of a place and
// the sheets come in their own steps (OR-1452 to OR-1454); a fight, creation and the ending are derived, never set.
// At the place, the page of its rows shown past its four (the place's question, OR-1490), the first where none is said.
export type Focus = { kind: 'place'; page?: number } | { kind: 'talk'; with: string; page: number; trading: boolean };
// The conversation under way while the focus is talk: with whom, since when (the elapsed turn it opened at) and at
// what turn the last thing was done in it; its lines, the text the player saw (narration is durable); the commands put
// in it; heard, the commands that could be said before the last thing said (what is new since stands out); turned, the
// acts the place led with about them as they were turned to (those inside their talk, by command). untold: the step
// whose telling the next frame adds to the lines (opening: the turning itself, which they answer; exchange: whether an
// act of the world was done, whose exchange is told).
export interface Conversation {
  with: string; since: number; at: number; lines: TalkLine[]; asked: string[]; heard?: string[]; turned: string[];
  untold?: { opening: boolean; exchange: boolean; said?: string };
}
// The session's commands of focus, which change no world fact and take no watch, kept as steps of the transcript so
// that a replay reaches the same focus (as follow: is).
export type FocusCommand = { kind: 'place' } | { kind: 'talk'; with: string } | { kind: 'page'; page: number }
  | { kind: 'trade'; open: boolean };

export class Focusing {
  static readonly place: Focus = { kind: 'place' };
  static readonly prefix = 'focus:';
  // Ten-minute turns: past six hours, whatever was being said is over (as the page's conversation had held it).
  static readonly night = 36;
  static is(command: string): boolean { return command.startsWith(this.prefix); }
  static parse(command: string): FocusCommand | undefined {
    const [kind, arg] = command.slice(this.prefix.length).split(/:(.*)/s);
    if (kind === 'place') { return { kind: 'place' }; }
    if (kind === 'talk' && arg) { return { kind: 'talk', with: arg }; }
    if (kind === 'page' && /^\d+$/.test(arg ?? '')) { return { kind: 'page', page: Number(arg) }; }
    if (kind === 'trade' && (arg === 'on' || arg === 'off')) { return { kind: 'trade', open: arg === 'on' }; }
    return undefined;
  }
  // Whether an act offered now is someone's: spoken by them, or done with them (bound to them).
  static theirs(op: Operator | undefined, person: string): boolean {
    if (!op) { return false; }
    return op.speaker === person || Object.entries(op.bindings ?? {}).some(([k, v]) => v === person
      && !['actor', 'site'].includes(k));
  }
  // Whom an act of talk_to or take_leave is with, by the person it binds.
  static whom(op: Operator | undefined): string | undefined {
    return op?.bindings?.person ?? Object.entries(op?.bindings ?? {}).find(([k]) => !['actor', 'site'].includes(k))?.[1];
  }
  // Whether there is anything to be said to or done with someone here now: no act of theirs is offered once they have
  // gone.
  static there(campaign: Campaign, person: string): boolean {
    return campaign.offered().some(op => this.theirs(op, person));
  }
  // Where the company stands, as the world has it.
  static where(campaign: Campaign): string | undefined {
    return campaign.world.one('at', campaign.playerActor ?? 'party');
  }
  // The focus after an act of the world, by its kind (Choice.does: the act's schema, never its words): talking to
  // someone opens a conversation with them, or goes on with the one under way with them; taking leave, going anywhere,
  // a fight, the end, or the long silence closes it; an act that is the one talked with's goes on with it (asked); an
  // act done aside (from the pack, the company's page) returns to the place.
  static after(at: { focus: Focus; conversation?: Conversation; op?: Operator; command: string; event: CampaignEvent;
    moved: boolean; fought: boolean; campaign: Campaign; asked?: string; before: number; turned: string[];
    heard?: string[] }):
    { focus: Focus; conversation?: Conversation } {
    const { focus, conversation: was, op, event, campaign } = at, schema = op?.schema;
    const ended = at.moved || at.fought || !campaign.running || schema === 'take_leave';
    if (ended) { return { focus: this.place }; }
    if (schema === 'talk_to') {
      const person = this.whom(op);
      if (!person) { return { focus: this.place }; }
      const again = focus.kind === 'talk' && focus.with === person && was;
      return { focus: { kind: 'talk', with: person, page: 0, trading: false },
        conversation: again ? { ...was, at: event.elapsed, untold: { opening: false, exchange: true } }
          : { with: person, since: event.elapsed, at: event.elapsed, lines: [], asked: [], turned: at.turned,
            untold: { opening: true, exchange: true } } };
    }
    if (focus.kind !== 'talk' || !was || event.elapsed - at.before >= this.night || !this.theirs(op, focus.with)
      || !this.there(campaign, focus.with)) { return { focus: this.place }; }
    const asked = [...was.asked, at.asked ?? at.command];
    return { focus: { ...focus, page: 0 }, conversation: { ...was, at: event.elapsed, asked,
      ...at.heard ? { heard: at.heard } : {}, untold: { opening: false, exchange: true } } };
  }
  // The focus after a command of its own: turned to someone (no time), back to the place, a page of the talk, the
  // wares open or shut. A talk with someone not here, or a page or the wares outside a talk, is refused.
  static turned(at: { focus: Focus; conversation?: Conversation; command: FocusCommand; campaign: Campaign;
    turned: string[] }): { focus: Focus; conversation?: Conversation } {
    const { focus, command: c, campaign } = at;
    if (c.kind === 'place') { return { focus: this.place }; }
    if (c.kind === 'talk') {
      if (!this.there(campaign, c.with)) { throw new Error(`No one by ${c.with} is here to talk to`); }
      // Turned to again: on what is said to them, the first page.
      if (focus.kind === 'talk' && focus.with === c.with) {
        const kept = at.conversation ? { conversation: at.conversation } : {};
        return { focus: { ...focus, page: 0, trading: false }, ...kept };
      }
      const now = campaign.elapsed;
      return { focus: { kind: 'talk', with: c.with, page: 0, trading: false }, conversation: { with: c.with, since: now,
        at: now, lines: [], asked: [], turned: at.turned, untold: { opening: true, exchange: false } } };
    }
    // At the place, its next page of rows (the place's question: OR-1490); the first is its own (no page said).
    if (focus.kind === 'place' && c.kind === 'page') { return { focus: c.page ? { kind: 'place', page: c.page } : this.place }; }
    if (focus.kind !== 'talk') { throw new Error('Trade is turned to only in a talk'); }
    return { focus: c.kind === 'page' ? { ...focus, page: c.page } : { ...focus, trading: c.open, page: 0 },
      ...at.conversation ? { conversation: at.conversation } : {} };
  }
}
