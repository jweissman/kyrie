import { Likeness } from '../paintings/likeness';
import { Sittings } from '../paintings/sittings';
import type { Campaign } from '../campaign/campaign';
import type { TargetRow } from './screen-types';
import type { Face } from '../paintings/company-portraits';

// The painting each person is met in, the same wherever they are met, and no one else of their country's (see
// Sittings): small and large, where the face sits, and its credit.
export class Portraits {
  // In a fight, each foe who is someone (a person of the world, painted where they are met) by their own likeness, as
  // the company is by theirs (M19-78: a person fought had been a creature's painting, or none). Keyed by member.
  static foes(campaign: Campaign): Map<string, Face> {
    const out = new Map<string, Face>();
    for (const actor of campaign.actors.filter(a => !a.player)) {
      const painting = Sittings.of(campaign, actor.id);
      if (!painting) { continue; }
      const face = { id: painting, src: Likeness.src(painting), medium: Likeness.src(painting) };
      for (const member of actor.members) { out.set(member, face); }
    }
    return out;
  }
  // The painting one who joined the company was met in (by the group they joined as, as the place they were met in
  // shows them), for their page and for how their portrait presents: Leif, met as a man with a lute in the taproom, had
  // been a woman bard on his own page, his name saying nothing of him (the owner's fresh session, 7 November).
  static met(campaign: Campaign, ref: string | undefined): string | undefined {
    const world = campaign.world, joined = ref && world.relates('joinedAs') ? world.one('joinedAs', ref) : undefined;
    return joined ? Sittings.of(campaign, joined) : undefined;
  }
  static of(campaign: Campaign, id: string): TargetRow['portrait'] {
    const painting = Sittings.of(campaign, id);
    return painting ? Likeness.portrait(painting) : undefined;
  }
}
