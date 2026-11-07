import { describe, expect, it } from 'bun:test';
import { Patience } from '../src/ui/patience';
import { start, steps, ford, toEagle, toForum, interview, homeFromForum, homeNoRope, ended } from './muster-walks';

// The Long Muster's Road, played from the Ford by its labels: no position and no fact is staged; only the clock
// (`=…`) and the dice (`roll`) are forced. The valley's people, the companions' beats, the tellings and the endings
// they lead to.
const T = 290000;

describe('Every way of keeping Dunya ends', () => {
  // Dunya joined in the valley (the Prefect told, the Centurion asked for a scout), walked to the Descent with the
  // company.
  const withDunya = async () => {
    const j = await start();
    await toForum(j, 'none');
    await interview(j);
    await j.play('To the Praetorium', 'Tell the Prefect that the empire is gone', 'to the forum', 'To the barracks yard', 'Ask the Centurion for a scout',
      'Ask Dunya to join the company', 'to the forum', 'To the gate of the Last Cohort', 'To the Long Descent', 'To the head of the descent');
    return j;
  };
  const toFord = (j: any) => j.play(...homeNoRope.slice(4).map(x => /light a torch/.test(x) ? '?a torch: Light' : x));

  it('lets her go home unasked when the Ford question was skipped (trust 0)', async () => {
    const j = await withDunya();
    await toFord(j);
    expect(ended(j)).toBe(false);
    await j.play('=+40');
    expect(j.holds('dunyaHome', 'party')).toBe(true);
    expect(ended(j)).toBe(true);
    expect(j.page).not.toContain('one fewer');
  }, T);

  it('lets her go home unasked after "it is small" (trust 0)', async () => {
    const j = await withDunya();
    await toFord(j);
    await j.play('Ask Dunya what she sees in Kell Ford', 'Say that it is small, and the Cohort is the greater place');
    await j.play('=+40');
    expect(j.holds('dunyaHome', 'party')).toBe(true);
    expect(ended(j)).toBe(true);
  }, T);

  it('lets her stay in Kell unasked after "it is enough" (trust 2), and ends', async () => {
    const j = await withDunya();
    await toFord(j);
    await j.play('Ask Dunya what she sees in Kell Ford', 'Say that it is enough: it is where people are');
    await j.play('=+40');
    expect(j.holds('dunyaStaysKell', 'party')).toBe(true);
    expect(ended(j)).toBe(true);
  }, T);

  it('lets her go home unasked with the one word of trust the Descent gave (trust 1)', async () => {
    const j = await withDunya();
    await j.play('Ask Dunya who the men at the head of the Descent are', 'Tell her that duty is duty, and that his mother is owed the truth');
    await toFord(j);
    await j.play('=+40');
    expect(j.holds('dunyaHome', 'party')).toBe(true);
    expect(ended(j)).toBe(true);
  }, T);
});

describe('What telling and knowing cost', () => {
  it('has the Centurion march the First Century out, taking the scout and the wall with her', async () => {
    const j = await start();
    await toForum(j);
    await j.play('To the barracks yard', 'Tell the Centurion that the empire is gone', '=+40', 'Wait › A while');
    expect(j.at('muster__merula')).toBe('muster__sending_gate');
    expect(j.find('Ask the Centurion for a scout')).toBeUndefined();
  }, T);

  it('has the Archivist shut the Annals and keep the rope-way twelve hours', async () => {
    const j = await start();
    await toForum(j);
    await interview(j);
    await j.play('Into the Archive', 'Tell the Archivist what the road is');
    expect(j.find('Ask the Archivist to open the Annals')).toBeUndefined();
    expect(j.find('engineers\' note')).toBeUndefined();
  }, T);

  it('has the Eagles bar the shrine to one who told the Hearth', async () => {
    const j = await start();
    await toForum(j);
    await interview(j);
    await j.play('Into the Archive', 'Ask Ede what she wants of you', 'Say that you will, if she will stand beside you when you do', 'to the forum', 'To the barracks yard', 'To the granary', 'Tell the granary-reeve that the empire is gone');
    await j.play('to the barracks yard', 'to the forum');
    expect(j.find('To the shrine of the Eagle')).toBeUndefined();
  }, T);

  it('bars the granary to the one who returns the gold wing, and ends with the Hearth not speaking', async () => {
    const j = await start();
    await toForum(j);
    await j.play('To the barracks yard', 'To the Tally-yard');
    j.roll('pass');
    await j.play('Stand beside him and count aloud with him, for an hour', 'to the barracks yard', 'to the forum', 'To the vineyard terraces', 'To the old farm under the terraces',
      'the gold wing of the old standard: Take', 'to the vineyard terraces', 'to the forum', 'To the shrine of the Eagle', 'Lay the gold eagle\'s wing before the Aquilifer', 'to the forum', 'To the barracks yard');
    expect(j.find('To the granary')).toBeUndefined();
    await j.play('to the forum');
    await homeFromForum(j);
    expect(j.page).toContain('barred its granary against you from the inside');
  }, T);

  it('gives the gold a second road, through the Annals, to one who swore', async () => {
    const j = await start();
    await toForum(j);
    await interview(j);
    await j.play('Into the Archive', 'Ask the Archivist to open the Annals', 'Let the Archivist ask what it is you want of the Annals',
      'Swear on the lamp of the shrine that you will not use it to harm the valley', 'Ask the Archivist about the Schism of the Standard',
      'Ask the Archivist where the Hearth hid the Eagle\'s wings');
    expect(j.holds('knows', 'party', 'gold_known')).toBe(true);
  }, T);

  it('lets Orsa\'s confession reach the Prefect, and take Orsa to the Praetorium', async () => {
    const j = await start();
    await toForum(j);
    await interview(j);
    await j.play('Into the apothecary', 'Let Dame Orsa ask what herbs you carried over the Fells', 'Say that you asked a fair price, and would take a fair one',
      'Ask Dame Orsa what the Prefect takes for his sleep', 'to the forum', 'To the Praetorium', 'Tell the Prefect what Dame Orsa puts in his evening cup', 'Wait › A while');
    expect(j.holds('doseTold', 'party')).toBe(true);
    expect(j.at('muster__orsa')).toBe('muster__praetorium_hall');
  }, T);

  it('ends in What the Standard Cost, and Who Was Spared It, when Jory was taken home and the Prefect told', async () => {
    const j = await start();
    await toForum(j);
    await j.play('Into the apothecary', 'Show Marra the boy who sorts Dame Orsa\'s herbs', 'Say that they should both go home, and tell Kell Ford what is here', 'to the forum');
    await interview(j);
    await j.play('To the Praetorium', 'Tell the Prefect that the empire is gone', 'to the forum');
    await homeFromForum(j);
    expect(j.page).toContain('Jory sits on the trough with his sister');
  }, T);
});

describe('The purse', () => {
  it('opens at 22 coin, leaves 7 after the whole kit, and 1 after kit and harness; the Tally fine (30) is out of reach until the valley pays', async () => {
    const j = await start();
    expect(j.measure('quantity', 'party', 'gold')).toBe(22);
    await j.play(...steps.prepare_light);
    expect(j.measure('quantity', 'party', 'gold')).toBe(7);
    await j.play('Into Pryor\'s store', 'Buy › A climber\'s harness');
    expect(j.measure('quantity', 'party', 'gold')).toBe(1);
  }, T);
});

describe('Round five: what the Archivist, the Centurion, Dunya and the reeve now do', () => {
  it('does not let the scout skip the Archivist\'s twelve hours, and says to wait', async () => {
    const j = await start();
    await toForum(j);
    await interview(j);
    await j.play('Into the Archive', 'Tell the Archivist what the road is');
    expect(j.page).toContain('half a day');
    expect(j.page).toContain('HALF A DAY');
    await j.play('to the forum', 'To the barracks yard');
    expect(j.find('Ask the Centurion for a scout')).toBeUndefined();
    expect(j.holds('knows', 'party', 'ropeway_known')).toBe(false);
  }, T);

  it('keeps Dunya\'s unasked leaving for the green', async () => {
    const j = await start();
    await toForum(j, 'none');
    await interview(j);
    await j.play('To the Praetorium', 'Tell the Prefect that the empire is gone', 'to the forum', 'To the barracks yard', 'Ask the Centurion for a scout',
      'Ask Dunya to join the company', 'to the forum', 'To the gate of the Last Cohort', 'To the Long Descent', 'To the head of the descent',
      ...homeNoRope.slice(4).map(x => /light a torch/.test(x) ? '?a torch: Light' : x).slice(0, -1));
    await j.play('To Kell green');
    await j.play('To the head of the Old Causeway', '=+60');
    expect(j.page).not.toContain('carries her pack in');
    expect(j.page).not.toContain('does not wave');
    expect(j.holds('dunyaHome', 'party')).toBe(false);
  }, T);

  it('lifts the sentries\' and the giant\'s warning once the toll is met', async () => {
    const j = await start();
    await toEagle(j);
    await j.play(...steps.to_pass, ...steps.giant);
    expect(Patience.of((j as any).campaign).warned).toBeUndefined();
  }, T);

  it('lights the Archive, and has the Archivist answer a broken seal', async () => {
    const j = await start();
    await toForum(j);
    await j.play('Into the Archive');
    expect(j.page).not.toContain('pitch dark');
    await j.play('Break the General\'s seal and read');
    expect(j.page).toContain('That seal has been whole for eleven hundred years');
    expect(j.find('Ask the Archivist to open the Annals')).toBeUndefined();
  }, T);

  it('ends in The Letter Kept when the Prefect\'s dispatch is carried home and never given', async () => {
    const j = await start();
    await toForum(j);
    await j.play('To the Praetorium', 'Let the Prefect put his first question', 'Say that nobody sent you: you came to see what the road led to',
      'Let the Prefect put his second question', 'Say that it looks heavy: that it looks like something people carry',
      'Let the Prefect put his last question', 'Say that there are scholars at Hale who keep the empire\'s old archives',
      'Ask the Prefect for his dispatch', 'to the forum');
    expect(j.holds('dispatchTaken', 'party')).toBe(true);
    await homeFromForum(j);
    expect(ended(j)).toBe(false);
    await j.play('=+40');
    expect(ended(j)).toBe(true);
    expect(j.page).toContain('still sealed in your pack');
  }, T);

  it('pardons six, and leaves Aurel on his boulder', async () => {
    const j = await start();
    await toForum(j);
    await j.play('To the barracks yard', 'Give the Centurion the pouch addressed to her, from the Eagle',
      'Ask nothing for it, and tell her everything about the men in the Pass', 'Ask the Centurion to pardon the seven in the Pass');
    expect(j.holds('pardoned', 'party')).toBe(true);
    await j.play('to the forum', 'To the gate of the Last Cohort', 'To the Long Descent', 'To the head of the descent');
    expect(j.page).toContain('I was the one who counted them out');
    expect(j.holds('at', 'deserters', 'pass_s')).toBe(false);
  }, T);

  it('lets the purse hire one of Marra and Fenn after the kit, and not both', async () => {
    const j = await start();
    await ford(j);
    expect(j.measure('quantity', 'party', 'gold')).toBe(3);
    await j.play('Into the Last Fire');
    expect(j.find('Ask Fenn Thorley to join the company')).toBeUndefined();
  }, T);
});

