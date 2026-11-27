import type { Choice } from '../../src/ui/choice-list';
import type { Attention } from '../../src/ui/attention';
import type { Frame } from '../../src/creation/protocol';
import { Conversation, type TalkLine } from './conversation';

// Whom the page attends to, and what its conversation holds: the person or thing, the talk's lines, what has been
// asked in it, what could be said before the last thing said, and whether the wares are open (OR-1450). Worked out
// here, of the page's state and the frames, as a pure step, so that a spec drives the page's own step machine headless
// beside the terminal's and the runner's (test/support/three-clients); ReaderApp keeps what this says. Engine-owned
// focus (doc/architecture/mission-22-beta/engine-focus.md, OR-1451 onward) moves it into the session.
export interface Talked { attention: Attention; talk: TalkLine[]; asked: string[]; heard?: string[]; trading?: boolean }
export class PageFocus {
  // Turned to someone, to a thing, or back, before anything is done: a conversation opens on what they were doing when
  // the company came over (says).
  static turned(state: Talked, attention: Attention, says?: string): Talked {
    return { ...state, attention, asked: [],
      talk: attention.kind !== 'person' ? state.talk : says ? [{ kind: 'telling', text: says }] : [] };
  }
  // After a command done in it: still with them while they are there (Conversation.holds), what was said and came of it
  // added; asked, what was chosen in the talk; heard, the replies on offer before it (replies), while the company was
  // talking with someone already; the wares open still only with the same person. aside: done from the pack or the
  // company page, not said in a conversation.
  static after(state: Talked, at: { choice: Choice; said: string; turning?: Attention; aside: boolean; frame: Frame;
    next: Frame; replies?: string[] }): Talked {
    const { choice, said, turning, frame, next } = at, was = state.attention;
    const attention = at.aside ? Conversation.place : Conversation.holds(turning ?? was, frame, next);
    const person = attention.kind === 'person';
    return { attention, talk: person ? [...state.talk, ...Conversation.lines(next, choice, said, state.talk)] : [],
      asked: person && !turning ? [...state.asked, choice.id] : [],
      ...person && was.kind === 'person' ? { heard: at.replies } : {},
      ...person && was.kind === 'person' && was.id === attention.id && state.trading ? { trading: true } : {} };
  }
}
