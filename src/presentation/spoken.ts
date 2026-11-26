import { Sentences } from './sentences';
import type { Campaign, CampaignEvent } from '../campaign/campaign';
import { ObservationText } from '../lang/observation-text';
import type { Operator } from '../lang/module';
import type { ActionFeedback } from './action-feedback';
import { Words } from './words';

// What someone told the company, as they told it: "'Brother Anselm's hand,' says Kendra." The page tells an answer
// so, and the Story keeps it so, not as "Kendra tells you what they have heard about the opened graves" (the cold
// evaluation).
export class Spoken {
  // What the company said, as said (OR-149, the owner's playtest: a conversation is talking to someone, not operating
  // records): a topic's words as the company says them, "You ask Owain how many head came down.", not the row's label.
  static said(operator: Operator | undefined, label: string): string {
    return operator?.topic || operator?.schema === 'take_leave' ? Words.echo(label) : label;
  }
  // What a conversation tells it learned: what the one spoken with told, not what the place taught as it was asked
  // (four facts of the green's notices and boats had come under Owain's answer); the rest is in the Book as ever.
  static kept(campaign: Campaign, operator: Operator | undefined, told: { feedback: ActionFeedback }): ActionFeedback {
    const feedback = told.feedback;
    if (!operator || !Spoken.talking(operator)) { return feedback; }
    const taught = operator.success.flatMap(c => c.kind === 'assert' && c.call.name === 'knows' ? [c.call.args.at(-1)] : [])
      .map(id => campaign.module.entities.find(e => e.id === id)?.name).filter((n): n is string => !!n)
      .map(n => ObservationText.render(n, campaign.world));
    const discoveries = feedback.discoveries.filter(t => Spoken.taught(taught, t));
    // What came of turning to someone told as what they taught (its result is the discoveries said together): not the
    // place's, now held back.
    const whole = feedback.discoveries.length > 0 && feedback.result.startsWith(feedback.discoveries[0]!);
    return { ...feedback, discoveries, leads: (feedback.leads ?? []).filter(t => Spoken.taught(taught, t)),
      ...whole ? { result: discoveries.join(' ') } : {} };
  }
  // A word said to someone that may not come off is told by its roll, then by what they say back (OR-850): the roll
  // had come after their answer, and after the next question they put.
  static rolled(operator: Operator | undefined, fight: boolean, feedback: ActionFeedback): { text: string; kind: 'roll' }[] {
    return (operator?.speaker && !fight ? feedback.rolls.filter(t => feedback.immediate.includes(t)) : [])
      .map(text => ({ text, kind: 'roll' as const }));
  }
  // A conversation's act: a topic, or turning to someone to talk.
  static talking(operator: Operator | undefined): boolean { return !!operator?.topic || operator?.schema === 'talk_to'; }
  private static taught(names: string[], t: string): boolean {
    return names.some(n => t === n || t.startsWith(n) || n.startsWith(t));
  }
  // Who said each of a topic's speeches: its speaker, by the name the company knows them by.
  static by<L extends { kind: string; by?: string }>(lines: L[], campaign: Campaign,
    operator: Operator | undefined): L[] {
    const who = operator?.topic && operator.speaker
      && campaign.module.entities.find(e => e.id === operator.speaker)?.name.split(', ')[0];
    return who ? lines.map(l => l.kind === 'speech' ? { ...l, by: who } : l) : lines;
  }
  static speech(text: string, speaker: string): string {
    const said = text.trim(), [first, ...rest] = Sentences.split(said);
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
