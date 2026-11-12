import type { Campaign } from '../campaign/campaign';
import type { Row } from './choice-grouping';
import { SkillReading, type Wanting } from '../presentation/skill-reading';
import { CoinReading } from '../presentation/coin-reading';
import { RefusalReading } from '../presentation/refusal-reading';
import { PlayerView } from '../presentation/player-view';

// The choices, with who makes each skilled one possible; and what the company could do, and why not now: a skill or
// a thing nobody in it has (SkillReading), the coin (CoinReading), someone's will to serve it (RefusalReading), each
// drawn as a choice it cannot yet take, with why.
export class Withheld {
  static rows(campaign: Campaign): Row[] {
    const reading = SkillReading.read(campaign);
    return [...PlayerView.choices(campaign).map(r => ({ ...r,
      ...(reading.uses.has(r.action.id) ? { by: reading.uses.get(r.action.id)! } : {}) })),
    ...reading.wanting.map(w => ({ choice: { ...w.choice, time: w.choice.time ?? 1 }, action: w.action,
      wanting: this.wanting(w) })),
    ...CoinReading.read(campaign).map(s => ({ choice: { ...s.choice, time: s.choice.time ?? 1 }, action: s.action,
      wanting: CoinReading.why(s) })),
    ...RefusalReading.read(campaign).map(r => ({ choice: { ...r.choice, time: r.choice.time ?? 1 }, action: r.action,
      wanting: RefusalReading.why(campaign, r) }))];
  }
  // "Can use it now", not "has": a bard senseless after a fight had been said not to have persuasion (round 8, N).
  static wanting(w: Wanting): string {
    if (w.thing) { return `Needs ${[w.name, ...w.or].join(' or ')}, and the company has none.`; }
    return w.or.length ? `Needs ${w.name.toLowerCase()} or ${w.or.join(' or ')}, and the company has neither.`
      : `Needs ${w.name.toLowerCase()}: no one in the company can use it now.${w.had ? ` ${w.had}` : ''}`;
  }
}
