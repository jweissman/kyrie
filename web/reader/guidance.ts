import type { ReaderApp } from './reader-app';

// Whether the page shows which choice carries the followed aim on (the owner's play of 11 November). The fact that one
// does is the engine's (Promoted.continues); showing it is the page's. While the owner tests the whole path it is
// shown, in gold; ?guide=quiet is the game as a player would ordinarily meet it, where the aim's next step looks like
// any other promising thing to do, unless the company has a cleric, whose prayers show the way.
export class Guidance {
  static shown(app: ReaderApp): boolean {
    if (app.props?.query?.get('guide') !== 'quiet') { return true; }
    return (app.state.frame?.screen.party ?? []).some(m => m.calling === 'cleric');
  }
}
