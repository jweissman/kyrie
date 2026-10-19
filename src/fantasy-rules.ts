export class FantasyRules {
  static statMod(score: unknown): number {
    if (typeof score !== 'number' || !Number.isSafeInteger(score) || score < 1) {
      throw new Error('statMod expects a positive integer ability score');
    }
    return Math.round((score - 10) / 3) || 0;
  }
  static readonly functions = { statMod: FantasyRules.statMod };
}
