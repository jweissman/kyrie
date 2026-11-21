import type { PlaySession } from '../../src/session/play-session';
import { DangerSense } from '../../src/presentation/danger-sense';
import { Outmatched } from '../../src/presentation/outmatched';

// The danger of the fights an act here could lead to, reckoned while the player reads (OR-145 (b), the owner's 1.5 s
// two acts in: "Ask Eamon about the king-barrow" gave an aim whose giver warned of its band, and the warning played
// the band's fights before the answer): one fight a turn of the host's loop, each a few tens of milliseconds, so that
// an input that comes meanwhile is answered next (stop), and the act that needs a verdict reads it kept. Deterministic:
// the same fights, keyed and in their order (DangerSense.advance), whenever they are played; what is told is the same
// whether they were reckoned ahead or at the act.
export class DangerAhead {
  private turn = 0;
  // Settled when nothing is left to reckon, or when stopped (for a driver that waits as a player reads).
  done: Promise<void> = Promise.resolve();
  start(session: PlaySession | undefined): void {
    const turn = ++this.turn;
    if (!session) { return; }
    const bands = Outmatched.ahead(session.campaign);
    this.done = new Promise(resolve => { setTimeout(() => { this.step(turn, session, bands, resolve); }, 0); });
  }
  stop(): void { this.turn++; }
  private step(turn: number, session: PlaySession, bands: string[], resolve: () => void): void {
    if (turn !== this.turn || session.acting) { resolve(); return; }
    const open = bands.find(b => DangerSense.advance(session.campaign, b) === undefined);
    if (!open) { resolve(); return; }
    setTimeout(() => { this.step(turn, session, bands, resolve); }, 0);
  }
}
