import type { Frame } from '../creation/protocol';
import type { PlaySession } from '../session/play-session';
import type { Choice } from '../ui/choice-list';
import { SceneModel } from '../ui/scene';
import { MenuTree } from './menu-tree';
import { TalkLines, type TalkLine } from './talk-lines';
import type { Question } from './talk-question';

// The question asked of a frame a client tells (its screen and its leaf), from the session's focus (OR-1451): the
// conversation's lines told from it first, once for each step (what they were doing as the company came over, what was
// said and what came of it), then the question (MenuTree.question), which the session keeps as what was there to say.
// Every client tells its frames by this one way: the page's host, the terminal and the runner.
export class QuestionAsked {
  static settle(session: PlaySession, frame: Pick<Frame, 'screen' | 'leaf'>): Question {
    const c = session.conversation, untold = c?.untold;
    if (c && untold) {
      const says = untold.opening ? SceneModel.build(session.told?.screen ?? frame.screen).subjects
        .find(s => s.id === c.with)?.says?.[0] : undefined;
      const choice = { id: untold.opening ? `${c.with}#talk` : '', label: untold.said ?? '', tone: 'person' } as Choice;
      session.tell([...says ? [{ kind: 'telling' as const, text: says }] : [], ...untold.exchange
        ? TalkLines.lines(frame as Frame, choice, untold.said ?? '', c.lines).filter(l => this.said(l)) : []]);
    }
    const question = MenuTree.question(frame, session.focus, session.conversation);
    session.questioned({ screen: frame.screen, glance: frame.leaf.glance, question });
    return question;
  }
  // A line with words (the company's own, where nothing was said by it, is none).
  private static said(l: TalkLine): boolean { return l.kind !== 'you' || !!l.text; }
}
