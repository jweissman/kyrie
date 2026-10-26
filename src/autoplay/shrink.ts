import { PlaySession, type TranscriptStep } from '../session/play-session';
import { PlayerView } from '../presentation/player-view';
import { Travel } from '../session/travel';
import { AutoplayRun, type RunSpec, type Failure } from './run';
import { Invariants } from './invariants';
import { Following } from './following';
import type { Move } from './player';

// A failure found after hundreds of commands, made small. The commands before it are played again from the start in
// a world drawn again, leaving out as many as can be left out while the same failure still comes (delta debugging),
// so what is left is the few that make it.
export class Shrinker {
  // The fewest of these items that still fail, by removing ever smaller runs of them.
  static async minimize<T>(items: T[], fails: (kept: T[]) => Promise<boolean>, budget = 400): Promise<T[]> {
    let kept = items, parts = 2, tries = 0;
    while (kept.length > 1 && tries < budget) {
      const size = Math.ceil(kept.length / parts);
      let smaller: T[] | undefined;
      for (let i = 0; i < kept.length && !smaller && tries < budget; i += size) {
        const without = [...kept.slice(0, i), ...kept.slice(i + size)];
        tries++;
        if (await fails(without)) { smaller = without; }
      }
      if (smaller) { kept = smaller; parts = Math.max(parts - 1, 2); continue; }
      if (parts >= kept.length) { break; }
      parts = Math.min(parts * 2, kept.length);
    }
    return kept;
  }
  // The failure's commands made few: the same kind of failure, saying the same.
  static async shrink(spec: RunSpec, steps: TranscriptStep[], failure: Failure, budget = 400):
    Promise<TranscriptStep[]> {
    return this.minimize(steps, async kept => this.same(await this.replay(spec, kept, failure.move), failure.message),
      budget);
  }
  static same(message: string | undefined, failed: string): boolean {
    return !!message && this.signature(message) === this.signature(failed);
  }
  static signature(message: string): string { return message.split('\n')[0]!.replace(/\d+/g, '#').slice(0, 120); }
  // Played again, forgiving what no longer fits: a command not offered now is passed over, and a fight's recorded
  // choices are followed while they are legal. Then the move that failed; what went wrong, if anything did.
  static async replay(spec: RunSpec, steps: TranscriptStep[], last?: Move): Promise<string | undefined> {
    const s = await AutoplayRun.start(spec);
    try {
      for (const step of steps) {
        if (!s.campaign.running) { break; }
        if (!PlayerView.choices(s.campaign).some(c => c.choice.id === step.command)) { continue; }
        await s.perform(step.command, new Following(step.combat ?? []).next);
      }
      if (last && s.campaign.running) { await this.move(s, last); }
    } catch (error) { return (error as Error).message; }
    return [...Invariants.creatures(s), ...Invariants.offered(s), ...Invariants.party(s)][0]?.message;
  }
  private static performing(s: PlaySession, command: string) { return s.perform(command); }
  private static async move(s: PlaySession, move: Move) {
    if (move.kind === 'travel') {
      await Travel.go({ campaign: s.campaign, perform: this.performing.bind(this, s) }, move.to);
    } else if (PlayerView.choices(s.campaign).some(c => c.choice.id === move.id)) { await s.perform(move.id); }
  }
}
