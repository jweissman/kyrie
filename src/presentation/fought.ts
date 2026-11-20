import type { Campaign, CampaignEvent } from '../campaign/campaign';
import type { Creature } from '../creature';

// The creatures the fights of some events name, anywhere in what they tell (who struck whom, who fled, the order of
// battle): only they need be drawn as fighters to tell those fights (CombatPresenter finds each by its id), not every
// creature the world holds, a full copy of each one's sheet, for every act of a game with a fight anywhere in its log
// (OR-91: the chronicle's whole cost).
export class Fought {
  static of(campaign: Campaign, events: readonly CampaignEvent[]): Creature[] {
    const ids = new Set<string>();
    for (const e of events) { for (const c of e.combat) { this.named(c, ids); } }
    return ids.size ? campaign.readout.creatures.filter(c => ids.has(c.id)) : [];
  }
  private static named(v: unknown, ids: Set<string>) {
    if (typeof v === 'string') { ids.add(v); return; }
    if (v && typeof v === 'object') { for (const x of Object.values(v)) { this.named(x, ids); } }
  }
}
