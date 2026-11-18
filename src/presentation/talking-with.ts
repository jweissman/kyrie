import type { Campaign } from '../campaign/campaign';
import type { Told } from './narrator';

// Whom the last act spoke to, where the company stayed: the one greeted, or the one a question was put to. What is
// next to ask them is led while they are spoken with (Affordances: the reeve's own topics had stood in the rest while
// she was talked to, cold play 4, CL-49).
export class TalkingWith {
  static of(campaign: Campaign, told: Told | undefined): { talking?: string } {
    const act = !told || told.moved ? undefined : /^([^(]+)\(([^)]*)\)$/.exec(told.event.action);
    const who = act && (act[1] === 'talk_to' ? act[2]!.split(',')[1]?.trim()
      : campaign.module.actions.find(a => a.id === act[1])?.speaker);
    return who ? { talking: who } : {};
  }
}
