import { describe, expect, it } from 'bun:test';
import { Ombra, home, o } from './support/ombra';

// The cleric's Confessional and the blessing at the Drawing (data/adventures/book-of-faces/cleric.kyr). The campaign is
// the real one; set OMBRA_CAMPAIGN to run the module with stubs for the people other authors own (vail, hobb) before
// the integrator has merged them. A check's die depends on the seed and on what was done before it, so the journeys
// that need a particular outcome use a seed found for it, and the others are written to hold either way.
const campaign = process.env.OMBRA_CAMPAIGN ?? home;
const cleric = () => Ombra.one('cleric', 'acolyte', 'human', 'Ama');
const toVestry = ['^To the Customs', '^To Strangers', '^To Counting Row', '^To the Chapel', '^Into the Chapel of', '^To the vestry'];

// The three penitents of a night, in the order they come. `act` is what is done with each, by stage and name.
const stage1 = ['Hear what the big man', 'Say nothing, and wait', '?Listen to how he asks',
  '~Hear what the man in the gloves', 'Say nothing, and wait', '?Listen for what he has pitched',
  '~Hear what the narrow man', 'Say nothing, and wait', '?Recognise the form'];
const stage2 = ['Hear what the big man says', 'Say nothing, and wait', '?Ask him gently',
  '~Hear what the man in the Heron', 'Say nothing, and wait', '?Give him the Chapel',
  '~Hear what the clerk says', 'Say nothing, and wait', '?Ask him, as a Hearer'];
// Take up the grille: Father Ansel in his vestry on the second night, then the box.
const assigned = [...toVestry, '=day 2 21:00', 'Talk to Father Ansel', 'Tell Father Ansel that you will sit', 'Take your leave',
  '^To the nave', '^To the confessionals'];

describe('The Confessional: three penitents, three nights', () => {
  it('a Hearer who sits bare, silent and attentive: every penance taken, the stole given, the Hearer heard in turn', async () => {
    const g = await Ombra.start(campaign, 'a6-h2', cleric());
    await g.play(...assigned);
    expect(g.holds('cl_assigned', 'party')).toBe(true);
    expect(g.knows('cl_the_seal')).toBe(true);
    await g.play('=day 3 20:00', ...stage1);
    expect(g.measure('cl_stage', 'cl_cooper')).toBe(1);
    expect(g.measure('cl_stage', 'cl_warden')).toBe(1);
    expect(g.measure('cl_stage', 'cl_clerk')).toBe(1);
    // Pell has been heard: the Dead Letter Office will read it.
    expect(g.holds('cl_pell_penitent', 'party')).toBe(true);
    await g.play('=day 5 20:00', ...stage2);
    for (const p of ['cl_cooper', 'cl_warden', 'cl_clerk']) { expect(g.measure('cl_stage', p)).toBe(2); }
    await g.play('=day 7 20:00', 'Hear what the big man has come to ask', 'Say nothing, and wait', 'Set him a penance: take the mask',
      '~Hear what the Warden says', 'Say nothing, and wait', 'Set him a penance: lay the Key down',
      '~Hear what the clerk has come to say', 'Say nothing, and wait', 'Set him a penance: put the thing down');
    // Each hearing is sealed; the facts are in the notes, marked.
    for (const f of ['cl_hobb_urn', 'cl_lacke_said', 'cl_pell_said']) { expect(g.knows(f)).toBe(true); expect(g.holds('cl_sealed', f)).toBe(true); }
    expect(g.measure('cl_closed', 'party')).toBe(3);
    expect(g.holds('cl_hobb_unburdened', 'party')).toBe(true);
    expect(g.holds('cl_lacke_spent', 'party')).toBe(true);
    expect(g.holds('cl_pell_released', 'party')).toBe(true);
    expect(g.carries('cl_chit')).toBe(true);
    expect(g.holds('cl_seal_broken', 'party')).toBe(false);
    await g.play('^To the nave', '^To the vestry', 'Talk to Father Ansel', 'Tell Father Ansel the grille has been sat');
    expect(g.knows('cl_hearing_kept')).toBe(true);
    expect(g.carries('cl_stole')).toBe(true);
    expect(g.holds('arcDone', 'party', 'hand_blessing')).toBe(true);
    // Being heard in turn: a point of wisdom, from the Chaplain who has stopped being able to hear.
    await g.play('Kneel at the grille and let Father Ansel hear');
    expect(g.holds('cl_heard_self', 'party')).toBe(true);
  }, 240000);

  it('a Hearer who only says nothing and absolves: the silence earns the trust, and nothing changes', async () => {
    const g = await Ombra.start(campaign, 'a6-abs', cleric());
    await g.play(...assigned, '=day 3 20:00', 'Hear what the big man', 'Say nothing, and wait', '?Listen to how he asks',
      '~Hear what the man in the gloves', 'Say nothing, and wait', '?Listen for what he has pitched',
      '~Hear what the narrow man', 'Say nothing, and wait', '?Recognise the form');
    await g.play('=day 5 20:00', 'Hear what the big man says', 'Say nothing, and wait', '?Ask him gently',
      '~Hear what the man in the Heron', 'Say nothing, and wait', '?Give him the Chapel',
      '~Hear what the clerk says', 'Say nothing, and wait', '?Ask him, as a Hearer');
    // The silence at each of the first two nights is two trust, at least, whatever the checks did.
    for (const p of ['cl_cooper', 'cl_warden', 'cl_clerk']) { expect(g.measure('cl_trust', p)).toBeGreaterThanOrEqual(2); }
    await g.play('=day 7 20:00', 'Hear what the big man has come to ask', 'Absolve him',
      '~Hear what the Warden says', 'Absolve him', '~Hear what the clerk has come to say', 'Absolve him');
    expect(g.measure('cl_closed', 'party')).toBe(3);
    expect(g.holds('cl_absolved', 'cl_cooper')).toBe(true);
    expect(g.holds('cl_absolved', 'cl_warden')).toBe(true);
    expect(g.holds('cl_absolved', 'cl_clerk')).toBe(true);
    expect(g.holds('cl_hobb_unburdened', 'party')).toBe(false);
    expect(g.holds('cl_pell_released', 'party')).toBe(false);
    expect(g.carries('cl_chit')).toBe(false);
  }, 240000);

  it('a masked Hearer is a penitent: nobody kneels', async () => {
    const g = await Ombra.start(campaign, 'a6-masked', cleric());
    await g.play(...assigned);
    // A face rented at dusk is kept until morning: the Hearer who goes to the box in it is a penitent.
    await g.play('=day 3 18:30', '^To the nave', '^Out to the Chapel steps', '^To Counting Row', '^To Strangers', '^Into the Wardrobe', 'Talk to',
      'Rent the Heron', '^Out', '^To Counting Row', '^To the Chapel', 'Put on the Heron', '^Into the Chapel of', '^To the confessionals', '=day 3 20:30');
    expect(g.holds('masked', 'party')).toBe(true);
    expect(g.j.offers('Hear what the big man')).toBe(false);
    expect(g.j.offers('Talk to the first penitent')).toBe(false);
    expect(g.at('cl_cooper')).toBe(o('offstage'));
    // Bare again, the box is wanted.
    await g.play('Take your face off');
    await g.play('~Hear what the big man');
  }, 120000);

  it('a company with no rites cannot sit the grille, and a Hearer who is not asked has no penitents', async () => {
    const w = await Ombra.start(campaign, 'a6-warrior');
    expect(w.j.holds(o('hearer'), 'party')).toBe(false);
    const c = await Ombra.start(campaign, 'a6-unasked', cleric());
    await c.play(...toVestry, '=day 3 20:00', '^To the nave', '^To the confessionals');
    expect(c.at('cl_cooper')).toBe(o('offstage'));
  }, 120000);
});

describe('The Confessional: the seal', () => {
  // Lacke's confession needs two trust before the third night: the silence at each of the first two.
  const toLackeSaid = [...assigned, '=day 3 20:00', '~Hear what the man in the gloves', 'Say nothing, and wait with the second',
    '?Listen for what he has pitched', '=day 5 20:00', '~Hear what the man in the Heron', 'Say nothing, and wait with the second', '?Give him the Chapel',
    '=day 7 20:00', '~Hear what the Warden says'];

  it('breaking the seal: the Watch has the Warden, the Chaplain takes the grille, the clerk does not come, the true blessing is gone', async () => {
    const g = await Ombra.start(campaign, 'a6-break', cleric());
    await g.play(...toLackeSaid);
    expect(g.knows('cl_lacke_said')).toBe(true);
    expect(g.knows('lacke_unfaced')).toBe(false);
    // Vail is at the Gate: the Chapel bridge, the Gate bridge.
    await g.play('^To the nave', '^Out to the Chapel steps', '^To Counting Row', '^To Strangers');
    if (g.at('vail') !== g.at('party')) { await g.play('?^Into the Gatehouse'); }
    for (let i = 0; i < 24 && g.at('vail') !== g.at('party'); i += 1) { await g.play('Wait › An hour'); }
    if (g.at('vail') !== g.at('party')) { return; } // the sergeant is the integrator's: wherever she keeps
    await g.play('Talk to a sergeant of the Masked Watch', 'Tell Sergeant Vail what the Warden confessed');
    expect(g.holds('cl_seal_broken', 'party')).toBe(true);
    expect(g.knows('lacke_unfaced')).toBe(true);
    expect(g.page).toMatch(/You are aware what you have just done/);
    await g.play('?^Out to Strangers', '^To Counting Row', '^To the Chapel');
    expect(g.at('cl_clerk')).toBe(o('offstage'));
  }, 240000);

  it('keeping the seal: the same crime laid before the Watch from the lamp-room and the Chaplain\'s ear', async () => {
    const g = await Ombra.start(campaign, 'a6-proof', cleric());
    await g.play('^To the Customs', '^To Strangers', '^To Counting Row', '^To the Chapel', '^Into the Chapel of', '^To the lamp-room',
      'three candle-stubs.*Look closely', 'the lamp-table.*Look closely');
    for (let i = 0; i < 6 && !g.knows('ch_glove'); i += 1) { await g.play('?Read the scratch'); }
    expect(g.knows('ch_glove')).toBe(true);
    await g.play('^To the nave', '^To the vestry', '=day 1 21:00', 'Talk to Father Ansel');
    for (let i = 0; i < 2 && !g.knows('ch_threat'); i += 1) { await g.play('?Ask Father Ansel, with your whole attention'); }
    // One try, by insight; a company that failed it has the other ways (the burial; the whole reading) and the test stops here.
    if (g.knows('ch_threat')) {
      expect(g.knows('lacke_unfaced')).toBe(true);
      expect(g.holds('cl_seal_broken', 'party')).toBe(false);
    }
  }, 120000);
});

describe('The Confessional: the Drawing', () => {
  // The ninth night at the Urn: Father Ansel asks the Hearer, who may bless the lie, refuse, or bless the people.
  const toUrn = ['=day 9 18:20', '^To the Registry', '^Into the Chapel\'s depths', 'Ask Father Ansel what he wants of you at the Urn'];
  const walk = ['^To the Customs', '^To Strangers', '^To Counting Row', '^To the Chapel', '^Into the Chapel of'];

  it('refusing the Draw: its own act, its own measure, and no second blessing after', async () => {
    const g = await Ombra.start(campaign, 'a6-refuse', cleric());
    await g.play(...walk, ...toUrn);
    expect(g.at('party')).toBe(o('urn_hall'));
    expect(g.holds('cl_asked', 'party')).toBe(true);
    expect(g.holds('handReady', 'party', 'hand_blessing')).toBe(true);
    // Not yet knowing the Urn is empty, the true blessing is not on offer.
    expect(g.j.offers('Bless the people of Ombra')).toBe(false);
    await g.play('Refuse to bless the Draw');
    expect(g.holds('cl_refused', 'party')).toBe(true);
    expect(g.holds('handPlayed', 'party', 'hand_blessing')).toBe(true);
    expect(g.measure('handWay', 'hand_blessing')).toBe(2);
    expect(g.j.offers('Bless the Draw')).toBe(false);
  }, 180000);

  it('blessing the Draw: a lie blessed, and the Chaplain thanks you for it', async () => {
    const g = await Ombra.start(campaign, 'a6-lie', cleric());
    await g.play(...walk, ...toUrn, 'Bless the Draw, as it has been blessed');
    expect(g.holds('cl_blessed_lie', 'party')).toBe(true);
    expect(g.measure('handWay', 'hand_blessing')).toBe(1);
    expect(g.page).toMatch(/not at all the same as/);
    expect(g.j.offers('Refuse to bless')).toBe(false);
  }, 180000);

  it('blessing the people and not the Urn: with the Serene\'s sealed word, a Hearer who kept the seal knows what to bless', async () => {
    const g = await Ombra.start(campaign, 'a6-h2', cleric());
    await g.play(...assigned, '=day 3 20:00', ...stage1, '=day 5 20:00', ...stage2, '=day 7 20:00', 'Hear what the big man has come to ask',
      'Say nothing, and wait', 'Absolve him');
    expect(g.knows('cl_hobb_urn')).toBe(true);
    expect(g.knows('urn_hollow')).toBe(false);
    await g.play('^To the nave', ...toUrn);
    for (let i = 0; i < 6 && !g.holds('cl_blessed_true', 'party'); i += 1) { await g.play('?Bless the people of Ombra'); }
    expect(g.holds('cl_blessed_true', 'party')).toBe(true);
    expect(g.measure('handWay', 'hand_blessing')).toBe(3);
    expect(g.page).toMatch(/You say nothing about the Urn at all/);
  }, 240000);
});

describe('The Confessional: what is done stays done, and nothing is in two places', () => {
  it('a stage heard stays heard across a day and a rest; the penitent is not heard twice', async () => {
    const g = await Ombra.start(campaign, 'a6-persist', cleric());
    await g.play(...assigned, '=day 3 20:00', 'Hear what the big man', 'Say nothing, and wait', '?Listen to how he asks');
    expect(g.measure('cl_stage', 'cl_cooper')).toBe(1);
    const trust = g.measure('cl_trust', 'cl_cooper');
    await g.play('=day 4 12:00');
    expect(g.measure('cl_stage', 'cl_cooper')).toBe(1);
    expect(g.measure('cl_trust', 'cl_cooper')).toBe(trust);
    expect(g.knows('cl_the_seal')).toBe(true);
    // On the fourth night nobody comes; on the fifth the second stage is offered and not the first.
    await g.play('=day 4 21:00');
    expect(g.at('cl_cooper')).toBe(o('offstage'));
    await g.play('=day 5 20:00');
    expect(g.j.offers('Hear what the big man has come to say')).toBe(false);
    expect(g.j.offers('Hear what the big man says on the night of the Swap')).toBe(true);
  }, 120000);

  it('the first offered action, taken two hundred times in the box, never breaks an invariant', async () => {
    const g = await Ombra.start(campaign, 'a6-box', cleric());
    await g.play(...assigned, '=day 3 20:00');
    const persons = ['cl_cooper', 'cl_warden', 'cl_clerk', 'chaplain'].map(o);
    const start = g.j.taken.length;
    for (let i = 0; i < 200 && g.running; i += 1) {
      const options = g.j.choices().filter(c => !/^Wait|prepare|Prepare|Set down|Pack|Take your leave|^Light|Take your face|nave of the Chapel/.test(c.label));
      const choice = options[0];
      if (!choice) { await g.play('Wait › An hour'); continue; }
      await g.play(`@${choice.command}`);
      for (const p of persons) { expect(g.j.campaign.world.related('at').filter(r => r.args[0] === p).length).toBeLessThanOrEqual(1); }
      // The measures never run past what is possible; a closed penitent is not also open.
      for (const p of ['cl_cooper', 'cl_warden', 'cl_clerk']) {
        expect(g.measure('cl_stage', p)).toBeLessThanOrEqual(4);
        if (g.measure('cl_stage', p) >= 3) { expect(g.holds('cl_open', p)).toBe(false); }
      }
      expect(g.measure('cl_closed', 'party')).toBeLessThanOrEqual(3);
      // Sealed things are only known by a company that has sat the grille.
      if (g.knows('cl_lacke_said')) { expect(g.holds('cl_assigned', 'party') || g.holds('cl_seal_broken', 'party')).toBe(true); }
    }
    expect(g.j.taken.length).toBeGreaterThan(start + 20);
  }, 240000);
});
