import folk from '../data/generation/scenes/folk.json';

export class FantasyRules {
  private static readonly families = (folk as unknown as { family: Record<string, string[]> }).family;
  private static readonly given = (folk as unknown as { given: Record<string, Record<string, string[]>> }).given;
  static statMod(score: unknown): number {
    if (typeof score !== 'number' || !Number.isSafeInteger(score) || score < 1) {
      throw new Error('statMod expects a positive integer ability score');
    }
    // Orsino's Fighting.statMod: round((score − 10) / 2), with JavaScript's half-up rounding (9 → 0, 11 → +1).
    return Math.round((score - 10) / 2) || 0;
  }
  // The name of one of a story's people, apart from the names the country's folk have (two Caelynns on one quay:
  // PT-28): the name drawn, or, when one of the folk has it already, that name with a family's to it, as a town names
  // its own once its people's names have all been given (Communities.distinct). The family is chosen by who they are
  // (`by`: their part in the story), so two of a country's stories that draw one taken name do not give it one family.
  static apart(drawn: unknown, taken: unknown, ancestry: unknown, ...by: unknown[]): string {
    const name = String(drawn), had = new Set(Array.isArray(taken) ? taken.map(String) : []);
    if (!had.has(name)) { return name; }
    const families = FantasyRules.families[String(ancestry)] ?? FantasyRules.families.human!;
    let h = 2166136261;
    for (const ch of [name, ...by].join('|')) { h = Math.imul(h ^ ch.charCodeAt(0), 16777619); }
    const named = families.map((_, i) => `${name} ${families[((h >>> 0) + i) % families.length]!}`);
    return named.find(n => !had.has(n)) ?? named[0]!;
  }
  // One of the company's own family is called by a given name of their own, of their people and their sex, none of the
  // country's folk's: a mother come home to was Jassin Galanodel, at the inn where Jassin the charcoal-burner was
  // looking for work (play 10), a dwarf's mother Ulfgar, and an elf's mother and brother both Lia. Chosen by who they
  // are ("she:drover_wife": their pronoun and their part); failing one, apart.
  static another(drawn: unknown, taken: unknown, ancestry: unknown, who: unknown): string {
    const name = String(drawn), had = new Set(Array.isArray(taken) ? taken.map(String) : []);
    const [pronoun = 'she', part = ''] = String(who).split(':');
    const folk = FantasyRules.given[String(ancestry)] ?? FantasyRules.given.human!;
    const free = (folk[pronoun] ?? folk.she ?? []).filter(n => !had.has(n));
    let h = 2166136261;
    for (const ch of [name, part].join('|')) { h = Math.imul(h ^ ch.charCodeAt(0), 16777619); }
    return free.length ? free[(h >>> 0) % free.length]! : FantasyRules.apart(drawn, taken, ancestry, part);
  }
  static readonly functions = { statMod: FantasyRules.statMod, apart: FantasyRules.apart,
    another: FantasyRules.another };
}
