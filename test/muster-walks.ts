import { Journey } from '../src/session/journey';
import steps from './fixtures/muster/journey.json';

// Shared walks for the Muster specs: every one starts at the Ford and is played by its labels. Only the clock and the
// dice are ever forced (`=…` steps, `roll`), never a position or a fact. One companion fits at a time.
export const campaign = 'data/campaigns/muster.campaign.json';
export const start = () => Journey.start(campaign, 'muster');
export { steps };
export type Who = 'marra' | 'fenn' | 'none';
export const ended = (j: Journey) => j.choices()
  .filter(c => !/Give to|Set down|prepare spells|Pack/.test(c.label)).length === 0;

// Home from the gate: the Viaduct is crossed by its parapet unless the Cohort has shown the rope-way.
export const homeNoRope = [...steps.home.slice(0, steps.home.indexOf('To the north head of the Viaduct')), 'To the parapet of the fifth arch',
  ...steps.home.slice(steps.home.indexOf('To the north head of the Viaduct'))];

/** Rope, pitons, torches and a tent; one companion hired; Greta's lamp asked about. Ends on the green. */
export const ford = async (j: Journey, who: Who = 'marra') => {
  await j.play(...steps.prepare_light);
  if (who === 'marra') { await j.play(...steps.hire); }
  if (who === 'fenn') { await j.play('Into the Last Fire', 'Ask Fenn Thorley to join the company', 'Out to Kell green'); }
  await j.play(...steps.stock);
};
/** … then Septimus, the Ledge and Octavius's hall. */
export const toOctavius = async (j: Journey, who: Who = 'marra') => {
  await ford(j, who);
  if (who === 'marra') { await j.play(...steps.first_days); return; }
  // Without the goatherd's wayfinding the track and the Ledge are shut: the causeway under torches, then the High Road
  // at dawn.
  await j.play('To the head of the Old Causeway', 'To the long middle of the causeway', 'a torch: Light', 'Stand together with lit torches, and let the pack look at the flame',
    'To the end of the causeway', 'To the Mansio Septimus', '=day 2 05:00', 'To the foot of the High Road', 'To the open stretch of the High Road', 'To the Mansio Octavius',
    'Unbuckle the scribe\'s satchel', 'a scribe\'s glossary of the old script: Take from the scribe\'s satchel');
};
/** … then the Viaduct (rigged), and the Eagle. */
export const toEagle = async (j: Journey, who: Who = 'marra') => {
  await toOctavius(j, who);
  if (who === 'marra') { await j.play('Ask Marra what she is looking for on the far side', 'Say that you would want to know, whatever it was'); }
  await j.play(...steps.viaduct);
  if (who === 'marra') { await j.play('Ask Marra about the letters on the arch', 'Tell her to come on: it is her brother\'s road too'); }
};
/** … then the giant, the Descent, the deserters, and the gate (the pouch held up). */
export const toGate = async (j: Journey, who: Who = 'marra') => {
  await toEagle(j, who);
  await j.play(...steps.to_pass, ...steps.giant, 'To the head of the descent', ...steps.deserters, ...steps.gate.slice(1));
};
/** … then inside, at the forum. */
export const toForum = async (j: Journey, who: Who = 'marra') => { await toGate(j, who); await j.play('To the forum'); };
/** The Prefect's three questions, answered; ends back in the forum. */
export const interview = (j: Journey) => j.play('To the Praetorium', 'Let the Prefect put his first question', 'Say that nobody sent you: you came to see what the road led to',
  'Let the Prefect put his second question', 'Say that it looks heavy: that it looks like something people carry',
  'Let the Prefect put his last question', 'Say that you will not answer, because the answer is not yours to give', 'to the forum');
/** From the forum back to the Ford (no rope-way), the party sent home by the labels. */
export const homeFromForum = (j: Journey) => j.play('To the gate of the Last Cohort', 'To the Long Descent', ...homeNoRope.slice(3));

/** The sky turns at first light on the clock's own dice: wait through dawns (only the clock is forced) until it
 * shows `sky`. */
export const untilSky = async (j: Journey, sky: string, from = 2) => {
  for (let day = from; day < 40; day++) {
    await j.play(`=day ${day} 07:00`);
    if (j.holds('state', 'sky', sky)) { return day; }
  }
  throw new Error('no ' + sky + ' day');
};
