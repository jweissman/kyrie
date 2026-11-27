import type { Frame } from '../../src/creation/protocol';
import type { PlaySession } from '../../src/session/play-session';
import { Focusing } from '../../src/session/focus';
import { MenuTree } from '../../src/frame/menu-tree';
import { QuestionAsked } from '../../src/frame/question-asked';
import { SceneBudget } from '../../src/presentation/scene-budget';

// What the host answers to a command of the session's own, no act of the world (an aim followed, the focus), and the
// question asked of each frame it tells, from the session's focus (OR-1451, engine-focus.md §4). The frame last told is
// kept: a command of the focus alone (turning to someone, a page of the talk, the wares) is answered by it again, its
// question asked anew, nothing of the world built again for it (§5: a focus command rebuilds only the question).
export class EngineAside {
  private shown?: Frame;
  static focus(command: string): boolean { return Focusing.is(command); }
  // The frame with its menu (MenuTree) and the question asked of it, kept as the last told.
  asked(session: PlaySession, frame: Omit<Frame, 'menu'>): Frame {
    const framed = MenuTree.framed(frame);
    return this.shown = { ...framed, question: QuestionAsked.settle(session, framed) };
  }
  // The focus command done (and the game kept), and the frame last told told again; undefined where none has been.
  async again(session: PlaySession, command: string, keep: () => void): Promise<Frame | undefined> {
    await session.perform(command); keep();
    const was = this.shown;
    if (!was) { return undefined; }
    return this.shown = { ...was, question: QuestionAsked.settle(session, was), transcript: session.transcript };
  }
  forget() { this.shown = undefined; }
  // An aim followed, told in a line on the frame alone (EngineHost.perform); and, as any act done where the company
  // stands, the place it already said is held, not told again over it.
  static followed(frame: Frame, response?: string): Frame {
    const g = frame.leaf.glanced;
    return response ? { ...frame, leaf: { ...frame.leaf, ...g ? { glanced: SceneBudget.held(g) } : {},
      exchange: { lines: [{ kind: 'telling', text: response }], notes: [], tone: 'act' } } } : frame;
  }
}
