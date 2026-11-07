import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Long Muster's Road, after the rewrite: its beasts and their ways round, its side quests, its four companions
// and their beats, the valley's questions and the five tellings. Positions and facts are staged where the road to
// them is another spec's (muster.test.ts walks the road).
const campaign = 'data/campaigns/muster.campaign.json';
const start = () => Journey.start(campaign, 'muster');

describe('The road\'s beasts, and a way round each', () => {
  it('lets a lit flame hold the wolves, a pelt pay the widow, and the goat show the shale', async () => {
    const j = await start();
    j.put('party', 'causeway1');
    await j.play('=22:00', 'Pack › A torch › Light', 'To the long middle of the causeway');
    await j.play('Stand together with lit torches, and let the pack look at the flame');
    expect(j.holds('tolerates', 'wolves', 'party')).toBe(true);
    const k = await start();
    k.put('party', 'pass_n');
    await k.play('Follow the ridge-goat up the shale, in its steps');
    expect(k.holds('state', 'goat_slide', 'trodden')).toBe(true);
    await k.play('Wait › A while');
    k.put('party', 'track1');
    await k.play('Follow the ridge-goat up the steep, setting your feet where it sets its hooves');
    expect(k.at('party')).toBe('muster__track2');
  }, 200000);

  it('lets the wyvern\'s nest be robbed while it hunts, and the kites read for the parapet', async () => {
    const j = await start();
    await j.play('=12:00');
    j.put('party', 'eyrie');
    await j.play('Wait › A while');
    expect(j.holds('wyvernOut', 'wyvern')).toBe(true);
    expect(j.find('rotted cord')).toBeDefined();
    const k = await start();
    k.put('party', 'via_n');
    await k.play('Watch where the kites settle, and where they will not');
    expect(k.holds('state', 'parapet_wind', 'rigged')).toBe(true);
  }, 200000);

  it('lets the deserters be passed by a letter, and tells whom it was for', async () => {
    const j = await start();
    j.give('marcus_letter_item');
    j.put('party', 'pass_s');
    await j.play('Hold up the pouch addressed to the Centurion Lucilla Merula');
    expect(j.holds('tolerates', 'deserters', 'party')).toBe(true);
    expect(j.holds('marcusMet', 'party')).toBe(true);
  }, 200000);
});

describe('Six things on the road that lead nowhere', () => {
  it('lets Quintus be followed, Viator honoured, and Orde\'s studs walked', async () => {
    const j = await start();
    for (const f of ['quintus_1', 'quintus_2', 'quintus_3']) { j.assert('knows', 'party', f); }
    j.put('party', 'hollow');
    j.roll('pass');
    await j.play('Follow the Q-marks behind the fort into the thorn');
    expect(j.holds('quintusFound', 'party')).toBe(true);
    j.put('party', 'gallery1');
    await j.play('Leave a boot-nail in the dish for Viator, and say the old words for those who go in');
    expect(j.holds('state', 'third_arch', 'found')).toBe(true);
    j.assert('knows', 'party', 'orde_known');
    j.put('party', 'ledge1');
    await j.play('Follow the survey studs and set your feet by the numbers');
    expect(j.holds('stonesFound', 'party')).toBe(true);
  }, 200000);

  it('lets the unnumbered mile be dug and Viator be told', async () => {
    const j = await start();
    await j.play('To Kell green', "Into Pryor's store", 'Buy › A shovel', 'Out to Kell green');
    j.assert('knows', 'party', 'milepost_known');
    j.put('party', 'causeway2');
    j.roll('pass');
    await j.play('Pace out the unnumbered mile and dig where the heather will not grow');
    expect(j.holds('graveDug', 'party')).toBe(true);
    j.assert('viatorHonoured', 'party');
    j.assert('been', 'party', 'octavius_hall');
    j.put('party', 'gallery1');
    await j.play('Tell Viator what you saw on the road, as the old rule asks of those who come out');
    expect(j.holds('knows', 'party', 'viator_told')).toBe(true);
  }, 200000);

  it('lets the goatherds\' spring be settled and the widow be answered', async () => {
    const j = await start();
    j.put('party', 'spring');
    j.roll('pass');
    await j.play('Persuade the old man to ask Marra\'s mother for the water, as a courtesy, and her to give it');
    expect(j.holds('springSettled', 'party')).toBe(true);
    const k = await start();
    await k.play('To Kell green', "Into the Last Fire", 'Ask Maud about the wolf\'s pelt on the wall', 'Ask Maud whether the she-wolf has ever been paid');
    expect(k.holds('widowAnswered', 'party')).toBe(true);
  }, 200000);
});

describe('Four who go with the company', () => {
  it('lets Marra be told to stay, Fenn to share his credit, Dunya to report, Ione to wear the line', async () => {
    const j = await start();
    j.assert('travelsWith', 'marra', 'party');
    j.put('party', 'septimus_hall');
    await j.play('Ask Marra what she is looking for on the far side', 'Say that you would want to know, whatever it was');
    expect(j.measure('marraTrust', 'marra')).toBe(1);
    j.put('party', 'eagle');
    await j.play('Ask Marra about the letters on the arch', 'Tell her to come on: it is her brother\'s road too');
    expect(j.measure('marraTrust', 'marra')).toBe(3);
    j.put('party', 'apothecary');
    await j.play('Show Marra the boy who sorts Dame Orsa\'s herbs', 'Say that she should stay: he has a life here, and so would she');
    expect(j.holds('marraStaysCohort', 'party')).toBe(true);
    const k = await start();
    k.assert('travelsWith', 'dray', 'party');
    k.put('party', 'via_n');
    await k.play('Ask Fenn why he has stopped at the Viaduct\'s head', 'Tell him no: half the road is turning back, and he is the one who drew it');
    k.put('party', 'eagle');
    await k.play('Ask Fenn what he has found in the Eagle\'s wall', 'Say it should be Thessaly Orde\'s, or the engineer\'s, whoever\'s it was: write down who');
    expect(k.holds('fennCredit', 'party')).toBe(true);
    const m = await start();
    m.assert('travelsWith', 'dunya', 'party');
    m.assert('tolerates', 'deserters', 'party');
    m.put('party', 'pass_s');
    await m.play('Ask Dunya who the men at the head of the Descent are', 'Tell her that duty is duty, and that his mother is owed the truth');
    expect(m.holds('dunyaReported', 'party')).toBe(true);
    const n = await start();
    n.assert('travelsWith', 'ione', 'party');
    n.put('party', 'via_n');
    await n.play('Ask Sister Ione whether she will take the line over the parapet', 'Argue that a god who made stone also made the hands that drive pitons');
    expect(n.holds('ioneSafe', 'party')).toBe(true);
    n.put('party', 'forum');
    await n.play('Ask Sister Ione what she will do now she has seen the last stone', 'Say that the valley wants a shrine, and a keeper who knows the old words');
    expect(n.holds('ioneKeeper', 'party')).toBe(true);
  }, 290000);
});

describe('The Last Cohort asks, is answered, and is told', () => {
  it('lets the Prefect interview the company, and the standard be struck, kept, marched on or left', async () => {
    const j = await start();
    j.assert('admitted', 'party');
    j.put('party', 'praetorium_hall');
    await j.play('Let the Prefect put his first question', 'Say that nobody sent you: you came to see what the road led to',
      'Let the Prefect put his second question', 'Say that it looks heavy: that it looks like something people carry',
      'Let the Prefect put his last question', 'Say that you will not answer, because the answer is not yours to give');
    expect(j.measure('prefectRegard', 'party')).toBe(5);
    await j.play('Tell the Prefect that the empire is gone');
    expect(j.holds('state', 'standard', 'struck')).toBe(true);
    for (const [who, room, label, fact] of [
      ['moll', 'archive', 'Tell the Archivist what the road is', 'told_moll'],
      ['merula', 'barracks', 'Tell the Centurion that the empire is gone', 'told_merula'],
      ['elpis', 'granary', 'Tell the granary-reeve that the empire is gone', 'told_elpis']] as const) {
      const k = await start();
      k.assert('admitted', 'party');
      k.assert('piaVouched', 'party');
      k.assert('interviewQ3', 'party');
      k.put('party', room);
      await k.play(label);
      expect(k.holds(fact, 'party')).toBe(true);
      expect(who).toBeDefined();
    }
  }, 290000);

  it('lets the Tally be paid and the gold wing found, and the Annals open to those who ask', async () => {
    const j = await start();
    j.assert('admitted', 'party');
    j.coin(80);
    j.put('party', 'tally_yard');
    await j.play('Pay the clerk Hobbe Quarry\'s fine, thirty coin');
    expect(j.holds('knows', 'party', 'gold_known')).toBe(true);
    j.put('party', 'gold_cellar');
    await j.play('the gold wing of the old standard: Take');
    expect(j.holds('holding', 'party', 'golden_idol')).toBe(true);
    j.put('party', 'shrine');
    await j.play('Lay the gold eagle\'s wing before the Aquilifer');
    expect(j.holds('goldReturned', 'party')).toBe(true);
    expect(j.holds('state', 'standard', 'golden')).toBe(true);
    j.put('party', 'archive');
    j.assert('knows', 'party', 'rufus_1');
    await j.play('Ask the Archivist to open the Annals', 'Let the Archivist ask what it is you want of the Annals', 'Swear on the lamp of the shrine that you will not use it to harm the valley', 'Ask the Archivist about the year of the second wife', 'Ask the Archivist about the plague winter', 'Ask the Archivist about the Schism of the Standard');
    expect(j.holds('knows', 'party', 'schism_known')).toBe(true);
  }, 290000);

  it('sends a delegation to Kell Ford after the Archivist is told', async () => {
    const j = await start();
    j.assert('admitted', 'party');
    j.assert('interviewQ3', 'party');
    j.put('party', 'archive');
    await j.play('Tell the Archivist what the road is');
    j.put('party', 'green');
    await j.play('=+1600');
    expect(j.at('muster__delegates')).toBe('muster__green');
  }, 290000);
});

describe('A crossing, with its costs', () => {
  it('spends the pitons and the rope on the line, and shuts the fifth arch when the season turns', async () => {
    const j = await start();
    await j.play('To Kell green', "Into Pryor's store", 'Buy › A coil of rope', 'Buy › A piton', 'Out to Kell green');
    j.put('party', 'via_n');
    j.roll('pass');
    await j.play('Drive a piton into the parapet and rig a line over the gap with a coil of rope');
    expect(j.holds('lineFixed', 'party')).toBe(true);
    expect(j.holds('holding', 'party', 'piton')).toBe(false);
    await j.play('=day 9 08:00');
    expect(j.find('^To the parapet of the fifth arch$')).toBeUndefined();
  }, 200000);

  it('ends in a turning back, when the snow comes before the arch is crossed', async () => {
    const j = await start();
    j.put('party', 'octavius_hall');
    await j.play('=day 9 08:00');
    expect(j.holds('lateSeason')).toBe(true);
    // The chapter closes: the page offers nothing further.
    expect(j.choices().filter(c => !/Give to|Set down|prepare spells|Pack/.test(c.label))).toHaveLength(0);
  }, 200000);

  it('lets a baker\'s boy follow the company south if it has eaten his master\'s bread', async () => {
    const j = await start();
    j.put('party', 'pistrina');
    await j.play('Ask the baker why the bread tastes as it does');
    expect(j.holds('ateBread', 'party')).toBe(true);
    j.put('party', 'descent');
    await j.play('Wait › A while');
    expect(j.holds('following', 'tavi', 'party')).toBe(true);
  }, 200000);

  it('lets Fenn freeze at the north head and be found on the south side later', async () => {
    const j = await start();
    j.assert('travelsWith', 'dray', 'party');
    j.put('party', 'via_n');
    await j.play('Ask Fenn why he has stopped at the Viaduct\'s head', 'Tell him to wait at the north head; you will send word by the rope-way');
    expect(j.holds('fennNerve', 'party')).toBe(true);
    j.assert('knows', 'party', 'ropeway_known');
    j.put('party', 'via_s');
    await j.play('Wait › A while');
    expect(j.at('muster__dray')).toBe('muster__via_s');
  }, 200000);

  it('lets Dunya choose between the two ends of the road at the Last Fire', async () => {
    const j = await start();
    j.assert('travelsWith', 'dunya', 'party');
    j.assert('been', 'party', 'pass_s');
    j.assert('been', 'party', 'green');
    j.coin(0);
    j.put('party', 'green');
    await j.play('Ask Dunya what she sees in Kell Ford', 'Say that it is enough: it is where people are');
    expect(j.measure('dunyaTrust', 'dunya')).toBe(2);
    j.put('party', 'taproom');
    await j.play('Ask Dunya whether she means to go back to the Cohort, now she has seen the Ford', 'Tell her to go back and report what she has seen');
    expect(j.holds('dunyaHome', 'party')).toBe(true);
  }, 200000);

  it('brings Jory home to Kell if Marra is told that both should go', async () => {
    const j = await start();
    j.assert('travelsWith', 'marra', 'party');
    j.assert('been', 'party', 'apothecary');
    j.put('party', 'apothecary');
    await j.play('Show Marra the boy who sorts Dame Orsa\'s herbs', 'Say that they should both go home, and tell Kell Ford what is here');
    expect(j.holds('marraBoth', 'party')).toBe(true);
    j.put('party', 'green');
    await j.play('Wait › A while');
    expect(j.at('muster__jory')).toBe('muster__green');
  }, 200000);
});

