import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import steps from './fixtures/muster/journey.json';

// Every ending of the crossing, played by its labels from the Ford: no staging of position, only of the clock
// (the season turns on the ninth day, the delegation walks four days; a test waits).
const campaign = 'data/campaigns/muster.campaign.json';
const start = () => Journey.start(campaign, 'muster');
// Home from the gate: the Viaduct is crossed by its parapet (the line is fixed) unless the Cohort has shown the rope-way.
const homeNoRope = [...steps.home.slice(0, steps.home.indexOf('To the north head of the Viaduct')), 'To the parapet of the fifth arch',
  ...steps.home.slice(steps.home.indexOf('To the north head of the Viaduct'))];
const toGate = async (j: Journey) => {
  await j.play(...steps.prepare_light, ...steps.hire, ...steps.stock, ...steps.first_days);
  await j.play('Ask Marra what she is looking for on the far side', 'Say that you would want to know, whatever it was');
  await j.play(...steps.viaduct, 'Ask Marra about the letters on the arch', 'Tell her to come on: it is her brother\'s road too');
  await j.play(...steps.to_pass, ...steps.giant, 'To the head of the descent', ...steps.deserters, ...steps.gate.slice(1));
};
const ended = (j: Journey) => j.choices().filter(c => !/Give to|Set down|prepare spells|Pack/.test(c.label)).length === 0;

describe('the endings of the crossing', () => {
  it('is turned back at Octavius when the snow comes before the arch', async () => {
    const j = await start();
    await j.play(...steps.prepare_light, ...steps.hire, ...steps.stock, ...steps.first_days);
    expect(j.at('party')).toBe('muster__octavius_hall');
    await j.play('=day 7 08:00');
    expect(ended(j)).toBe(true);
    expect(j.page).toContain('turned at Octavius');
  }, 290000);

  it('is snowed in at the Last Cohort when the season turns on the south side', async () => {
    const j = await start();
    await toGate(j);
    await j.play('To the forum');
    await j.play('=day 7 08:00');
    expect(ended(j)).toBe(true);
    expect(j.page).toContain('passes shut behind you');
  }, 290000);

  it('lets a boy follow if his master\'s bread was eaten, and ends at the trough', async () => {
    const j = await start();
    await toGate(j);
    await j.play('To the forum', 'To the pistrina', 'Ask the baker why the bread tastes as it does', 'To the forum', 'To the gate of the Last Cohort',
      'To the Long Descent');
    expect(j.holds('following', 'tavi', 'party')).toBe(true);
    await j.play(...homeNoRope.slice(3));
    expect(ended(j)).toBe(true);
    expect(j.page).toContain('boy of eleven');
  }, 290000);

  it('comes home one fewer when Marra is told to stay with her brother', async () => {
    const j = await start();
    await toGate(j);
    await j.play('To the forum', 'To the apothecary', 'Show Marra the boy who sorts Dame Orsa\'s herbs',
      'Say that she should stay: he has a life here, and so would she');
    expect(j.holds('marraStaysCohort', 'party')).toBe(true);
    await j.play('Out to the forum', ...homeNoRope.slice(1));
    expect(ended(j)).toBe(true);
    expect(j.page).toContain('one fewer');
  }, 290000);

  it('comes home having said nothing, when the valley is only walked through', async () => {
    const j = await start();
    await toGate(j);
    await j.play('To the forum', 'To the gate of the Last Cohort', 'To the Long Descent', ...homeNoRope.slice(3));
    expect(ended(j)).toBe(true);
    expect(j.page).toContain('said nothing of what you knew');
  }, 290000);

  it('leaves the valley worse for the telling when the Prefect is told and the standard comes down', async () => {
    const j = await start();
    await toGate(j);
    await j.play('To the forum', 'To the Praetorium', 'Let the Prefect put his first question', 'Say that nobody sent you: you came to see what the road led to',
      'Let the Prefect put his second question', 'Say that it looks heavy: that it looks like something people carry',
      'Let the Prefect put his last question', 'Say that you will not answer, because the answer is not yours to give',
      'Tell the Prefect that the empire is gone');
    expect(j.holds('told_prefect', 'party')).toBe(true);
    await j.play('Out to the forum', 'To the gate of the Last Cohort', 'To the Long Descent', ...homeNoRope.slice(3));
    expect(ended(j)).toBe(true);
    expect(j.page).toContain('The Eagles took the Praetorium');
    expect(j.page).toContain('was in it');
  }, 290000);

  it('has the Cohort come down the road after the Archivist is told, and the page ends on its arrival', async () => {
    const j = await start();
    await toGate(j);
    await j.play('To the forum', 'To the Praetorium', 'Let the Prefect put his first question', 'Say that nobody sent you: you came to see what the road led to',
      'Let the Prefect put his second question', 'Say that it looks heavy: that it looks like something people carry',
      'Let the Prefect put his last question', 'Say that you will not answer, because the answer is not yours to give',
      'Out to the forum', 'To the Archive', 'Tell the Archivist what the road is');
    expect(j.holds('told_moll', 'party')).toBe(true);
    await j.play('Out to the forum', ...steps.home.slice(1));
    expect(ended(j)).toBe(false);
    await j.play('=+700');
    expect(ended(j)).toBe(true);
    expect(j.page).toContain('Three red cloaks');
  }, 290000);
});
