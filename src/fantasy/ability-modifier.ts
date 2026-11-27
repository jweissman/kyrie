export class AbilityModifier {
  static of(score: unknown): number {
    if (typeof score !== 'number' || !Number.isSafeInteger(score) || score < 1) {
      throw new Error('statMod expects a positive integer ability score');
    }
    return Math.floor((score - 10) / 2);
  }
}
