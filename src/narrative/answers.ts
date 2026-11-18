import type { Campaign } from '../campaign/campaign';
import type { CampaignEvent } from '../campaign/campaign-types';
import { FictionalTime } from '../campaign/fictional-time';
import { Voice } from './voice';
import { Editor } from './editor';
import type { Voiced } from './telling';

// What someone answers, against the record of what has been told: each answer given is kept (CampaignEvent.voiced,
// kind answer), and one asked for again and given word for word as it was within the last day, nothing it bears on
// changed since, is told as given again (data/voice/answer.json), not again in full: what it said is in the Notes.
// Asking again had given the same answer word for word each time (the boredom census, BO-10: Honoria's tea-shop,
// Hulda's work). An answer that has changed (a larder's days, counted again) is told as it is.
export class Answers {
  static readonly rested = 24 * 60 / FictionalTime.minutesPerTick;
  static tell(campaign: Campaign, event: CampaignEvent, used: Set<string>): Voiced[] {
    const speaker = campaign.operator(event.action)?.speaker, text = event.response;
    if (!speaker || !text || event.result !== 'success' || event.combat.length) { return []; }
    const id = `answer.${speaker}`, before = campaign.history.findLast(e => e !== event && e.elapsed <= event.elapsed
      && e.elapsed > event.elapsed - this.rested && (e.voiced ?? []).some(v => v.id === id && v.text === text));
    const told: Voiced = { id, kind: 'answer', actor: speaker, text };
    if (!before) { return [told]; }
    const line = Editor.choose(Voice.fitting('answer-again', {}), `${campaign.readout.seed}:${event.elapsed}:again`, used);
    if (!line) { return [told]; }
    Editor.said(used, line.id);
    // Kept as the answer it was, so that a third asking is reckoned from it, and as what was told in its place.
    return [told, { id: line.id, kind: 'answer-again', actor: speaker,
      text: Voice.render(line.text, { actor: Editor.called(campaign, speaker), many: false }) }];
  }
  // An answer given again, as it is told in place of the answer (see ActionFeedbackView).
  static told(event: CampaignEvent): string | undefined {
    return event.voiced?.find(v => v.kind === 'answer-again')?.text;
  }
}
