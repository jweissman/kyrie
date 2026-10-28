export class FantasyRules {
  static statMod(score: unknown): number {
    if (typeof score !== 'number' || !Number.isSafeInteger(score) || score < 1) {
      throw new Error('statMod expects a positive integer ability score');
    }
    // Orsino's Fighting.statMod: round((score − 10) / 2), with JavaScript's half-up rounding (9 → 0, 11 → +1).
    return Math.round((score - 10) / 2) || 0;
  }
  // Whether a list holds a value: what a story's people are drawn apart from (the names a town's folk have already).
  static among(list: unknown, value: unknown): boolean { return Array.isArray(list) && list.includes(value); }
  static readonly functions = { statMod: FantasyRules.statMod, among: FantasyRules.among };
}
