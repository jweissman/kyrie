import { Installed } from '../ports/installed';
import type { ProseRule } from '../ports/presentation';

// The prose lint (doc/authoring/plain-prose.md; the owner, 17 November night: "a source-level prose linter for exact
// banned expressions, known bad constructions, repeated filler, and errors in generated substitutions"). Two readings:
// - of the words as written (`source`): the banned expressions and constructions of data/editorial/prose-lint.json,
//   each with the sentence that earned it, matched in any narrated string;
// - of the words as filled (`filled`): what a generated world or a played page actually says, read for the faults a
//   template only shows once its slots are filled: a slot left unfilled, a word said twice, "a" before a vowel or "an"
//   before a consonant, a sentence begun in lower case, a space before a stop.
// What it finds fails; what is only suspicious is the watchlist's (data/editorial/watchlist.json), for an editor.
export interface ProseFinding { rule: string; text: string; match: string }
export class ProseLint {
  private static readonly none: ProseRule[] = [];
  static get entries(): ProseRule[] { return Installed.current().presentation?.proseRules ?? this.none; }
  private static readonly cache = new WeakMap<ProseRule[], { e: ProseRule; re: RegExp }[]>();
  private static get compiled(): { e: ProseRule; re: RegExp }[] {
    const entries = this.entries;
    let compiled = this.cache.get(entries);
    if (!compiled) {
      compiled = entries.map(e => ({ e,
        re: e.pattern ? new RegExp(e.pattern, 'i') : new RegExp(`\\b${ProseLint.escape(e.phrase!)}\\b`, 'i') }));
      this.cache.set(entries, compiled);
    }
    return compiled;
  }
  static escape(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  // A banned expression or construction in a narrated string.
  static source(text: string): ProseFinding[] {
    return this.compiled.flatMap(({ e, re }) => {
      const m = re.exec(text);
      return m ? [{ rule: `banned: ${e.phrase ?? e.pattern}`, text, match: m[0] }] : [];
    });
  }
  // Words that are said twice on purpose ("had had", "that that") and a/an that go by sound, not letter.
  static readonly twice = new Set(['had', 'that', 'is', 'very', 'far', 'on', 'round', 'by', 'out', 'again', 'no',
    'knock', 'tap', 'drip', 'step', 'more', 'over', 'down', 'up', 'away', 'long', 'deep', 'slowly', 'twice', 'come',
    'go', 'now', 'yes', 'ha', 'so', 'there', 'in']);
  static readonly consonantSounding = /^(one|once|uni(?!n)|use|usu|ur[ai]|ure|eu|ewe|u[bcfkrst]?[aeiou]|you)/i;
  static readonly vowelSounding = /^(hour|honou?r|honest|heir)/i;
  // Faults that show only when a template is filled, and (unless told not to: an authored adventure's words are its
  // author's) the banned expressions.
  static filled(text: string, banned = true): ProseFinding[] {
    const out = [...this.slots(text), ...this.articles(text), ...this.stops(text)];
    return banned ? [...out, ...this.source(text)] : out;
  }
  private static slots(text: string): ProseFinding[] {
    return [...[...text.matchAll(/\{[A-Za-z_][\w.]*\}/g)].map(m => ({ rule: 'unfilled slot', text, match: m[0] })),
      ...[...text.matchAll(/\b([A-Za-z]+)\s+\1\b/gi)].filter(m => !this.twice.has(m[1]!.toLowerCase()))
        .map(m => ({ rule: 'word said twice', text, match: m[0] }))];
  }
  // "a" before a vowel's sound, "an" before a consonant's; a letter said by its name ("an X", "an M") and a
  // capitalised initialism go by sound.
  private static vowel(w: string): boolean {
    return (/^[aeiou]/i.test(w) && !this.consonantSounding.test(w)) || this.vowelSounding.test(w)
      || /^[A-Z]{2,}/.test(w) || /^[FHLMNRSX]$/.test(w);
  }
  private static articles(text: string): ProseFinding[] {
    return [...text.matchAll(/\b([Aa]n?) ([A-Za-z][\w-]*)/g)].flatMap(m => {
      const an = m[1]!.length === 2, word = m[2]!, initialism = /^[A-Z]{2,}/.test(word) || /^[A-Z]$/.test(word);
      if (an && !this.vowel(word)) { return [{ rule: 'an before a consonant', text, match: m[0] }]; }
      if (!an && this.vowel(word) && !initialism) { return [{ rule: 'a before a vowel', text, match: m[0] }]; }
      return [];
    });
  }
  // A sentence begun in lower case (not after a speaker's trailing off, "You... you won't", nor an initial, "B.Q. on
  // the lid"), and a space before a stop.
  private static stops(text: string): ProseFinding[] {
    return [...[...text.matchAll(/(?<!\.\.|\b[A-Z])(?:^|[.!?]\s+)([a-z]\w*)/g)]
      .map(m => ({ rule: 'lower case after a stop', text, match: m[0].trim() })),
    ...[...text.matchAll(/\w\s+[,.;:](?!\.)/g)].map(m => ({ rule: 'space before a stop', text, match: m[0] }))];
  }
}
