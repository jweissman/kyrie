import { describe, expect, it } from 'bun:test';
import { Ombra, home } from './support/ombra';

// The ranger's arc (data/adventures/book-of-faces/ranger.kyr): tracking a boy through a city the rain has washed, the
// question Mistress Withy asks, the feather, the vigil, and two ways at the Drawing. The checks are rolled; a company
// of the sixth level whose qualities are twenty-five cannot fail one, so a test can take the branch it means to.
const campaign = process.env.OMBRA_CAMPAIGN ?? home;
const to = (room: string) => `>ombra__${room}`;
const start = (seed = 'ombra', party?: Parameters<typeof Ombra.start>[2]) => Ombra.start(campaign, seed, party);
const ranger = () => [{ name: 'Rook', raceId: 'human', classId: 'ranger', backgroundId: 'tracker', level: 13 } as never];
const nurse = [to('heronry_edge'), 'Ask Mistress Withy what the notice', 'Ask where the old heron is', 'Tell Mistress Withy you mean', to('reed_path'),
  'Fetch Mistress Withy', 'Offer the heron'];
// Nine at night on the ninth day, the Hall's light-well: the Drawing's Hall is the Chapel's depths.
const drawing = '==day 9 18:30';
// A reading is a check; one that fails is tried again when the half-day's blindness is over (the ranger of the
// thirteenth level fails one in four).
const read = async (o: Ombra, label: string, fact: string) => {
  for (let i = 0; i < 5 && !o.knows(fact); i++) { await o.play(`?${label}`); if (!o.knows(fact)) { await o.play('==+40'); } }
};

describe('The ranger: reading a city', () => {
  it('three readings, each a check: the Chapel porch, the grating, the rats\' lane; then the den is entered with no check at all', async () => {
    const o = await start('ombra', ranger());
    await o.play(to('chapel_steps'));
    await read(o, 'Read the Chapel steps', 'rg_sign_soot');
    expect(o.knows('rg_sign_soot')).toBe(true);
    await o.play(to('cistern_steps'));
    await read(o, 'Read the grating', 'rg_sign_grating');
    expect(o.knows('rg_sign_grating')).toBe(true);
    await o.play(to('cistern_head'), 'light a candle', to('cistern_hall'));
    await read(o, 'Read the rats', 'rg_sign_runs');
    expect(o.knows('rg_sign_runs')).toBe(true);
    expect(o.knows('ci_boys_found')).toBe(false);
    await o.play(to('lamp_boys_den'), 'Go in to the den downwind');
    expect(o.knows('ci_boys_found')).toBe(true);
    // He is not frightened, and trusts a little before a word is said.
    expect(o.measure('ci_trust', 'pip')).toBe(1);
    expect(o.holds('arcBegun', 'party', 'hand_heron')).toBe(true);
  }, 180000);

  it('a company with no knack for it can fail to read the grating and is blind to it for half a day', async () => {
    // A mage of the first level reads a grating against a fair difficulty with a modifier near nothing: of a few seeds,
    // one fails.
    let o = await start('t0', [{ name: 'Sam', raceId: 'human', classId: 'mage', level: 1 } as never]);
    for (const seed of ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7']) {
      o = await start(seed, [{ name: 'Sam', raceId: 'human', classId: 'mage', level: 1 } as never]);
      await o.play(to('cistern_steps'), 'Read the grating');
      if (!o.knows('rg_sign_grating')) { break; }
    }
    expect(o.knows('rg_sign_grating')).toBe(false);
    expect(o.holds('rg_blind_grating', 'party')).toBe(true);
    await o.play('==+40');
    expect(o.holds('rg_blind_grating', 'party')).toBe(false);
  }, 240000);
});

describe('The ranger: what a ranger is for, and the feather', () => {
  it('asked what a ranger is for, the company answers, and what is said is a creed', async () => {
    const o = await start('ombra', ranger());
    await o.play(...nurse, to('heronry_edge'), 'Show Mistress Withy what you are', 'Say that the wild is mended best');
    expect(o.holds('rg_creed_tended', 'party')).toBe(true);
    expect(o.holds('rg_creed_wild', 'party')).toBe(false);
  }, 180000);

  it('the feather left on the water is given later, from the warden\'s tin; the feather taken is a theft the heron remembers', async () => {
    const left = await start('ombra', ranger());
    await left.play(...nurse, '==+40', to('heron_pool'));
    expect(left.knows('rg_feather_seen')).toBe(true);
    await left.play(to('heronry_edge'), '==day 8 21:00', 'Ask Mistress Withy about the feather');
    expect(left.holds('rg_feather_given', 'party')).toBe(true);
    expect(left.carries('rg_gift_feather')).toBe(true);
    const taken = await start('ombra', ranger());
    await taken.play(...nurse, '==+40', to('heron_pool'), 'Take');
    expect(taken.holds('rg_feather_taken', 'party')).toBe(true);
    expect(taken.carries('rg_feather')).toBe(true);
  }, 240000);

  it('the vigil is kept at the pool on the eighth afternoon, and the one who keeps it is wiser by a point', async () => {
    const o = await start('ombra', ranger());
    await o.play(...nurse, '==day 8 13:30', to('heron_pool'), '==day 8 14:10');
    const wis = () => (o.j.campaign.state as { creatures: { id: string; base: { wisdom: number } }[] }).creatures.find(c => c.id === 'ombra__party_1')!.base.wisdom;
    const before = wis();
    await o.play('keep the heron');
    expect(o.holds('rg_vigil_kept', 'party')).toBe(true);
    expect(wis()).toBe(before + 1 > 25 ? 25 : before + 1);
  }, 240000);
});

describe('The ranger: the Drawing', () => {
  it('the heron is carried to the city in the warden\'s basket and loosed in the Hall\'s light-well; the hand is played', async () => {
    const o = await start('ombra', ranger());
    await o.play(...nurse, '==day 9 07:00', to('heron_pool'), 'Ask the old heron to come');
    expect(o.holds('rg_heron_carried', 'party')).toBe(true);
    expect(o.holds('handReady', 'party', 'hand_heron')).toBe(true);
    await o.play(drawing, to('urn_hall'), 'Loose the old heron');
    expect(o.holds('handPlayed', 'party', 'hand_heron')).toBe(true);
    expect(o.measure('handWay', 'hand_heron')).toBe(1);
    expect(o.holds('rg_heron_flown', 'party')).toBe(true);
  }, 300000);

  it('the heron taken from the water will not come: a feather taken stops the hand', async () => {
    const o = await start('ombra', ranger());
    await o.play(...nurse, '==+40', to('heron_pool'), 'Take', '==day 9 07:00', to('heron_pool'));
    expect(o.j.offers('Ask the old heron to come')).toBe(false);
  }, 240000);

  it('the boy is asked to say what he heard, and says it in the Hall: the other way to play the hand', async () => {
    const o = await start('ombra', ranger());
    await o.play(to('cistern_head'), to('lamp_boys_den'), 'Leave a ration', '==21:00', 'Ask him what he wants', 'Give him a candle', 'Ask what he saw', 'Ask who else came',
      'Sit by his candle', 'Ask about the other one');
    expect(o.holds('handReady', 'party', 'hand_heron')).toBe(true);
    await o.play('Ask Pip if he will say');
    expect(o.holds('following', 'pip', 'party')).toBe(true);
    await o.play('==day 9 18:30', to('urn_hall'), 'Stand beside Pip');
    expect(o.holds('rg_pip_spoke', 'party')).toBe(true);
    expect(o.measure('handWay', 'hand_heron')).toBe(2);
    expect(o.holds('handPlayed', 'party', 'hand_heron')).toBe(true);
  }, 300000);
});

describe('The ranger: rewards and invariants', () => {
  it('a bird from Gorrell for a ranger when the Post flies, and it goes to the Watch with a word and cools the count', async () => {
    const o = await start('ombra', ranger());
    await o.play(to('loft_roof'), '==day 2 07:00', to('loft_floor'), '==day 2 21:00', 'Ask Old Gorrell why the birds', 'Tell Gorrell what is on his roof', 'Take the grey pigeon');
    expect(o.holds('rg_pigeon_given', 'party')).toBe(true);
    expect(o.carries('rg_pigeon')).toBe(true);
  }, 240000);

  it('Mistress Withy teaches a ranger the heron\'s stillness once the old bird stands', async () => {
    const o = await start('ombra', ranger());
    await o.play(...nurse, '==+40');
    expect(o.j.holds('teaches', 'ombra__withy', 'hide')).toBe(true);
  }, 240000);

  it('walking what is offered, two hundred times, never leaves a following creature in two places', async () => {
    const o = await start('explore', ranger());
    await o.play(...nurse, '==+40');
    for (let i = 0; i < 200 && o.running; i++) {
      const choices = o.j.choices().filter(c => !/^(Wait|Make camp|Take your face off|Rest|Try to rest)/.test(c.label)
        && !/Attack|Let go|Tell her the Writ|Rent|Take$/.test(c.label));
      if (!choices.length) { break; }
      const pick = choices[i % choices.length]!;
      try { await o.j.step(`^${pick.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`); } catch { continue; }
      for (const who of ['heron', 'pip']) { expect(o.j.campaign.world.related('at', `ombra__${who}`).length).toBeLessThanOrEqual(1); }
      if (o.holds('rg_heron_flown', 'party')) { expect(o.holds('handPlayed', 'party', 'hand_heron')).toBe(true); }
    }
  }, 240000);
});
