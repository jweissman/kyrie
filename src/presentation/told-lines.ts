import type { ExchangeLine } from './narrator';
import { Sentences } from './sentences';

// What of an act's telling a client says, and when (the first blind playtest, 14 November: "1 on the die, needing 11"
// beside a success the prose had already made plain; BP-03). The outcome is told in prose; the dice behind it (a
// check's or a save's roll) are kept for a deliberate look, never said with the outcome. One rule for both clients.
// And no more than three sentences of it at once (the owner, 17 November: "new descriptions/narrations should never
// cost more than 2-3 sentences in any case"; an act's telling had run to five and scrolled): what came of it (an event,
// a change, a revelation: the key taken, the aim seen through) is always said, and counts first; what is said and
// described around it fills what room is left, its first sentence at least, the rest whole in the Book's Story. A
// fight's blows are told by its own page and fold (see Moments), and count for nothing here.
export class ToldLines {
  static readonly sentences = 3;
  // Said whole: what came of it, what someone says (a warning to a lone mage, OR-64, is no description to cut), and a
  // fight's blows. What the budget trims is description: the telling, an opening's lines.
  static readonly kept: readonly ExchangeLine['kind'][] = ['event', 'change', 'revelation', 'fight', 'speech'];
  static said(lines: readonly ExchangeLine[], looked = false, room = ToldLines.sentences): ExchangeLine[] {
    if (looked) { return [...lines]; }
    const shown = lines.filter(l => l.kind !== 'roll');
    const counted = shown.filter(l => l.kind !== 'fight' && l.kind !== 'speech' && ToldLines.kept.includes(l.kind))
      .reduce((n, l) => n + Sentences.split(l.text).length, 0);
    let left = Math.max(1, room - counted);
    return shown.flatMap(l => {
      if (ToldLines.kept.includes(l.kind)) { return [l]; }
      if (left <= 0) { return []; }
      const parts = Sentences.split(l.text), kept = parts.slice(0, left);
      left -= kept.length;
      return [kept.length === parts.length ? l : { ...l, text: kept.join(' ') }];
    });
  }
  // Whether a deliberate look would tell more than is said: the dice, or what the budget held back.
  static more(lines: readonly ExchangeLine[], room = ToldLines.sentences): boolean {
    const said = ToldLines.said(lines, false, room);
    return said.length !== lines.length || said.some((l, i) => l.text !== lines[i]!.text);
  }
}
