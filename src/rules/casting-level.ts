// The level a caster casts at (proof-slices.md, step 3), in an ability's and an effect's context as #castingLevel,
// beside the encounter's #level: a creature of a calling casts at its level as it stands, after any drain (the
// fighter's own); a kind casting its own powers (one of no calling) casts at its source Hit Dice, which for an
// Orsino creature that grows are its level, and for a fixed stat block its block's (never the rank it is met at).
// One cap over it, cappedLevel(n): the casting level, to at most n (the SRD's 1d6 a caster level to 10d6 is
// roll(cappedLevel(10), 6)), written into the one expression language as min(#castingLevel, n) before it is read,
// so validation, the handbook and the fidelity report each read the same number. Its n is a whole number from 1.
export class CastingLevel {
  static readonly capped = /cappedLevel\(([^()]*)\)/g;
  static of(actor: { level: number; classId?: string }, hitDice: number): number {
    return actor.classId ? actor.level : hitDice;
  }
  // An expression with each cap written out.
  static expand(text: string): string {
    return text.includes('cappedLevel') ? text.replace(this.capped, 'min(#castingLevel, $1)') : text;
  }
  // What is wrong with an expression's caps: each a whole number from 1.
  static problems(text: string): string[] {
    return [...text.matchAll(this.capped)].filter(([, n]) => !/^\s*[1-9]\d*\s*$/.test(n!))
      .map(([whole]) => `${whole}: a cap is a whole number from 1`);
  }
}
