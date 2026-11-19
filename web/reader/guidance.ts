import type { ReaderApp } from './reader-app';
import type { Promoted } from '../../src/presentation/glance-types';

// Whether the page shows which choice carries the followed aim on (the owner's play of 11 November). The fact that one
// does is the engine's (Promoted.continues); showing it is the page's. While the owner tests the whole path it is
// shown, in gold; ?guide=quiet is the game as a player would ordinarily meet it, where the aim's next step looks like
// any other promising thing to do, unless the company has a cleric, whose prayers show the way.
export class Guidance {
  static shown(app: ReaderApp): boolean {
    if (app.props?.query?.get('guide') !== 'quiet') { return true; }
    return (app.state.frame?.screen.party ?? []).some(m => m.calling === 'cleric');
  }
  // The continuation first, ahead of what will not wait (the owner, 18 November: "If a golden option exists, it should
  // be first"; it had been set among the rest by a hash of the place, so that the first button was not always the right
  // one). The engine orders it so (Promotion.continued); kept here for the page's order and the keys' to agree.
  static placed(acts: Promoted[], _urgent: number, _key: string): Promoted[] {
    const next = acts.find(a => a.continues);
    return next ? [next, ...acts.filter(a => a !== next)] : acts;
  }
}
