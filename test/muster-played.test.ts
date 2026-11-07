import { describe, expect, it } from 'bun:test';
import { Patience } from '../src/ui/patience';
import { start, steps, untilSky, ford, toOctavius, toEagle, toGate, toForum, interview, homeFromForum, homeNoRope, ended } from './muster-walks';

// The Long Muster's Road, played from the Ford by its labels: no position and no fact is staged; only the clock
// (`=…`) and the dice (`roll`) are forced. The valley's people, the companions' beats, the tellings and the endings
// they lead to.
const T = 290000;

describe('Four who go with the company', () => {
  it('lets Marra be told to stay, and the Ford be told one fewer', async () => {
    const j = await start();
    await toEagle(j);
    expect(j.measure('marraTrust', 'marra')).toBe(3);
    await j.play(...steps.to_pass, ...steps.giant, 'To the head of the descent', ...steps.deserters, ...steps.gate.slice(1));
    await j.play('To the forum', 'Into the apothecary', 'Show Marra the boy who sorts Dame Orsa\'s herbs', 'Say that she should stay: he has a life here, and so would she');
    expect(j.holds('marraStaysCohort', 'party')).toBe(true);
    await j.play('to the forum', ...homeNoRope.slice(1));
    expect(ended(j)).toBe(true);
    expect(j.page).toContain('one fewer');
  }, T);

  it('lets Fenn share his credit, and freeze at the north head and be found on the south side', async () => {
    const j = await start();
    await toOctavius(j, 'fenn');
    await j.play('To the north head of the Viaduct');
    await j.play('Ask Fenn why he has stopped at the Viaduct\'s head', 'Tell him to wait at the north head; you will send word by the rope-way');
    expect(j.holds('fennNerve', 'party')).toBe(true);
    await j.play('Drive a piton into the parapet and rig a line over the gap with a coil of rope', 'To the parapet of the fifth arch', 'To the south abutment');
    await j.play('Wait › A while');
    expect(j.at('muster__fenn_hallam')).toBe('muster__via_s');
    await j.play('To the Mansio of the Eagle', 'Ask Fenn what he has found in the Eagle\'s wall',
      'Say it should be Thessaly Orde\'s, or the engineer\'s, whoever\'s it was: write down who');
    expect(j.holds('fennCredit', 'party')).toBe(true);
  }, T);
});

describe('The Last Cohort asks, is answered, and is told', () => {
  it('lets the Prefect interview the company, and the Prefect be told: the standard is struck and the salt-market shuts', async () => {
    const j = await start();
    await toForum(j);
    await j.play('To the salt-market', 'to the forum');
    await interview(j);
    expect(j.measure('prefectRegard', 'party')).toBe(5);
    await j.play('To the Praetorium', 'Tell the Prefect that the empire is gone');
    expect(j.holds('state', 'standard', 'struck')).toBe(true);
    await j.play('to the forum');
    expect(j.find('^To the salt-market')).toBeUndefined();
  }, T);

  it('lets the Archivist be told: the Archive\'s young hand leaves for the north', async () => {
    const j = await start();
    await toForum(j);
    await interview(j);
    await j.play('Into the Archive', 'Tell the Archivist what the road is');
    expect(j.holds('told_ostrander', 'party')).toBe(true);
    await j.play('Wait › A while');
    expect(j.at('muster__ede_cassel')).toBe('muster__sending_gate');
  }, T);

  it('lets the Centurion be told', async () => {
    const j = await start();
    await toForum(j);
    await interview(j);
    await j.play('To the barracks yard', 'Tell the Centurion that the empire is gone');
    expect(j.holds('told_merula', 'party')).toBe(true);
  }, T);

  it('lets the granary-reeve be told, once the Archive\'s young hand has stood beside you', async () => {
    const j = await start();
    await toForum(j);
    await interview(j);
    await j.play('Into the Archive', 'Ask Ede what she wants of you', 'Say that you will, if she will stand beside you when you do');
    await j.play('to the forum', 'To the barracks yard', 'To the granary', 'Tell the granary-reeve that the empire is gone');
    expect(j.holds('told_elpis', 'party')).toBe(true);
  }, T);

  it('lets the Tally be counted, the gold wing found, laid before the Aquilifer, and the Annals opened to one who swore', async () => {
    const j = await start();
    await toForum(j);
    await interview(j);
    await j.play('To the barracks yard', 'To the Tally-yard');
    j.roll('pass');
    await j.play('Stand beside him and count aloud with him, for an hour');
    expect(j.holds('knows', 'party', 'gold_known')).toBe(true);
    await j.play('to the barracks yard', 'to the forum', 'To the vineyard terraces', 'To the old farm under the terraces');
    await j.play('the gold wing of the old standard: Take');
    expect(j.holds('holding', 'party', 'golden_idol')).toBe(true);
    await j.play('to the vineyard terraces', 'to the forum', 'To the shrine of the Eagle', 'Lay the gold eagle\'s wing before the Aquilifer');
    expect(j.holds('goldReturned', 'party')).toBe(true);
    expect(j.holds('state', 'standard', 'golden')).toBe(true);
    await j.play('to the forum', 'Into the Archive', 'Ask the Archivist to open the Annals', 'Let the Archivist ask what it is you want of the Annals',
      'Swear on the lamp of the shrine that you will not use it to harm the valley', 'Ask the Archivist about the year of the second wife',
      'Ask the Archivist about the plague winter', 'Ask the Archivist about the Schism of the Standard');
    expect(j.holds('knows', 'party', 'schism_known')).toBe(true);
  }, T);

  it('keeps Hobbe\'s secret from a party that only pays his fine, and gives it to one that counts', async () => {
    const j = await start();
    await toForum(j);
    await j.play('Into the apothecary', 'Let Dame Orsa ask what herbs you carried over the Fells', 'Say that you asked a fair price, and would take a fair one', 'to the forum');
    await j.play('To the salt-market', 'Let the salt-reckoner ask how you came by the Aenean coin', 'Say you took it off the stack at the Eagle, where the Muster left it', 'Sell a season of the Toll', 'to the forum');
    await j.play('To the barracks yard', 'To the Tally-yard', 'Pay the clerk Hobbe Quarry\'s fine, thirty coin');
    expect(j.holds('hobbeFreed', 'party')).toBe(true);
    expect(j.holds('hearthOwes', 'party')).toBe(true);
    expect(j.holds('knows', 'party', 'gold_known')).toBe(false);
  }, T);

  it('keeps the Aquilifer\'s brass from a party that presses and fails, once', async () => {
    const j = await start();
    await toForum(j);
    j.roll('fail');
    await j.play('To the shrine of the Eagle', 'Press the Aquilifer on why he polishes one wing every night');
    expect(j.holds('brandShut', 'party')).toBe(true);
    expect(j.find('Press the Aquilifer')).toBeUndefined();
  }, T);
});

describe('The endings the valley leads to', () => {
  it('ends in The Wing Goes Home when the gold is returned', async () => {
    const j = await start();
    await toForum(j);
    await j.play('To the barracks yard', 'To the Tally-yard');
    j.roll('pass');
    await j.play('Stand beside him and count aloud with him, for an hour', 'to the barracks yard', 'to the forum', 'To the vineyard terraces', 'To the old farm under the terraces',
      'the gold wing of the old standard: Take', 'to the vineyard terraces', 'to the forum', 'To the shrine of the Eagle', 'Lay the gold eagle\'s wing before the Aquilifer', 'to the forum');
    await homeFromForum(j);
    expect(ended(j)).toBe(true);
    expect(j.page).toContain('has a gold wing, and the Hearth has barred its granary');
  }, T);

  it('ends in The Cohort Reached and Left when only the granary was told', async () => {
    const j = await start();
    await toForum(j);
    await interview(j);
    await j.play('Into the Archive', 'Ask Ede what she wants of you', 'Say that you will, if she will stand beside you when you do');
    await j.play('to the forum', 'To the barracks yard', 'To the granary', 'Tell the granary-reeve that the empire is gone');
    await j.play('to the barracks yard', 'to the forum');
    await homeFromForum(j);
    expect(ended(j)).toBe(true);
    expect(j.page).toContain('A sixth of the barley that goes north in the spring will not go now');
  }, T);

  it('ends with One Fewer, and the bell not rung, when Ione keeps the shrine', async () => {
    const j = await start();
    await ford(j, 'none');
    await j.play('To the head of the Old Causeway', 'To the long middle of the causeway', 'a torch: Light', 'Stand together with lit torches, and let the pack look at the flame',
      'To the end of the causeway', 'To the Mansio Septimus', 'To the mouth of the Gallery', 'Ask Sister Ione what she believes', 'Say that you believe in the road, whoever made it');
    expect(j.holds('travelsWith', 'ione', 'party')).toBe(true);
    await j.play('To the Mansio Septimus', '=day 2 05:00', 'To the foot of the High Road', 'To the open stretch of the High Road', 'To the Mansio Octavius',
      'Unbuckle the scribe\'s satchel', 'a scribe\'s glossary of the old script: Take from the scribe\'s satchel');
    await j.play(steps.viaduct[0], 'Ask Sister Ione whether she will take the line over the parapet', 'Argue that a god who made stone also made the hands that drive pitons');
    expect(j.holds('ioneSafe', 'party')).toBe(true);
    await j.play(...steps.viaduct.slice(1));
    await j.play(...steps.to_pass, ...steps.giant, 'To the head of the descent', ...steps.deserters, ...steps.gate.slice(1), 'To the forum');
    await j.play('Ask Sister Ione what she will do now she has seen the last stone', 'Say that the valley wants a shrine, and a keeper who knows the old words');
    expect(j.holds('ioneKeeper', 'party')).toBe(true);
    await j.play('To the gate of the Last Cohort', 'To the Long Descent', ...homeNoRope.slice(3).map(x => /light a torch/.test(x) ? '?a torch: Light' : x));
    expect(ended(j)).toBe(true);
    expect(j.page).toContain('second lamp in the window without saying for whom');
  }, T);

  it('ends with the First Century at the trough when the Centurion alone is told', async () => {
    const j = await start();
    await toForum(j);
    await j.play('To the barracks yard', 'Tell the Centurion that the empire is gone');
    expect(j.holds('told_merula', 'party')).toBe(true);
    await j.play('to the forum');
    await homeFromForum(j);
    expect(ended(j)).toBe(false);
    await j.play('=+900');
    expect(ended(j)).toBe(true);
    expect(j.page).toContain('Six red cloaks halt at the trough');
  }, T);

  it('ends with One Fewer, and no name for it, when Fenn takes the survey and goes his own way', async () => {
    const j = await start();
    await toEagle(j, 'fenn');
    await j.play('Ask Fenn what he has found in the Eagle\'s wall', 'Say it should be Thessaly Orde\'s, or the engineer\'s, whoever\'s it was: write down who');
    await j.play(...steps.to_pass, ...steps.giant, 'To the head of the descent', ...steps.deserters, ...steps.gate.slice(1), 'To the forum');
    await j.play('Into the Archive', 'Tell Fenn the Archivist will print the survey, and ask whose name goes on it', 'Tell it is his survey, and the Archive may do as it likes with the credit'.slice(0, 0) + 'Tell him it is his survey, and the Archive may do as it likes with the credit');
    expect(j.holds('fennGone', 'party')).toBe(true);
    await j.play('to the forum', 'To the gate of the Last Cohort', 'To the Long Descent', ...homeNoRope.slice(3).map(x => /light a torch/.test(x) ? '?a torch: Light' : x));
    expect(ended(j)).toBe(true);
    expect(j.page).toContain('came back to the Ford one fewer');
  }, T);
});

describe('The road\'s beasts, and a way round each', () => {
  it('lets a pelt pay the wolf-widow, but only for one who asked her story', async () => {
    const j = await start();
    await j.play(...steps.prepare_light);
    await j.play('Into the Last Fire', 'Ask Greta about the wolf\'s pelt on the wall', 'Ask Greta whether the she-wolf has ever been paid');
    expect(j.holds('widowAnswered', 'party')).toBe(true);
    await j.play('pelt on the inn wall: Take', 'Out to Kell green', 'To the head of the Old Causeway', 'To the long middle of the causeway');
    j.roll('pass');
    await j.play('Lay the old male\'s pelt on the causeway for the widow, and walk on without looking back');
    expect(j.holds('pelt_laid', 'party')).toBe(true);
    expect(j.holds('wolvesTolerated', 'party')).toBe(true);
    const k = await start();
    await k.play(...steps.prepare_light);
    await k.play('Into the Last Fire', 'pelt on the inn wall: Take', 'Out to Kell green', 'To the head of the Old Causeway', 'To the long middle of the causeway');
    expect(k.find('Lay the old male')).toBeUndefined();
  }, T);

  it('lets the goat show the steep at the track and the shale at the Pass', async () => {
    const j = await start();
    await ford(j);
    await j.play('To the goatherds\' track', 'Follow the ridge-goat up the steep, setting your feet where it sets its hooves');
    expect(j.at('party')).toBe('muster__track2');
    const k = await start();
    await toEagle(k);
    await k.play(...steps.to_pass, 'Follow the ridge-goat up the shale, in its steps');
    expect(k.holds('state', 'goat_slide', 'trodden')).toBe(true);
  }, T);

  it('lets the wyvern\'s nest be robbed while it hunts, and sends it back at a thief with its tooth', async () => {
    const j = await start();
    // The harness (six coin) fits the purse even after the whole kit (22 - 15 = 7), and leaves one coin; here it is bought first, with no tent, rope or pitons.
    await j.play('To Kell green', 'Into Pryor\'s store', 'Buy › A climber\'s harness', 'Out to Kell green', ...steps.hire, 'a climber\'s harness: Equip');
    await j.play('To the goatherds\' track', 'To the steep of the track', 'To the Mansio Septimus', '=day 2 05:00', 'To the foot of the High Road', 'To the open stretch of the High Road', 'To the wyvern\'s eyrie');
    await j.play('Wait › A while');
    expect(j.holds('wyvernOut', 'wyvern')).toBe(true);
    expect(j.find('rotted cord')).toBeDefined();
    await j.play('a shed tooth, long as a finger: Take');
    await j.play('Wait › A while');
    expect(j.holds('wyvernOut', 'wyvern')).toBe(false);
    expect(j.at('muster__wyvern')).toBe('muster__eyrie');
  }, T);

  it('lets the kites be read for the parapet', async () => {
    const j = await start();
    await toOctavius(j);
    await j.play('To the north head of the Viaduct', 'Watch where the kites settle, and where they will not');
    expect(j.holds('state', 'parapet_wind', 'rigged')).toBe(true);
  }, T);
});

describe('Six things on the road that lead nowhere', () => {
  it('lets Orde\'s studs be walked and Quintus followed to where he stopped', async () => {
    const j = await start();
    await ford(j);
    await j.play('To the goatherds\' track', 'To the steep of the track', 'To the Mansio Septimus', 'To the Ledge');
    j.roll('pass');
    await j.play('Follow the survey studs and set your feet by the numbers');
    expect(j.holds('stonesFound', 'party')).toBe(true);
    await j.play('To the end of the Ledge', 'To the Mansio Octavius', 'Unbuckle the scribe\'s satchel', 'a scribe\'s glossary of the old script: Take from the scribe\'s satchel');
    await j.play('Ask Marra what she is looking for on the far side', 'Say that you would want to know, whatever it was');
    await j.play(...steps.viaduct);
    await j.play('To the sheltered hollow');
    j.roll('pass');
    await j.play('Follow the Q-marks behind the fort into the thorn');
    expect(j.holds('quintusFound', 'party')).toBe(true);
  }, T);

  it('lets Viator be honoured at the Gallery mouth, and told once the road has been seen', async () => {
    const j = await start();
    await ford(j, 'none');
    await j.play('To the head of the Old Causeway', 'To the long middle of the causeway', 'a torch: Light', 'Stand together with lit torches, and let the pack look at the flame',
      'To the end of the causeway', 'To the Mansio Septimus', 'To the mouth of the Gallery');
    j.roll('pass');
    await j.play('Leave a boot-nail in the dish for Viator, and say the old words for those who go in');
    expect(j.holds('state', 'third_arch', 'found')).toBe(true);
    await j.play('To the Mansio Septimus', '=day 2 05:00', 'To the foot of the High Road', 'To the open stretch of the High Road', 'To the Mansio Octavius');
    await j.play('To the open stretch of the High Road', 'To the foot of the High Road', 'To the Mansio Septimus', 'To the mouth of the Gallery');
    j.roll('pass');
    await j.play('Tell Viator what you saw on the road, as the old rule asks of those who come out');
    expect(j.holds('knows', 'party', 'viator_told')).toBe(true);
  }, T);

  it('lets the unnumbered mile be dug', async () => {
    const j = await start();
    await j.play(...steps.prepare_light);
    await j.play('Into Pryor\'s store', 'Buy › A shovel', 'Out to Kell green', 'To the head of the Old Causeway', 'To the long middle of the causeway', 'a torch: Light',
      'Stand together with lit torches, and let the pack look at the flame');
    j.roll('pass');
    await j.play('Pace out the unnumbered mile and dig where the heather will not grow');
    expect(j.holds('graveDug', 'party')).toBe(true);
  }, T);

  it('lets the goatherds\' spring be settled, and a failed word cost a ration and be final', async () => {
    const j = await start();
    await ford(j);
    await j.play('To the goatherds\' track', 'To the spring on the goatherds\' shelf', 'Ask Anselm Hartnoll what the quarrel is about',
      'Say you would ask Marra, because she asked you first');
    j.roll('pass');
    await j.play('Persuade the old man to ask Marra\'s mother for the water, as a courtesy, and her to give it');
    expect(j.holds('springSettled', 'party')).toBe(true);
    const k = await start();
    await ford(k);
    await k.play('To the goatherds\' track', 'To the spring on the goatherds\' shelf', 'Ask Anselm Hartnoll what the quarrel is about',
      'Say you would ask Marra, because she asked you first');
    const before = k.measure('quantity', 'party', 'rations');
    k.roll('fail');
    await k.play('Persuade the old man to ask Marra\'s mother for the water, as a courtesy, and her to give it');
    expect(k.holds('springSnubbed', 'party')).toBe(true);
    expect(k.measure('quantity', 'party', 'rations')).toBe(before - 1);
    expect(k.find('Persuade the old man')).toBeUndefined();
  }, T);

  it('brings Jory home to Kell if Marra is told that both should go', async () => {
    const j = await start();
    await toForum(j);
    await j.play('Into the apothecary', 'Show Marra the boy who sorts Dame Orsa\'s herbs', 'Say that they should both go home, and tell Kell Ford what is here', 'to the forum');
    expect(j.holds('marraBoth', 'party')).toBe(true);
    await homeFromForum(j);
    expect(j.at('muster__jory')).toBe('muster__green');
  }, T);

  it('lets Dunya report the deserters, and choose the Cohort over the Ford at the Last Fire', async () => {
    const j = await start();
    await toForum(j, 'none');
    await interview(j);
    await j.play('To the Praetorium', 'Tell the Prefect that the empire is gone', 'to the forum', 'To the barracks yard', 'Ask the Centurion for a scout');
    expect(j.holds('scoutGiven', 'party')).toBe(true);
    await j.play('Ask Dunya to join the company', 'to the forum', 'To the gate of the Last Cohort', 'To the Long Descent');
    await j.play('To the head of the descent', 'Ask Dunya who the men at the head of the Descent are', 'Tell her that duty is duty, and that his mother is owed the truth');
    expect(j.holds('dunyaReported', 'party')).toBe(true);
    await j.play(...homeNoRope.slice(4).map(x => /light a torch/.test(x) ? '?a torch: Light' : x));
    await j.play('Ask Dunya what she sees in Kell Ford', 'Say that it is enough: it is where people are');
    await j.play('Into the Last Fire', 'Ask Dunya whether she means to go back to the Cohort, now she has seen the Ford', 'Tell her to go back and report what she has seen');
    expect(j.holds('dunyaHome', 'party')).toBe(true);
  }, T);
});

describe('The weather over the Fells', () => {
  it('is turned back at the gorge by a thaw', async () => {
    const j = await start();
    await j.play(...steps.prepare_light);
    await untilSky(j, 'thaw_sky');
    await j.play(...steps.gorge);
    expect(j.find('To the flooded bend')).toBeUndefined();
    await j.play(...steps.back);
    expect(j.at('party')).toBe('muster__green');
  }, T);

  it('closes the Ledge under snow', async () => {
    const j = await start();
    await ford(j);
    await j.play('To the goatherds\' track', 'To the steep of the track', 'To the Mansio Septimus');
    await untilSky(j, 'snow_sky');
    await j.play('To the Ledge');
    expect(j.find('^To the end of the Ledge$')).toBeUndefined();
  }, T);

  it('stoops on the open road at noon, and is kept down by a high wind', async () => {
    const walk = async (sky: string) => {
      const j = await start();
      await ford(j);
      await j.play('To the goatherds\' track', 'To the steep of the track', 'To the Mansio Septimus');
      await untilSky(j, sky);
      await j.play('To the foot of the High Road', 'To the open stretch of the High Road', 'Wait › A while');
      return j;
    };
    expect((await walk('wind_sky')).holds('stooped', 'party')).toBe(false);
    expect((await walk('clear_sky')).holds('stooped', 'party')).toBe(true);
  }, T);
});

describe('Every way of keeping Dunya ends', () => {
  // Dunya joined in the valley (the Prefect told, the Centurion asked for a scout), walked to the Descent with the company.
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
    expect(j.find('Ask Fenn Hallam to join the company')).toBeUndefined();
  }, T);
});

