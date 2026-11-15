import type { PlaySession } from '../session/play-session';
import { Narrator } from '../presentation/narrator';
import { ScreenModel } from '../ui/screen-model';
import { Undertakings } from '../presentation/undertakings';

// Following an aim, as a player does it (the owner, 15 November: gold is only for an aim chosen), and whether the page
// then guides: with an aim followed, one of the acts the glance leads with is its next step (Promoted.continues). A
// step with an aim followed and no such act is unguided: a promise out of sight (counted; a baseline to hold).
export class Guidance {
  // The gold walker takes up the first aim held when none is followed.
  static follow(s: PlaySession): void {
    const c = s.campaign;
    if (Undertakings.followed(c)) { return; }
    const held = Undertakings.held(c)[0];
    if (held) { Undertakings.follow(c, held.id); }
  }
  // Whether the page guides now: true or false where an aim is followed, undefined where none is.
  static guided(s: PlaySession): boolean | undefined {
    const c = s.campaign;
    if (!Undertakings.followed(c)) { return undefined; }
    return !!Narrator.leaf(c, ScreenModel.build(c)).glance?.acts.some(a => a.continues);
  }
}
