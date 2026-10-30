import { Likeness } from '../paintings/likeness';
import { Sittings } from '../paintings/sittings';
import type { Campaign } from '../campaign/campaign';
import type { TargetRow } from './screen-types';

// The painting each person is met in, the same wherever they are met, and no one else of their country's (see
// Sittings): small and large, where the face sits, and its credit.
export class Portraits {
  static of(campaign: Campaign, id: string): TargetRow['portrait'] {
    const painting = Sittings.of(campaign, id);
    return painting ? Likeness.portrait(painting) : undefined;
  }
}
