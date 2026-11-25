// One command, from resolved to committed (MT-24, command-receipt.md's second step): the phases it went through, in
// order, and the receipt written once at its end, or its being undone. The session runs it (PlaySession.perform):
// resolved (the choice found offered), executed (the campaign carried it out), expanded (what came of it drawn: the
// country beyond), told (what is said of it), settled (the aims after it), and committed (its step kept, its receipt
// written); or undone, at whichever phase failed, nothing of it kept. The order is enforced, not only recorded (the
// external review of 25 November: a phase skipped, repeated or reached after the end had been accepted silently):
// each phase after the one before it, undone from any not yet ended, nothing after either end, one receipt.
export type Phase = 'resolved' | 'executed' | 'expanded' | 'told' | 'settled' | 'committed' | 'undone';
// What a command came to, written once as it is committed: the command as sent, the revision it moved the game to
// (the steps kept: a transcript replays to it), and its outcome, or undone if it failed.
export interface Receipt { id: string; revision: number; outcome: 'success' | 'failure' | 'undone' }
export class OpenCommand {
  // The phases each may follow: expanded only where something is drawn beyond (else told follows executed), and an aim
  // followed (follow:) is committed as it is resolved.
  private static readonly after: Record<Phase, readonly Phase[]> = {
    resolved: [], executed: ['resolved'], expanded: ['executed'], told: ['executed', 'expanded'], settled: ['told'],
    committed: ['settled', 'resolved'], undone: ['resolved', 'executed', 'expanded', 'told', 'settled'],
  };
  readonly phases: Phase[] = ['resolved'];
  constructor(readonly id: string) {}
  get phase(): Phase { return this.phases.at(-1)!; }
  // Ended, committed or undone: nothing more happens to it.
  get ended(): boolean { return this.phase === 'committed' || this.phase === 'undone'; }
  reach(phase: Phase): void {
    if (!OpenCommand.after[phase].includes(this.phase)) {
      throw new Error(`Command ${this.id}: ${phase} cannot follow ${this.phase} (${this.phases.join(' → ')})`);
    }
    this.phases.push(phase);
  }
  // Its receipt, once, as it ends: the revision its step moves the game to, and what came of it.
  receipt(revision: number, outcome: Receipt['outcome']): Receipt {
    this.reach(outcome === 'undone' ? 'undone' : 'committed');
    return { id: this.id, revision, outcome };
  }
}
