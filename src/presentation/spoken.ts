import type { Campaign, CampaignEvent } from '../campaign/campaign';
import { ObservationText } from '../lang/observation-text';

// What someone told the company, as they told it: "'Brother Anselm's hand,' says Kendra." The page tells an answer
// so, and the Story keeps it so, not as "Kendra tells you what they have heard about the opened graves" (the cold
// evaluation).
export class Spoken {
  static speech(text: string, speaker: string): string {
    const said = text.trim(), [first, ...rest] = said.split(/(?<=[.!?])\s+/);
    const lead = first!.replace(/\.$/, ',');
    return rest.length ? `‘${lead}’ says ${speaker}. ‘${rest.join(' ')}’` : `‘${lead}’ says ${speaker}.`;
  }
  // What came of a command, as the Story keeps it: what a question asked of someone taught the company, in their
  // words, by what it came to know; or, for anything else, what came of it.
  static told(campaign: Campaign, event: CampaignEvent, names: Map<string, string>): string[] {
    const answers = this.answer(campaign, event, names);
    return answers.length ? answers : event.response ? [event.response] : [];
  }
  private static answer(campaign: Campaign, event: CampaignEvent, names: Map<string, string>): string[] {
    const action = campaign.operator(event.action), informant = action?.schema === 'ask' ? action.bindings?.informant : '';
    if (!informant || event.result !== 'success') { return []; }
    const speaker = (names.get(informant) ?? informant).split(', ')[0]!;
    return event.changes.map(line => /^\+ knows\([^,]+, ([^)]+)\)$/.exec(line)?.[1])
      .map(fact => fact && campaign.module.entities.find(e => e.id === fact)?.name)
      .filter((text): text is string => !!text)
      .map(text => this.speech(ObservationText.render(text, campaign.world), speaker));
  }
}
