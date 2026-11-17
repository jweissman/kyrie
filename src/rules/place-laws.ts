import { Effects, type EffectContext } from '../effects';
import type { Fighter } from '../model';

// The laws of the place a fight is fought in, held by everyone in it until it ends (see Battle.encounter): what one
// does at the end of each turn (the Fire's heat, the Negative's drain, the Positive's mending: GT-01) it does to each
// holder at the end of theirs, told as the law's. Between fights the same law does it by the watch (PlaneLaws).
export class PlaceLaws {
  static tick(actor: Fighter, context: EffectContext) {
    for (const s of actor.statuses.filter(c => c.clock === 'until-removed' && Effects.status(c.id).law)) {
      Effects.periodic(actor, s.id, s.id, context);
    }
  }
}
