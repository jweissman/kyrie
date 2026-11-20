// The closure lint's reading of a closed row's what cell against its status (MT-19; mission-22/closure-review-
// method.md, patterns 1 and 3; scripts/closure-lint.ts counts what these find). Pattern 1, a many-part row closed on
// one part: each parenthesised cold-play reference in the what cell ("(19)", "(Q 69, 135)", "(R 80; S 33–37)") must
// be said again in the status, its every number, as an answer, a ruling or a move to another row would say it; and
// each "; " clause of the what cell must be met by the status in its own words (two of its words said there, or one
// of three or fewer: a status that answers a clause names what it answers). Pattern 3, a rule the driver may do for
// the player: a what cell that says something "must not" be, "must be held", "never more than", is closed on a spec
// with a negative assertion (`.not.`, toBe(false), nothing changed).
export class ClosureClauses {
  // A reference: a line number of a cold play or transcript, with its letter if it has one, or several of them.
  private static readonly ref = /\((?:[A-Z] )?\d{1,3}(?:[–-]\d{1,3})?(?:[,;] (?:[A-Z] )?\d{1,3}(?:[–-]\d{1,3})?)*\)/g;
  private static readonly common = new Set(['about', 'after', 'again', 'against', 'along', 'among', 'because',
    'before', 'being', 'between', 'could', 'every', 'first', 'having', 'other', 'their', 'there', 'these', 'thing',
    'things', 'those', 'through', 'under', 'until', 'where', 'which', 'while', 'without', 'would', 'still', 'never',
    'should', 'shows', 'since', 'something', 'someone', 'nothing', 'player', 'place', 'when', 'what', 'with']);
  static refs(what: string): string[] { return [...what.matchAll(this.ref)].map(m => m[0]); }
  // A reference is answered when each of its numbers is in the status, not as a line (:19) or a day (19 Nov).
  static answered(ref: string, status: string): boolean {
    return [...ref.matchAll(/\d{1,3}/g)].every(n => new RegExp(`(?<![\\d:.–-])${n[0]}(?![\\d:]| ?Nov)`).test(status));
  }
  // The what cell's "; " clauses, split where no bracket or quotation is open.
  static clauses(what: string): string[] {
    const out: string[] = [];
    let depth = 0, quoted = false, from = 0;
    for (let i = 0; i < what.length; i++) {
      const c = what[i]!;
      if (c === '(' || c === '[') { depth++; } else if ((c === ')' || c === ']') && depth > 0) { depth--; }
      else if (c === '"' || c === '“' || c === '”') { quoted = c === '“' ? true : c === '”' ? false : !quoted; }
      else if (c === ';' && what[i + 1] === ' ' && !depth && !quoted) { out.push(what.slice(from, i)); from = i + 2; }
    }
    return out.length ? [...out, what.slice(from)].map(s => s.trim()).filter(Boolean) : [];
  }
  // A clause's own words, by their first five letters: the long ones, not the common.
  static words(text: string): Set<string> {
    return new Set((text.toLowerCase().match(/[a-z][a-z']{4,}/g) ?? []).filter(w => !this.common.has(w))
      .map(w => w.slice(0, 5)));
  }
  static met(clause: string, status: string): boolean {
    const own = [...this.words(clause.replace(this.ref, ''))], said = this.words(status);
    if (!own.length) { return true; }
    return own.filter(w => said.has(w)).length >= (own.length <= 3 ? 1 : 2);
  }
  // What of the what cell the status leaves unanswered: its references, then its clauses.
  static unanswered(what: string, status: string): string[] {
    const refs = this.refs(what).filter(r => !this.answered(r, status)).map(r => `ref ${r}`);
    const clauses = this.clauses(what).filter(c => !this.met(c, status))
      .map(c => `clause "${c.length > 60 ? `${c.slice(0, 60)}…` : c}"`);
    return [...refs, ...clauses];
  }
  // A rule against: what must not be, what must be held.
  static forbids(what: string): boolean {
    return /\bmust (?:not|never|be held)\b|\bnever more than\b|\bis held to\b|\bheld, not (?:clicked|tapped)\b/i
      .test(what);
  }
  private static readonly denial = new RegExp(['\\.not\\.', 'toBe\\(false\\)', 'toBeFalse\\(\\)', 'toBeFalsy\\(\\)',
    'toBeUndefined\\(\\)', 'toBeNull\\(\\)', 'toHaveLength\\(0\\)', 'toBe\\(0\\)', 'toEqual\\(\\[\\]\\)',
    'toEqual\\(before\\b', 'toBe\\(before\\b', 'unchanged'].join('|'));
  // A negative assertion: a thing not so, false, none, or the same after as before.
  static negative(spec: string): boolean {
    return this.denial.test(spec);
  }
}
