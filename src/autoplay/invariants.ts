import { CreatureSchema } from '../creature';
import { PlaySession } from '../session/play-session';
import { PlayerView } from '../presentation/player-view';
import type { CampaignEvent } from '../campaign/campaign';

export interface Violation { kind: 'creature' | 'softlock' | 'roundtrip' | 'party' | 'silent' | 'time'; message: string }

// What every step of play must keep true, whatever was chosen. Every creature is as the rules allow (the check a save
// is opened under, and the one "Invalid creature conditions" broke); a game still going offers something to do; the
// company's standing agrees with whether the game goes on; a game kept and opened again is the same game (its opening
// also checks every creature's facts against the world); and each command tells something, and takes the time the page
// said it would.
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
  // A command tells something: what was seen or heard, a reply, a change, or a fight. An offered action's result is
  // never empty (the register's COR-14).
  static told(event: CampaignEvent): Violation[] {
    const said = [...(event.perceptions ?? []).map(p => p.text), event.response ?? ''].join('').trim();
    return said || event.changes.length || event.combat.length ? []
      : [{ kind: 'silent', message: `${event.action} told nothing and changed nothing` }];
  }
  // What the page said a command would take, where it says (more than ten minutes), is what it took, unless something
  // cut it short or it came to a fight (COR-14: an action's costs are truthful).
  static time(said: number | undefined, spent: number, event: CampaignEvent): Violation[] {
    return said !== undefined && said > 10 && said !== spent && !event.cut && !event.combat.length
      ? [{ kind: 'time', message: `${event.action}: said ${said} minutes, took ${spent}` }] : [];
  }
  static roundtrip(s: PlaySession): Violation[] {
    try {
      return PlaySession.resume(s.checkpoint()).canonical() === s.canonical() ? []
        : [{ kind: 'roundtrip', message: 'kept and opened again, the game differs' }];
    } catch (error) { return [{ kind: 'roundtrip', message: `kept and opened again: ${(error as Error).message}` }]; }
  }
}
