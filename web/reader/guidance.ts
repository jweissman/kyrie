import type { ReaderApp } from './reader-app';
import type { Promoted } from '../../src/presentation/glance-types';

// Whether the page shows which choice carries the followed aim on (the owner's play of 11 November). The fact that one
// does is the engine's (Promoted.continues); showing it is the page's. While the owner tests the whole path it is
// shown, in gold; ?guide=quiet is the game as a player would ordinarily meet it, where the aim's next step looks like
// any other promising thing to do, unless the company has a cleric, whose prayers show the way.
export class Guidance {
  static shown(app: ReaderApp): boolean {
    if (app.props?.query?.get('guide') !== 'quiet') { return true; }
    return (app.state.frame?.screen.party ?? []).some(m => /\bcleric\b/i.test(m.line));
  }
  // The continuation among the rest, where its place is fixed by where the company is and what it follows, not always
  // first: the first button is not always the right one.
  static placed(acts: Promoted[], urgent: number, key: string): Promoted[] {
    const next = acts.find(a => a.continues), rest = acts.filter(a => a !== next);
    if (!next || acts.indexOf(next) < urgent || rest.length <= urgent) { return acts; }
    const at = urgent + this.hash(key) % (rest.length - urgent + 1);
    return [...rest.slice(0, at), next, ...rest.slice(at)];
  }
  private static hash(key: string): number {
    let h = 2166136261;
    for (let i = 0; i < key.length; i++) { h = Math.imul(h ^ key.charCodeAt(i), 16777619); }
    return h >>> 0;
  }
}
