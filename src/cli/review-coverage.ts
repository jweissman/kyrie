// How much of a reviewed journey is known by its making (the adventure-structure brief §6.4, §15.14): of every line
// shown and of every choice offered, frame by frame, how many are exact, known only by their producer, or unknown, by
// lines and by words; the narration (prose) apart; and the unknown by their reasons, most first.
import type { Coverage, Exactness, Maker, ReviewFrame } from './review-types';

export class ReviewCoverage {
  static of(frames: readonly ReviewFrame[], makers: Readonly<Record<string, Maker>>): Coverage {
    const zero = ReviewCoverage.zero;
    const c: Coverage = { lines: zero(), words: zero(), prose: zero(), proseWords: zero(), choices: zero(),
      unknown: [] };
    const reasons = new Map<string, { lines: number; words: number }>();
    for (const f of frames) {
      for (const l of f.lines) {
        const words = ReviewCoverage.words(l.text);
        c.lines[l.exact]++; c.words[l.exact] += words;
        if (l.role === 'prose') { c.prose[l.exact]++; c.proseWords[l.exact] += words; }
        const why = l.sources.find(s => s.kind === 'unknown');
        if (why?.kind === 'unknown') {
          const reason = why.reason.startsWith('made ') ? 'made more than one way by its step\'s producers' : why.reason;
          const r = reasons.get(reason) ?? reasons.set(reason, { lines: 0, words: 0 }).get(reason)!;
          r.lines++; r.words += words;
        }
      }
      for (const o of f.offer) { c.choices[makers[o.id]?.exact ?? 'unknown']++; }
    }
    c.unknown = [...reasons.entries()].map(([reason, r]) => ({ reason, ...r })).sort((a, b) => b.words - a.words);
    return c;
  }
  private static zero(): Record<Exactness, number> { return { exact: 0, producer: 0, unknown: 0 }; }
  static words(text: string): number { return text.split(/\s+/).filter(Boolean).length; }
  // A share, as a whole percentage.
  static share(of: Record<Exactness, number>, k: Exactness): string {
    const all = of.exact + of.producer + of.unknown;
    return all ? `${Math.round(100 * of[k] / all)}%` : '–';
  }
}
