export class FantasyRules {
  static statMod(score: unknown): number {
    if (typeof score !== 'number' || !Number.isSafeInteger(score) || score < 1) {
      throw new Error('statMod expects a positive integer ability score');
    }
    // Orsino's Fighting.statMod: round((score − 10) / 2), with JavaScript's half-up rounding (9 → 0, 11 → +1).
    return Math.round((score - 10) / 2) || 0;
  }
  static readonly functions = { statMod: FantasyRules.statMod };
}
