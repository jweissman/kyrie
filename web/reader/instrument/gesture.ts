// One press on one row, from the hand or the key going down to its act done or let go (Mission 21's first touch,
// doc/architecture/mission-21/first-touch.md). It decides only when a press commits, never what it does: the act is
// still the engine's, sent once by whatever the row already does when it is clicked. Pure, so that what it promises is
// held by a spec in microseconds (test/small/touch-gesture):
// - a press commits once at most: a second down, a key's repeats, or a release after it commits nothing more;
// - an act that is held (a grave act, setting out) commits only when the hold is full; let go before, nothing is done;
//   a short tap on it asks (as a grave act asked before: chosen again, it is done), the accessible way to the same act;
// - focus is not an input here at all: nothing a hand or a key does without pressing reaches a gesture.
// down: the press commits as it goes down (a game's button), except a touch, which commits on release so that a
//   finger may still scroll; up: it commits on release over the row, and slid off before release it is let go.
export type Commit = 'down' | 'up';
export type Source = 'mouse' | 'pen' | 'touch' | 'key';
export type Step = { kind: 'down'; at: number; source: Source; repeat?: boolean }
  | { kind: 'up'; at: number; inside: boolean } | { kind: 'cancel'; at: number } | { kind: 'time'; at: number };
// struck: shown taken at once; commit: done; ask: a tap on a held act (said, not done); holding: the ring begins;
// let-go: a hold given up (nothing done); released: a press slid off or cancelled (nothing done).
export type Said = 'struck' | 'commit' | 'ask' | 'holding' | 'let-go' | 'released';
type State = 'idle' | 'pressed' | 'holding' | 'spent';

export class Gesture {
  // A press on a held act shorter than this is a tap, which asks; longer and let go, it is a hold given up.
  static readonly tap = 260;
  private state: State = 'idle';
  private began = 0;
  constructor(readonly commit: Commit, readonly hold = 0) {}
  get done(): boolean { return this.state === 'spent'; }
  get busy(): boolean { return this.state === 'pressed' || this.state === 'holding'; }
  // How far a hold has got, from 0 to 1, at a moment.
  progress(at: number): number { return this.state === 'holding' && this.hold ? Math.min(1, (at - this.began) / this.hold) : 0; }
  feed(step: Step): Said[] {
    if (this.state === 'spent') { return []; }
    if (step.kind === 'down') { return this.down(step); }
    if (step.kind === 'time') { return this.state === 'holding' && step.at - this.began >= this.hold ? this.spend() : []; }
    if (this.state === 'holding') { return this.letGo(step); }
    if (this.state !== 'pressed') { return []; }
    if (step.kind === 'up' && step.inside) { return this.spend(); }
    this.state = 'idle';
    return ['released'];
  }
  private down(step: Extract<Step, { kind: 'down' }>): Said[] {
    if (step.repeat || this.state !== 'idle') { return []; }
    this.began = step.at;
    if (this.hold > 0) { this.state = 'holding'; return ['holding']; }
    if (this.commit === 'down' && step.source !== 'touch') { this.state = 'spent'; return ['struck', 'commit']; }
    this.state = 'pressed';
    return ['struck'];
  }
  private letGo(step: Step): Said[] {
    this.state = 'idle';
    return step.kind === 'up' && step.inside && step.at - this.began < Gesture.tap ? ['ask'] : ['let-go'];
  }
  private spend(): Said[] { this.state = 'spent'; return ['commit']; }
}
