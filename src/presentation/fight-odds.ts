// How sure the company can be of a fight's odds from the few it plays out (DangerSense), and how long each is let run.
// An easy win, on which a fight is pressed through as one act (Foregone, BP-01), is one whose lower confidence bound
// on winning is at least nine in ten: the Wilson bound, one-sided at nine in ten. Fifteen won of fifteen reaches it;
// six of six, which had been taken for it, does not (a fight won three times in four shows six of six one time in
// six). The fights are played on, to at most 24, until the bound settles either way. Each fight is let run to play's
// own limit of turns (Battle's 500): at the 150 it had been let run, a long fight ended a draw and was counted lost.
export class FightOdds {
  static readonly turns = 500;
  static readonly most = 24;
  static readonly bound = 0.9;
  // z for a one-sided bound at nine in ten.
  static readonly z = 1.2816;
  static lower(won: number, played: number): number { return played ? this.wilson(won, played, -1) : 0; }
  static upper(won: number, played: number): number { return played ? this.wilson(won, played, 1) : 1; }
  private static wilson(won: number, played: number, side: number): number {
    const p = won / played, z2 = this.z * this.z, n = played;
    const spread = this.z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n));
    return (p + z2 / (2 * n) + side * spread) / (1 + z2 / n);
  }
  static easy(won: number, played: number): boolean { return this.lower(won, played) >= this.bound; }
  // Whether more fights would settle it: neither sure of an easy win nor sure there is none, and not yet the most.
  static open(won: number, played: number): boolean {
    return played < this.most && !this.easy(won, played) && this.upper(won, played) >= this.bound;
  }
}
