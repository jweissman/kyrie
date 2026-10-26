import { CreatureSchema } from '../creature';
import { PlaySession } from '../session/play-session';
import { PlayerView } from '../presentation/player-view';

export interface Violation { kind: 'creature' | 'softlock' | 'roundtrip' | 'party'; message: string }

// What every step of play must keep true, whatever was chosen. Every creature is as the rules allow (the check a save
// is opened under, and the one "Invalid creature conditions" broke); a game still going offers something to do; the
// company's standing agrees with whether the game goes on; and a game kept and opened again is the same game (its
// opening also checks every creature's facts against the world).
export class Invariants {
  static creatures(s: PlaySession): Violation[] {
    const out: Violation[] = [];
    for (const c of s.campaign.readout.creatures) {
      try { CreatureSchema.validate(structuredClone(c)); } catch (error) {
        out.push({ kind: 'creature', message: `${c.id}: ${(error as Error).message}` });
      }
    }
    return out;
  }
  static offered(s: PlaySession): Violation[] {
    const c = s.campaign;
    return c.running && !PlayerView.choices(c).length
      ? [{ kind: 'softlock', message: `nothing offered at ${c.world.one('at', c.playerActor!)}` }] : [];
  }
  // A company with someone standing is not told it has fallen, and one with no one standing does not go on.
  static party(s: PlaySession): Violation[] {
    const r = s.campaign.readout, standing = r.creatures.some(c => r.partyIds.includes(c.id) && c.state.hp > 0);
    return !standing && s.campaign.running ? [{ kind: 'party', message: 'no one standing, and the game goes on' }] : [];
  }
  static roundtrip(s: PlaySession): Violation[] {
    try {
      return PlaySession.resume(s.checkpoint()).canonical() === s.canonical() ? []
        : [{ kind: 'roundtrip', message: 'kept and opened again, the game differs' }];
    } catch (error) { return [{ kind: 'roundtrip', message: `kept and opened again: ${(error as Error).message}` }]; }
  }
}
