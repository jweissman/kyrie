import { describe, expect, it } from 'bun:test';
import { Ombra, home, o } from './support/ombra';

// Chapel Island (data/adventures/book-of-faces/chapel.kyr): the lamp-room's reconstruction of an evening, the
// stranger on the steps, the choir. The campaign is the real one; set OMBRA_CAMPAIGN to run the module with stubs
// for the people other authors own (rill, tibb, vail) before the integrator has merged them.
const campaign = process.env.OMBRA_CAMPAIGN ?? home;
const toChapel = ['^To the Customs', '^To Strangers', '^To Counting Row', '^To the Chapel'];
const cleric = () => Ombra.one('cleric', 'acolyte', 'human', 'Ama');
const reads = ['Read the candle-stubs', 'Read the scratch', 'Read the thread', 'Read what the broom', 'Read the mark', 'Read the knot'];
const looks = ['three candle-stubs.*Look closely', 'the lamp-table.*Look closely', 'mask-hooks.*Look closely',
  'floor by the door.*Look closely', 'dark under.*Look closely', 'silk cord.*Look closely'];
// A reading that fails may be tried again; five tries make it all but certain for a company with the skill.
const tries = (label: string) => Array(6).fill(`?${label}`);

describe('Chapel Island: the lamp-room', () => {
  it('a quick look gives a clean story that is wrong, and the full reading corrects it', async () => {
    const g = await Ombra.start(campaign, 'a6-lamp', cleric());
    await g.play(...toChapel, '^Into the Chapel of', '^To the lamp-room');
    expect(g.knows('marrick_dead')).toBe(true);
    await g.play(looks[0]!);
    // Three stubs and nothing else: the last visitor killed her. A half-truth, and a lead to the clerk who has the
    // Book.
    expect(g.knows('ch_quick_reading')).toBe(true);
    expect(g.page).toMatch(/is the man who killed her, or the man who most wanted it hid/);
    expect(g.knows('ch_evening')).toBe(false);
    await g.play(...looks.slice(1));
    for (const r of reads) { await g.play(...tries(r)); }
    expect(g.knows('ch_evening')).toBe(true);
    expect(g.page).toMatch(/Nobody killed her/);
    expect(g.page).toMatch(/she was dead before he came/);
    // The room alone gives the Serene, but not the Warden's threat or the boy's name.
    expect(g.knows('serene_saw')).toBe(true);
    expect(g.knows('lacke_unfaced')).toBe(false);
    expect(g.knows('pip_saw')).toBe(false);
  }, 120000);

  it('the glove and Father Ansel\'s ear make the Warden\'s crime provable without a seal; the hand and the boy\'s name make Pip', async () => {
    const g = await Ombra.start(campaign, 'a6-lamp2', cleric());
    await g.play(...toChapel, '^Into the Chapel of', '^To the lamp-room', ...looks);
    for (const r of reads) { await g.play(...tries(r)); }
    expect(g.knows('ch_evening')).toBe(true);
    // By night, bare, in the vestry: Father Ansel says what he heard once he knows the company has read the room.
    await g.play('^To the nave', '^To the vestry', '=day 1 21:00', 'Talk to Father Ansel');
    await g.play('Ask Father Ansel what he heard through the lamp-room door');
    expect(g.knows('ch_threat')).toBe(true);
    expect(g.knows('lacke_unfaced')).toBe(true);
    expect(g.page).toMatch(/You did not hear it from anyone under a seal/);
    // The boy: the child's hand and a ledger initial or the Owls' lamp-boy; here, the Chaplain's word to an Owl.
    expect(g.knows('pip_saw')).toBe(false);
  }, 120000);

  it('a company with no learning: the verger\'s pan and an Owl\'s face give what the skills would', async () => {
    const g = await Ombra.start(campaign, 'a6-nolore');
    // Wren, a warrior. Rents the Owl and wears it; helps the verger for an hour; asks the Hearer about the lamps.
    await g.play('^To the Customs', '^To Strangers', '^Into the Wardrobe', 'Talk to', 'Rent the Owl', '^Out',
      '^To Counting Row', '^To the Chapel', 'Put on the Owl', '^Into the Chapel of');
    await g.play('Ask Father Ansel about the Chapel\'s lamps');
    expect(g.knows('ch_boy_known')).toBe(true);
    await g.play('Ask Jonas Heddle why Father said to leave the floor');
    expect(g.knows('ch_jonas_pan')).toBe(true);
    await g.play('Help Jonas Heddle trim the Novena lamps');
    expect(g.knows('ch_cooper')).toBe(true);
    expect(g.holds('ch_jonas_helped', 'party')).toBe(true);
    expect(g.carries('ch_curls')).toBe(true);
    // The child's hand itself still wants a reading; but the name of the boy has been had.
    expect(g.knows('pip_saw')).toBe(false);
  }, 120000);

  it('a bare face by day gets one cold thing from each of the Chapel\'s people, and nothing else', async () => {
    const g = await Ombra.start(campaign, 'a6-cold');
    await g.play(...toChapel, '^Into the Chapel of');
    const offered = g.j.choices().map(c => c.label);
    expect(offered.filter(l => /^Speak to Father Ansel$/.test(l)).length).toBe(1);
    expect(offered.some(l => /Ask Father Ansel/.test(l))).toBe(false);
    await g.play('Speak to Father Ansel');
    expect(g.page).toMatch(/I am not able to hear one that has none/);
    await g.play('Speak to the verger');
    expect(g.page).toMatch(/Not paid to see you/);
  }, 60000);
});

describe('Chapel Island: the stranger on the steps', () => {
  it('left alone, the porter tips him into the Cuff on the fourth morning', async () => {
    const g = await Ombra.start(campaign, 'a6-cuff', cleric());
    await g.play(...toChapel);
    expect(g.page).toMatch(/tagged NINE/);
    await g.until(3 * 144 + 8);
    expect(g.holds('ch_cuffed', 'party')).toBe(true);
    expect(g.holds('ch_buried', 'party')).toBe(false);
    expect(g.page).toMatch(/tips the stranger off the bottom step/);
  }, 120000);

  it('by rite: the boot, the stole from Father Ansel at night, the office read on the water stairs', async () => {
    const g = await Ombra.start(campaign, 'a6-rite', cleric());
    await g.play(...toChapel, 'Look in the dead stranger\'s boot');
    expect(g.knows('ch_stranger_name')).toBe(true);
    await g.play('^Into the Chapel of', '^To the vestry', '=day 1 21:00', 'Talk to Father Ansel',
      'Ask Father Ansel for the burial stole', 'Take your leave', '^To the nave', '^Out to the Chapel steps');
    expect(g.holds('ch_stole', 'party')).toBe(true);
    for (let i = 0; i < 6 && !g.holds('ch_buried', 'party'); i += 1) { await g.play('?Read the office over the stranger'); }
    expect(g.holds('ch_buried', 'party')).toBe(true);
    expect(g.measure('ch_burial_way', 'party')).toBe(1);
    expect(g.holds('ch_ansel_trusts', 'party')).toBe(true);
    // A thing done stays done: the body is gone from the steps and the porter has nothing to tip on the fourth morning.
    await g.until(3 * 144 + 10);
    expect(g.holds('ch_cuffed', 'party')).toBe(false);
  }, 120000);

  it('by the reeds, at night: Father Ansel looks away, and the ground is the question', async () => {
    const g = await Ombra.start(campaign, 'a6-reeds', Ombra.one('warrior', undefined, 'human', 'Wren'));
    await g.play(...toChapel, 'Look in the dead stranger\'s boot', 'Take', '^Into the Chapel of', '^To the vestry', '=day 1 21:00');
    await g.play('Talk to Father Ansel', 'Tell Father Ansel that you mean to take the stranger');
    expect(g.holds('ch_leave', 'party')).toBe(true);
    expect(g.knows('ch_heron_ground')).toBe(true);
    // To the reeds: the Chapel bridge, the Mask bridge, the Rain-wives' bridge, the Heronry path, the reed path.
    await g.play('Take your leave', '^To the nave', '^Out to the Chapel steps', '^To Counting Row', '^To Maskers', '^To the Drip',
      '^To the Heronry', '^To the reed path');
    expect(g.at('party')).toBe(o('reed_path'));
    expect(g.carries('ch_body')).toBe(true);
    await g.play('?Find the firm ground', '?Find the firm ground', '?Find the firm ground');
    for (let i = 0; i < 6 && !g.holds('ch_buried', 'party'); i += 1) { await g.play('?Bury the stranger in the reeds'); }
    expect(g.holds('ch_buried', 'party')).toBe(true);
    expect(g.measure('ch_burial_way', 'party')).toBe(2);
    expect(g.carries('ch_body')).toBe(false);
  }, 180000);

  it('a ferryman carries what has a name, for a Gull; the Gull\'s goodwill rises and the Hospice sheet goes', async () => {
    const g = await Ombra.start(campaign, 'a6-ferry');
    if (!g.at('rill')) { return; } // rill is the drip author's: absent before the integrator's merge
    await g.play('^To the Customs', '^To Strangers', '^Into the Wardrobe', 'Talk to', 'Rent the Gull', '^Out',
      '^To Counting Row', '^To the Chapel', 'Put on the Gull', 'Look in the dead stranger\'s boot', 'Take');
    expect(g.carries('ch_body')).toBe(true);
    // Find Rill where she is, by the ferries, and ask her.
    const there = g.at('rill');
    expect(there).toBeDefined();
    await g.play('^To Counting Row', '^To Maskers', '^To the Drip');
    for (let i = 0; i < 20 && g.at('rill') !== g.at('party'); i += 1) { await g.play('Wait › An hour'); }
    if (g.at('rill') === g.at('party')) {
      await g.play('Talk to Rill', 'Ask Rill to carry the stranger');
      expect(g.holds('ch_buried', 'party')).toBe(true);
      expect(g.measure('ch_burial_way', 'party')).toBe(3);
      expect(g.measure('goodwill', 'face_gull')).toBe(1);
      expect(g.carries('ch_body')).toBe(false);
    }
  }, 180000);

  it('the name cried aloud: free to a bare company, one heat to a masked one', async () => {
    const bare = await Ombra.start(campaign, 'a6-cry', cleric());
    await bare.play(...toChapel, 'Look in the dead stranger\'s boot', 'Cry the stranger\'s name aloud');
    expect(bare.holds('ch_name_cried', 'party')).toBe(true);
    expect(bare.measure('heat', 'party')).toBe(0);
    const masked = await Ombra.start(campaign, 'a6-cry2', cleric());
    await masked.play('^To the Customs', '^To Strangers', '^Into the Wardrobe', 'Talk to', 'Rent the Heron', '^Out',
      '^To Counting Row', '^To the Chapel', 'Put on the Heron', 'Look in the dead stranger\'s boot', 'Cry the stranger\'s name aloud');
    expect(masked.holds('ch_name_cried', 'party')).toBe(true);
    expect(masked.measure('heat', 'party')).toBe(1);
    expect(masked.page).toMatch(/A domino of the Watch has come up the steps/);
  }, 120000);
});

describe('Chapel Island: the choir', () => {
  it('the children skip the Assessor of Weights; two shillings of almonds, or the Pound explained, mend it', async () => {
    const g = await Ombra.start(campaign, 'a6-choir', cleric());
    await g.play('^To the Customs', '^To Strangers', '^Into the Wardrobe', 'Talk to', 'Rent the Cockle', '^Out',
      '^To Counting Row', '^To the Chapel', 'Put on the Cockle', '^Into the Chapel of', '=14:00');
    // Day one, two in the afternoon: the choir is in the nave.
    expect(g.page).toMatch(/Mistress Odell|children/);
    const gold = g.gold();
    await g.play('Ask Mistress Odell why the children skip');
    expect(g.knows('ch_litany_gap')).toBe(true);
    await g.play('Promise the children honeyed almonds');
    expect(g.holds('ch_choir_ready', 'party')).toBe(true);
    expect(g.knows('ch_pound_sung')).toBe(true);
    expect(g.gold()).toBe(gold - 2);
  }, 120000);
});

describe('Chapel Island: nothing in the Chapel is in two places, or known that cannot be', () => {
  it('the first offered action, taken two hundred times from the lamp-room, never breaks an invariant', async () => {
    const g = await Ombra.start(campaign, 'a6-explore', cleric());
    await g.play(...toChapel, '^Into the Chapel of');
    const persons = ['chaplain', 'ch_verger', 'ch_corrow', 'ch_choir'].map(o);
    const before = g.j.taken.length;
    for (let i = 0; i < 200 && g.running; i += 1) {
      const options = g.j.choices()
        .filter(c => !/^Wait|prepare|Prepare|Set down|Pack|Take your leave|^Light/.test(c.label));
      const choice = options[i % Math.max(1, Math.min(options.length, 3))];
      if (!choice) { await g.play('Wait › An hour'); continue; }
      await g.play(`@${choice.command}`);
      for (const p of persons) {
        const places = g.j.campaign.world.related('at').filter(r => r.args[0] === p);
        expect(places.length).toBeLessThanOrEqual(1);
      }
      // A fact of the whole evening cannot be known without its parts.
      if (g.knows('ch_evening')) { for (const f of ['ch_order', 'ch_glove', 'serene_saw', 'ch_cooper', 'ch_child', 'ch_knot']) { expect(g.knows(f)).toBe(true); } }
      if (g.holds('ch_buried', 'party')) { expect(g.holds('ch_cuffed', 'party')).toBe(false); }
    }
    expect(g.j.taken.length).toBeGreaterThan(before + 20);
  }, 180000);
});
