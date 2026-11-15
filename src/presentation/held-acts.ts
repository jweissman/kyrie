import { Marks } from '../ui/marks';
import type { Promoted } from './glance-types';

// The journey held by the host (see EngineHost.bound), whether the game was just taken up again, and an aim held with
// none followed, offered to be followed as any act is (the owner, 15 November: one action grammar, no stray buttons).
export interface Host { bound?: { id: string; name: string; minutes: number }; resumed?: boolean; elapsed?: number;
  follow?: { id: string; label: string } }

// The acts the host leads the glance with: the journey set out on, and the aim to follow.
export class HeldActs {
  static of(host: Host): { bound?: Promoted; pull?: Promoted } {
    const bound = host.bound && { choice: `travel:${host.bound.id}`, command: `travel:${host.bound.id}`,
      label: `Go on to ${host.bound.name}`, why: 'bound' as const, facets: ['here' as const, 'aimed' as const],
      tier: 1 as const, aspects: ['undertaking' as const], note: 'where you set out for',
      marks: Marks.journey(host.elapsed ?? 0, host.bound.minutes) ? [Marks.dusk] : [] };
    const pull = host.follow && { choice: `follow:${host.follow.id}`, command: `follow:${host.follow.id}`,
      label: host.follow.label, why: 'held' as const, facets: ['here' as const], tier: 1 as const, aspects: [],
      note: 'to see it through', marks: [] };
    return { bound, pull };
  }
}
