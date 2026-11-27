import type { Call, Operator, Predicate } from '../lang/index';
import type { PlayerSnapshot } from '../presentation/player-view';

// How the company knows enough to ask it (the owner's play, 27 November, OR-1680: "Where did I get the information I
// needed to ask him these questions?"). A question about something in particular is offered only on grounds the
// company has (composition by contrast: something seen, read or heard, a deduction, a check), and its row says which,
// briefly: "from the brothers' letter", "Veyas told you", "seen for yourself". The ground is read from the topic's own
// condition, never declared by its author: what in it the company must know, or have been to; and how it came to know
// it, as the company's own knowledge holds it (the projection's: PlayerSnapshot.knowledge, never the world). A
// question anyone may put to anyone (what the matter is, news, where they are going) has no ground in its condition,
// and says none.
type Ground = { kind: 'knows' | 'been'; on: string };
type Seen = Pick<PlayerSnapshot, 'knowledge' | 'map'>;
interface Names { get(id: string): string | undefined }
export class TopicGrounds {
  // The relations a topic's condition grounds it on, in the order a ground is said: what is known first.
  static readonly kinds: readonly Ground['kind'][] = ['knows', 'been'];
  // The grounds a topic's condition asks of whoever puts it, positively: its knowing a fact, having been somewhere.
  // Read of the action as declared (actor) or as offered, bound to whoever puts it (who).
  static of(requires: Predicate, who = 'actor'): Ground[] {
    const out: Ground[] = [];
    this.walk(requires, false, who, out);
    return out.sort((a, b) => this.kinds.indexOf(a.kind) - this.kinds.indexOf(b.kind));
  }
  private static walk(p: Predicate, negated: boolean, who: string, out: Ground[]): void {
    if (p.kind === 'not') { this.walk(p.value, !negated, who, out); return; }
    if (p.kind === 'and' || p.kind === 'or') {
      this.walk(p.left, negated, who, out); this.walk(p.right, negated, who, out); return;
    }
    const ground = p.kind === 'call' && !negated ? this.ground(p, who) : undefined;
    if (ground) { out.push(ground); }
  }
  private static ground(c: Call, who: string): Ground | undefined {
    const kind = this.kinds.find(k => k === c.name), [a, b] = c.args;
    return kind && (a === 'actor' || a === who) && b && !b.startsWith('?') && b !== 'site' ? { kind, on: b } : undefined;
  }
  // The words for a topic's ground as the company now holds it, or none: a topic with no ground in its condition, or
  // one whose ground the company holds by no means it can name. Names: who and what the company knows by name; who:
  // the one who puts it.
  static said(seen: Seen, names: Names, who: string, action: Operator): string | undefined {
    if (!action.topic) { return undefined; }
    for (const g of this.of(action.requires, who)) {
      const words = g.kind === 'knows' ? this.known(seen, g.on) : this.been(seen, names, g.on);
      if (words) { return words; }
    }
    return undefined;
  }
  private static been(seen: Seen, names: Names, place: string): string | undefined {
    const name = seen.map.places.some(p => p.id === place && p.visited) ? this.short(names.get(place)) : undefined;
    return name && `been to ${name}`;
  }
  // Who or what by its first words only ("Veyas", not "Veyas, herb-wife at …").
  private static short(name?: string): string | undefined { return name?.split(', ')[0]; }
  // How a fact was come by, in a few words: from whom or what, or by the company's own eyes.
  private static known(seen: Seen, fact: string): string | undefined {
    const k = seen.knowledge.find(x => x.id === fact), by = this.short(k?.from);
    switch (k?.source) {
      case 'heard': return by ? `${by} told you` : 'heard said';
      case 'found': return by ? `from ${by}` : 'found for yourself';
      case 'read': return by ? `read in ${by}` : 'read for yourself';
      case 'seen': return 'seen for yourself';
      case 'did': return 'your own doing';
      default: return undefined;
    }
  }
}
