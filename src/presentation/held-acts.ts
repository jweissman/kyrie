import { Marks } from '../ui/marks';
import type { Screen } from '../ui/screen-types';
import { AimSaid } from './aim-said';
import { Engaged } from './engaged';
import type { Promoted } from './glance-types';

// The journey held by the host (see EngineHost.bound), and whether the game was just taken up again.
export interface Host { bound?: { id: string; name: string; minutes: number }; resumed?: boolean; elapsed?: number }

// The acts the host leads the glance with: the journey set out on, and the aim to follow.
export class HeldActs {
  static of(host: Host): { bound?: Promoted } {
    const bound = host.bound && { choice: `travel:${host.bound.id}`, command: `travel:${host.bound.id}`,
      label: `Go on to ${host.bound.name}`, why: 'bound' as const, facets: ['here' as const, 'aimed' as const],
      tier: 1 as const, aspects: ['undertaking' as const], note: 'where you set out for',
      marks: Marks.journey(host.elapsed ?? 0, host.bound.minutes) ? [Marks.dusk] : [] };
    return { bound };
  }
  // The aim to follow is one more act beside the world's, never in place of one (the terminal leads with them).
  static with(acts: Promoted[], pull?: Promoted): Promoted[] {
    // After what is urgent (tier 0: a danger, an answer), never before it.
    const at = acts.findIndex(a => a.tier > 0), i = at < 0 ? acts.length : at;
    return pull ? [...acts.slice(0, i), pull, ...acts.slice(i)] : acts;
  }
  // An aim held and none followed, offered to be followed, as any act is (the owner, 15 November: one action grammar,
  // no stray buttons): the glance's own act, so that every client is offered it and does it the same way (the
  // session's `follow:<aim>`).
  // None while the company is engaged: it resolves what is in front of it first (OR-163: Engaged).
  static follow(screen: Pick<Screen, 'aims' | 'warned'>): Promoted | undefined {
    const aims = screen.aims ?? [], pull = aims.find(a => a.own) ?? aims[0];
    if (!pull || aims.some(a => a.followed) || Engaged.threat(screen)) { return undefined; }
    const choice = `follow:${pull.id}`;
    // Said by the aim's own words, no prefix (OR-72: "Follow: Look along the road between Mistshaw" read as following a
    // road); what it is, a decision and not an act in the world, is its note.
    return { choice, command: choice, label: AimSaid.short(pull.text), why: 'held', aim: pull.id, facets: ['here'], tier: 1,
      aspects: [], note: 'take it up as your aim', marks: [] };
  }
}
