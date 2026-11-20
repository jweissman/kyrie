import type { Predicate } from './module';

// A predicate the parser writes alike for every one of many ids (who a topic is put to, and where), parsed once with
// a stand-in where the id goes and the id put in its place: parsing it afresh for each of a country's thousand topics
// had been 1.4 s of a cold start's reading (OR-121). The id stands where an argument does, so what comes back is what
// parsing the text with the id written in gives (test/small/templated-predicates).
export class TemplatedPredicates {
  static readonly stand = 'kyr_stand_in';
  private static readonly parsed = new Map<string, Predicate>();
  // The template, written with `stand` where the id goes, and the id.
  static of(template: string, id: string, parse: (text: string) => Predicate): Predicate {
    let known = this.parsed.get(template);
    if (!known) {
      known = parse(template);
      if (this.parsed.size > 32) { this.parsed.clear(); }
      this.parsed.set(template, known);
    }
    return TemplatedPredicates.given(known, id) as Predicate;
  }
  // Who a topic may be put to: someone where they are, able and awake; or someone who has joined the company, wherever
  // it is, who is still themselves, so long as they can answer (not fallen, nor asleep). One "travelling" is put only
  // to someone in the company.
  static topic(who: string, travelling: boolean, parse: (text: string) => Predicate): Predicate {
    const s = TemplatedPredicates.stand;
    const along = `travelsWith(${s}, actor) and not (joinedAs(?m, ${s}) and not awake(?m))`;
    const text = travelling
      ? `able(actor) and distinct(actor, ${s}) and at(actor, site) and ${along}`
      : `able(actor) and distinct(actor, ${s}) and at(actor, site)`
        + ` and ((able(${s}) and not asleep(${s}) and at(${s}, site)) or (${along}))`;
    return TemplatedPredicates.of(text, who, parse);
  }
  private static given(value: unknown, id: string): unknown {
    if (value === TemplatedPredicates.stand) { return id; }
    if (Array.isArray(value)) { return value.map(v => TemplatedPredicates.given(v, id)); }
    if (!value || typeof value !== 'object') { return value; }
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, TemplatedPredicates.given(v, id)]));
  }
}
