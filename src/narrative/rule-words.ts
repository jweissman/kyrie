import type { Campaign } from '../campaign/campaign';
import type { CampaignEvent } from '../campaign/campaign-types';
import { FictionalTime } from '../campaign/fictional-time';
import type { Voiced } from './telling';

// What the world's rules say where the company hears them, against the record of what has been told: a rule's words
// told are kept (CampaignEvent.voiced, kind rule), and the same words of the same rule are not told again within a few
// days of the last time, but held back as heard already (CampaignEvent.unsaid). The bell on the east point had been
// told every first light, nine times in eight walks (the boredom census, BO-09). A rule with lines of its own for
// each time after the first (`again`, `then`) says them as its author wrote them, and is not held back; nor are words
// that broke off what the company was doing, which are what it is told of why.
export class RuleWords {
  static readonly rested = 3 * 24 * 60 / FictionalTime.minutesPerTick;
  static tell(campaign: Campaign, event: CampaignEvent): { told: Voiced[]; unsaid: string[] } {
    const rules = new Map((campaign.module.rules ?? []).filter(r => r.say && !r.again).map(r => [r.id, r]));
    const heard = (event.perceptions ?? []).filter(p => p.kind === 'event' && rules.has(p.id.split('@')[0]!));
    if (!heard.length) { return { told: [], unsaid: [] }; }
    const told: Voiced[] = [], unsaid: string[] = [];
    for (const p of heard) {
      const id = `rule.${p.id}`;
      const last = campaign.history.findLast(e => e !== event && e.elapsed < event.elapsed
        && (e.voiced ?? []).some(v => v.kind === 'rule' && v.id === id && v.text === p.text));
      if (last && !event.cut && event.elapsed - last.elapsed < this.rested) { unsaid.push(p.id); }
      else { told.push({ id, kind: 'rule', text: p.text }); }
    }
    return { told, unsaid };
  }
  // The rules whose words teach something (an event that teaches: a wonder met), by id.
  static teaching(campaign: Campaign): Set<string> {
    return new Set((campaign.module.rules ?? []).filter(r => r.teaches && r.say).map(r => r.id));
  }
  // The world's words a command is told in: not those held back as heard lately.
  static said(event: CampaignEvent): NonNullable<CampaignEvent['perceptions']> {
    const unsaid = new Set(event.unsaid ?? []);
    return (event.perceptions ?? []).filter(p => p.kind === 'event' && !unsaid.has(p.id));
  }
}
