import type { ExchangeLine } from './narrator';
import { Sentences } from './sentences';

// What of an act's telling a client says, and when (the first blind playtest, 14 November: "1 on the die, needing 11"
// beside a success the prose had already made plain; BP-03). The outcome is told in prose; the dice behind it (a
// check's or a save's roll) are kept for a deliberate look, never said with the outcome. One rule for both clients.
// And no more than three sentences of it at once (the owner, 17 November: "new descriptions/narrations should never
// cost more than 2-3 sentences in any case"; an act's telling had run to five and scrolled): the rest is held for the
// same deliberate look. A fight's blows are told by its own page and fold (see Moments), and count for nothing here.
export class ToldLines {
  static readonly sentences = 3;
  static said(lines: readonly ExchangeLine[], looked = false, room = ToldLines.sentences): ExchangeLine[] {
    if (looked) { return [...lines]; }
    const out: ExchangeLine[] = [];
    let left = room;
    for (const l of lines) {
      if (l.kind === 'roll') { continue; }
      if (l.kind === 'fight') { out.push(l); continue; }
      if (left <= 0) { continue; }
      const parts = Sentences.split(l.text), kept = parts.slice(0, left);
      out.push(kept.length === parts.length ? l : { ...l, text: kept.join(' ') });
      left -= kept.length;
    }
    return out;
  }
  // Whether a deliberate look would tell more than is said: the dice, or what the budget held back.
  static more(lines: readonly ExchangeLine[], room = ToldLines.sentences): boolean {
    const said = ToldLines.said(lines, false, room);
    return said.length !== lines.length || said.some((l, i) => l.text !== lines[i]!.text);
  }
}
