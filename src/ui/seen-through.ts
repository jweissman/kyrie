import type { Campaign } from '../campaign/campaign';
import { FictionalTime } from '../presentation/fictional-time';

// What the company has seen through, in the order it did, and when: the follow-up review finished a family's story
// and found nothing of it in the notes but "Nothing is asked of you yet". Whatever was worth experience when it was
// done is kept by its name ("The drover who did not come home").
export class SeenThrough {
  static of(campaign: Campaign): string[] {
    const done = new Map<string, number>();
    for (const e of campaign.history) {
      for (const c of e.combat) {
        const name = c.type === 'gain' ? /^experience: (.+), seen through$/.exec(c.detail ?? '')?.[1] : undefined;
        if (name && !done.has(name)) { done.set(name, e.elapsed); }
      }
    }
    return [...done].map(([name, at]) => `${name.charAt(0).toUpperCase()}${name.slice(1)} — ${FictionalTime.at(at)}`);
  }
}
