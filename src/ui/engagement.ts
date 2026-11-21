import type { Campaign } from '../campaign/campaign';

// What the company has entered into that is not a threat (OR-173; the owner, 21 November: focus, activity and
// engagement told apart): a hand of cards, a riddle put, a performance, each with its participants, its moves, its
// stakes and its ending. The author asserts engaged_in(company, it) as it begins and retracts it as it ends
// (data/rules/inhabitants.kyr); while it stands Engaged narrows the frame to it as it does to a threat.
export class Engagement {
  static of(campaign: Campaign): { engaged?: { id: string; also?: string[] } } {
    const world = campaign.world, company = campaign.playerActor;
    if (!company || !world.relates('engaged_in') || !campaign.running) { return {}; }
    const [id, ...also] = world.related('engaged_in').map(r => r.args).filter(([g]) => g === company).map(([, e]) => e!);
    return id ? { engaged: { id, ...also.length ? { also } : {} } } : {};
  }
}
