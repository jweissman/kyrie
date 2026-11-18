import type { Campaign, CampaignEvent } from '../campaign/campaign';
import type { Told } from './narrator';
import { FictionalTime } from '../campaign/fictional-time';

// What is read in a thing changed is told after how the thing is now: a receipt read had told "A wheel; no wing."
// before the receipt it reads, "He was hit…" before the body under the cloth (cold play 6, CL-55). A reading is an
// observation of that aspect, perceived by the act.
export class Readings {
  // The texts of what the act read, as perceived.
  static of(campaign: Campaign, event: CampaignEvent): Set<string> {
    const readings = new Set((campaign.module.observations ?? []).filter(o => o.aspect === 'reading').map(o => o.id));
    return new Set((event.perceptions ?? []).filter(p => p.kind === 'observation' && readings.has(p.id.split('@')[0]!))
      .map(p => FictionalTime.prose(p.text)));
  }
  // What was seen where the company stayed, what was read in a thing changed last; and the act's result, unless it is
  // only what was read (told there).
  static last<R extends { text: string }>(campaign: Campaign, told: Told, changing: boolean, result: R[]):
    { seen: { text: string; kind: 'change' }[]; result: R[] } {
    const seen = (told.moved ? [] : told.feedback.observations).map(text => ({ text, kind: 'change' as const }));
    const read = changing ? this.of(campaign, told.event) : new Set<string>();
    if (!read.size) { return { seen, result }; }
    const later = seen.filter(l => read.has(FictionalTime.prose(l.text)));
    return { seen: [...seen.filter(l => !later.includes(l)), ...later],
      result: result.filter(l => !later.some(x => x.text === l.text)) };
  }
}
