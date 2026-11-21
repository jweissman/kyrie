// One command, from resolved to committed (MT-24, command-receipt.md's second step): the phases it went through, in
// order, and the receipt written once at its end, or its being undone. The session runs it (PlaySession.perform):
// resolved (the choice found offered), executed (the campaign carried it out), expanded (what came of it drawn: the
// country beyond), told (what is said of it), settled (the aims after it), and committed (its step kept, its receipt
// written); or undone, at whichever phase failed, nothing of it kept.
export type Phase = 'resolved' | 'executed' | 'expanded' | 'told' | 'settled' | 'committed' | 'undone';
// What a command came to, written once as it is committed: the command as sent, the revision it moved the game to
// (the steps kept: a transcript replays to it), and its outcome, or undone if it failed.
export interface Receipt { id: string; revision: number; outcome: 'success' | 'failure' | 'undone' }
export class OpenCommand {
  readonly phases: Phase[] = ['resolved'];
  constructor(readonly id: string) {}
  reach(phase: Phase): void { this.phases.push(phase); }
  // Its receipt: the revision its step moves the game to, and what came of it.
  receipt(revision: number, outcome: Receipt['outcome']): Receipt {
    this.reach(outcome === 'undone' ? 'undone' : 'committed');
    return { id: this.id, revision, outcome };
  }
}
