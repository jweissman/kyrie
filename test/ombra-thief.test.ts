import { describe, expect, it, setDefaultTimeout } from 'bun:test';
import { Ombra, home, o } from './support/ombra';

// The Cast-Room (data/adventures/book-of-faces/thief.kyr): a heist on the Wall of Faces in five stages, played by the
// labels a player sees. A check's die depends on the seed and on what was done before it, so a flow that needs a check
// to go one way is tried on successive seeds until it does. A burglar's build has lockwork, stealth and trapwork and no
// climbing; the default build (a warrior with fourteen coin) has none of them. Tests that need a person of another
// file (Vane, the Warden, Peck) are skipped when the campaign has not got them: OMBRA_CAMPAIGN names another campaign.
setDefaultTimeout(180_000);
const campaign = process.env.OMBRA_CAMPAIGN ?? home;
const seeds = Array.from({ length: 40 }, (_, i) => `s${i}`);
const burglar = () => Ombra.one('thief', 'burglar');
const start = (seed = 'ombra', party?: ReturnType<typeof burglar>) => Ombra.start(campaign, seed, party);
const present = (g: Ombra, who: string) => g.at(who) !== undefined;
async function onSeed(run: (g: Ombra) => Promise<boolean>, party?: ReturnType<typeof burglar>): Promise<Ombra> {
  let last: unknown;
  for (const seed of seeds) {
    const g = await start(seed, party);
    try { if (await run(g)) { return g; } } catch (e) { last = e; }
  }
  throw new Error(`no seed let the checks go the way the test needs: ${last}`);
}
const at = (g: Ombra) => g.j.campaign.world.related('at', 'party')[0]!.args[1];
const heat = (g: Ombra) => g.measure('heat', 'party');
// Slee's terms, struck at the loft after the Ninth Bell; the roof, the bolt and the bells are the Hands'.
const sleeDeal = ['=21:00', '>ombra__mk_loft', 'Climb the ladder', 'Ask what the Hands would do', 'Strike the bargain'];
// In by the skylight after one, and the lock (the Hands lend no key): a burglar picks it.
const inByRoof = ['=01:00', '>ombra__maskers_roof', 'Let yourself down', '?Pick the cellar door', '>ombra__cast_cellar'];
const out = ['>ombra__pavane_parlour', '>ombra__maskers_lane'];

describe('The Cast-Room: the Hands', () => {
  it('is cased, crewed and entered on Slee\'s terms: a roof, a muffled bell, and a cut', async () => {
    const g = await onSeed(async s => {
      await s.play(...sleeDeal, ...inByRoof);
      return at(s) === 'ombra__cast_cellar';
    }, burglar());
    expect(g.holds('th_crew_slee', 'party')).toBe(true);
    expect(g.holds('th_bells_off', 'party')).toBe(true);
    expect(g.measure('th_fee', 'party')).toBe(14);
    expect(g.gold()).toBe(4);
    expect(g.knows('th_routine') && g.knows('th_bells') && g.knows('th_roof_way')).toBe(true);
    expect(g.holds('th_intruder', 'party')).toBe(true);
    await g.play('Take the Menders', "Take the Fitter's spare picks", ...out);
    expect(g.holds('th_took_proof', 'party')).toBe(true);
    expect(g.knows('lie_wall') && g.knows('marrick_was_treasurer')).toBe(true);
    expect(g.carries('th_proof')).toBe(true);
    expect(g.carries('mk_fitters_picks')).toBe(true);
    expect(g.holds('th_intruder', 'party')).toBe(false);
    expect(g.holds('th_hands_squeezed', 'party')).toBe(true);
    // Nobody saw. At nine the Fitter has found the gaps, and without the Hands' silence bought, the Watch is told.
    expect(heat(g)).toBe(0);
    await g.play('=day 2 10:00');
    expect(g.holds('th_found', 'party')).toBe(true);
    expect(heat(g)).toBe(2);
    expect(g.holds('state', 'mk_cellar_lock', 'locked')).toBe(true);
  });

  it('weighs the silence, if it can be paid for: a coin a thing taken and six beyond, and no heat', async () => {
    const g = await onSeed(async s => {
      await s.play('=21:00', '>ombra__mk_loft', 'Climb the ladder', 'Ask what the Hands would do', 'Ask what the Hands would have you carry',
        '?Haggle with Slee');
      if (s.measure('th_fee', 'party') > 9) { return false; }
      await s.play('>ombra__row_quay', 'Leave the parcel', '>ombra__mk_loft', 'Strike the bargain', ...inByRoof);
      return at(s) === 'ombra__cast_cellar';
    }, burglar());
    expect(g.holds('th_parcel_done', 'party')).toBe(true);
    await g.play('Take the Menders', ...out, '>ombra__mk_loft');
    expect(g.gold()).toBeGreaterThanOrEqual(10);
    await g.play('Have Slee weigh the silence');
    expect(g.holds('th_silenced', 'party')).toBe(true);
    await g.play('=day 2 10:00');
    expect(g.holds('th_found', 'party')).toBe(false);
    expect(heat(g)).toBe(0);
  });

  it('offers a company with only a purse the whole table, and takes its fourteen coin and the Hands\' squeeze', async () => {
    const g = await start();
    // The Warden's secret, which pays the whole fee and the cut, is a fact the counting-house's file teaches: it is offered only to those who have it.
    await g.play('=21:00', '>ombra__mk_loft', 'Climb the ladder', 'Ask what the Hands would do');
    expect(g.j.offers('Tell Slee, as a thing weighed')).toBe(false);
    expect(g.j.offers('Watch what Slee does with his hands')).toBe(true);
    expect(g.j.offers('Haggle with Slee')).toBe(true);
    expect(g.j.offers('Ask Slee to let the Hands forgo')).toBe(true);
    expect(g.j.offers('Let Slee think that a Magpie')).toBe(true);
    await g.play('Strike the bargain');
    expect(g.gold()).toBe(0);
    expect(g.holds('th_cut_waived', 'party')).toBe(false);
  });

  it('is read, haggled with and lied to in turn, each at a cost if it goes wrong, and once', async () => {
    const g = await onSeed(async s => {
      await s.play('=21:00', '>ombra__mk_loft', 'Climb the ladder', 'Ask what the Hands would do', '?Watch what Slee does', '?Haggle with Slee', '?Let Slee think');
      return s.holds('th_read_slee', 'party') && s.holds('th_haggled', 'party') && s.holds('th_bluffed', 'party') && s.knows('th_slee_wants')
        && s.measure('th_fee', 'party') < 14;
    });
    expect(g.j.offers('Haggle with Slee')).toBe(false);
    expect(g.j.offers('Let Slee think')).toBe(false);
    // Having read what he wants, the cut can be asked off at a fair chance, not a hard one.
    expect(g.j.offers('forgo their squeeze, for the sake of what he wants')).toBe(true);
    expect(g.j.offers('Ask Slee to let the Hands forgo their squeeze$')).toBe(false);
  });

  it('gives a Hand\'s name to one who came out unseen without a bell, and teaches the third trick', async () => {
    const g = await onSeed(async s => {
      await s.play(...sleeDeal, ...inByRoof);
      return at(s) === 'ombra__cast_cellar' && !s.holds('th_seen', 'party');
    }, burglar());
    await g.play('Take the Menders', ...out, '>ombra__mk_loft', 'Show Slee what you carried out');
    expect(g.holds('th_hands_name', 'party')).toBe(true);
    await g.play('Have Sam shown the Hands');
    expect(g.holds('th_lesson_given', 'party')).toBe(true);
  });
});

describe('The Cast-Room: the boy', () => {
  // On the roof, with the boy; to the burning; and the key, as a favour. The oldest way to take a thing from a friend.
  const favour = ['=20:30', '>ombra__maskers_roof', 'Say you only came up for the air', 'Sit by Dov on the ridge', 'Ask Dov if you may try the mask on',
    'Tell Dov to burn it', 'Ask Dov, idly', 'Ask Dov for the spare key'];
  it('gives the key as a favour, and is put out of the house for it, a key later; a plaster blank only delays that', async () => {
    const g = await start();
    await g.play(...favour);
    expect(g.holds('th_crew_dov', 'party')).toBe(true);
    expect(g.holds('th_have_key', 'party')).toBe(true);
    expect(g.holds('th_dov_used', 'party')).toBe(true);
    expect(g.j.holds('promiseMade', 'ombra__th_dov_promise')).toBe(true);
    await g.play('=01:00', '>ombra__maskers_roof', 'Let yourself down', 'Unlock the cellar door', '>ombra__cast_cellar', 'Take the Menders', 'Pour plaster blanks', ...out);
    expect(g.holds('th_blanks', 'party')).toBe(true);
    // Nobody saw: the blanks stand in the faces' places, and the lock was opened with the Fitter's own.
    await g.play('=day 2 12:00');
    expect(g.holds('th_found', 'party')).toBe(false);
    expect(heat(g)).toBe(0);
    await g.play('=day 5 10:00');
    expect(g.holds('th_found', 'party')).toBe(true);
    expect(heat(g)).toBe(2);
    expect(g.holds('mk_dov_dismissed', 'party')).toBe(true);
    expect(g.holds('promiseBroken', 'th_dov_promise')).toBe(true);
    expect(g.page).toContain('Dov.');
  });

  it('is saved, if the company tells her it was them before she has been to the Watch; and it costs a heat', async () => {
    const g = await start();
    await g.play(...favour);
    await g.play('=01:00', '>ombra__maskers_roof', 'Let yourself down', 'Unlock the cellar door', '>ombra__cast_cellar', 'Take the Menders', ...out, '=07:20', '>ombra__pavane_parlour');
    expect(g.at('pavane')).toBe('ombra__pavane_parlour');
    await g.play('Tell Madame Pavane it was you');
    expect(g.holds('th_dov_clear', 'party')).toBe(true);
    expect(heat(g)).toBe(1);
    await g.play('=day 2 12:00');
    expect(g.holds('th_found', 'party')).toBe(true);
    expect(g.holds('mk_dov_dismissed', 'party')).toBe(false);
    expect(g.holds('promiseBroken', 'th_dov_promise')).toBe(false);
  });

  it('is asked idly, and answers as a friend: the bell, the wall, the roof and the key; and why? is the cost', async () => {
    const g = await start();
    await g.play('=20:30', '>ombra__maskers_roof', 'Say you only came up for the air', 'Sit by Dov on the ridge', 'Ask Dov if you may try the mask on', 'Ask Dov, idly');
    expect(g.knows('th_routine') && g.knows('th_bells') && g.knows('th_dov_key') && g.knows('th_roof_way')).toBe(true);
    expect(g.holds('th_dov_asked', 'party')).toBe(true);
    // Without a favour owed, only the asking is left, as a journeyman is asked; and it may be refused, at the cost of the Fitter being told.
    expect(g.j.offers('Ask Dov for the spare key')).toBe(false);
    const refused = await onSeed(async s => {
      await s.play('=20:30', '>ombra__maskers_roof', 'Say you only came up for the air', 'Sit by Dov on the ridge', 'Ask Dov if you may try the mask on', 'Ask Dov, idly', '?Ask Dov, as you would ask a journeyman');
      return s.holds('th_dov_refused', 'party');
    });
    expect(refused.holds('th_alerted', 'party')).toBe(true);
    expect(refused.holds('th_crew_dov', 'party')).toBe(false);
  });
});

describe('The Cast-Room: alone, as a guest, as a customer', () => {
  it('is cased from a doorway, and done alone by the roof: the slates, the bolt, the lock, the bell', async () => {
    const g = await onSeed(async s => {
      await s.play('=20:00', '>ombra__maskers_lane', '?Watch Madame Pavane');
      if (!s.holds('th_watched', 'party') || !s.knows('th_routine')) { return false; }
      await s.play('Resolve to do it with nobody', '>ombra__maskers_roof', '=01:00', '?Cross the wet slates', '?Slide a blade', '?Let yourself down',
        '?Pick the cellar door', '?Go down the stair along the wall', '?Cut the bell-cord', '>ombra__cast_cellar');
      return at(s) === 'ombra__cast_cellar' && !s.holds('th_seen', 'party');
    }, burglar());
    expect(g.holds('th_crew_alone', 'party')).toBe(true);
    expect(g.holds('th_bells_off', 'party')).toBe(true);
    await g.play('Take Absalom', 'Take the four', ...out);
    expect(g.holds('th_took_keys', 'party')).toBe(true);
  });

  it('is seen if the tile goes: the lane wakes, the Watch has it by the Third Bell, and the lock is changed', async () => {
    const g = await onSeed(async s => {
      await s.play('=20:00', '>ombra__maskers_lane', '?Watch Madame Pavane');
      if (!s.holds('th_watched', 'party') || !s.knows('th_routine')) { return false; }
      await s.play('Resolve to do it with nobody', '>ombra__maskers_roof', '=01:00', '?Cross the wet slates');
      return s.holds('th_seen', 'party');
    });
    expect(g.holds('th_alerted', 'party')).toBe(true);
    expect(heat(g)).toBe(2);
    expect(g.page).toContain('every light in the lane has come on');
  });

  it('is caught in her parlour by a company that comes in before one', async () => {
    const g = await start();
    await g.play(...sleeDeal.slice(0, 4), 'Strike the bargain', '=23:30', '>ombra__maskers_roof', 'Let yourself down');
    expect(g.holds('th_seen', 'party')).toBe(true);
    expect(at(g)).toBe('ombra__maskers_lane');
    expect(heat(g)).toBe(2);
    expect(g.page).toContain('You are not good at roofs');
  });

  it('is done as a guest: the key lifted from the neck of someone who has just been kind, and the cost is hers', async () => {
    const g = await onSeed(async s => {
      await s.play('=20:00', '>ombra__maskers_lane', '?Watch Madame Pavane');
      if (!s.knows('th_routine')) { return false; }
      await s.play('Stand in the rain before', '>ombra__pavane_parlour', 'Stay at the Fitter', '?Lift the cellar key');
      return s.holds('th_have_key', 'party');
    }, burglar());
    expect(g.holds('th_via_guest', 'party')).toBe(true);
    await g.play('Unlock the cellar door with the key', '>ombra__cast_cellar', 'Take the Menders', ...out);
    expect(g.holds('th_took_proof', 'party')).toBe(true);
    expect(g.holds('th_seen', 'party')).toBe(false);
    await g.play('=day 2 10:00');
    expect(g.holds('th_pavane_hurt', 'party')).toBe(true);
    expect(g.holds('mk_pavane_trust', 'party')).toBe(false);
    expect(g.holds('mk_pavane_cold', 'party')).toBe(true);
  });

  it('is turned out by a Fitter who wakes, if the guest is clumsy, with no heat but her trust gone', async () => {
    const g = await onSeed(async s => {
      await s.play('=20:00', '>ombra__maskers_lane', '?Watch Madame Pavane');
      if (!s.knows('th_routine')) { return false; }
      await s.play('Stand in the rain before', '>ombra__pavane_parlour', 'Stay at the Fitter', '?Lift the cellar key');
      return !s.holds('th_have_key', 'party') && s.holds('mk_pavane_cold', 'party');
    }, burglar());
    expect(g.holds('mk_pavane_trust', 'party')).toBe(false);
    expect(g.holds('th_via_guest', 'party')).toBe(false);
    expect(heat(g)).toBe(1);
  });

  it('is done as a customer who does not leave: a rented face, and the face is remembered', async () => {
    const g = await onSeed(async s => {
      await s.play('=20:00', '>ombra__maskers_lane', '?Watch Madame Pavane');
      if (!s.knows('th_routine')) { return false; }
      await s.play('=day 2 08:00', '>ombra__annex_counter', 'Rent the Heron', 'Put on the Heron', '>ombra__fitting_room', '=17:00', '?Stay behind in the fitting-room');
      return s.holds('th_hidden', 'party');
    }, burglar());
    expect(g.measure('faceHeat', 'face_heron')).toBe(2);
    await g.play('=day 3 01:00', '>ombra__pavane_parlour', '?Pick the cellar door', '?Go down the stair along the wall');
    expect(g.holds('th_intruder', 'party')).toBe(true);
  });
});

describe('The Cast-Room: the take, and the fence', () => {
  // Three things taken by the hands of the Hands: the proof, the keys, the owed.
  async function loot(): Promise<Ombra> {
    return onSeed(async s => {
      await s.play(...sleeDeal, ...inByRoof);
      if (at(s) !== 'ombra__cast_cellar' || s.holds('th_seen', 'party')) { return false; }
      await s.play('Take the Menders', 'Take the four', 'Take Absalom', ...out);
      return s.carries('th_proof') && s.carries('th_keys') && s.carries('th_owed_cast');
    }, burglar());
  }

  it('is sold to the Warden: thirty for the shelf, forty for the faces, and the Watch is thanked off, and a hold is held', async () => {
    const g = await loot();
    if (!present(g, 'lacke')) { return; }
    const purse = g.gold();
    await g.play('>ombra__ct_locks_parlour', "Sell the Menders' row", 'Sell the four Offices');
    expect(g.gold()).toBe(purse + 70);
    expect(g.holds('th_cast_lacke', 'party')).toBe(true);
    expect(g.carries('th_proof') || g.carries('th_keys')).toBe(false);
    expect(g.holds('handReady', 'party', 'hand_cast')).toBe(true);
    expect(heat(g)).toBe(0);
    // And at the Drawing, with the casts in the Warden's hands, the company may stand by while he uses them.
    await g.play('=day 9 19:00', '>ombra__urn_hall', 'Stand by while the Warden');
    expect(g.holds('handPlayed', 'party', 'hand_cast')).toBe(true);
    expect(g.holds('th_lacke_used', 'party')).toBe(true);
  });

  it('is given to the Candid, kind by kind; and read at the foot of the Urn', async () => {
    const g = await loot();
    if (!present(g, 'vane')) { return; }
    await g.play('>ombra__candid_room', "Give the Menders' row", 'Give the four Offices');
    expect(g.holds('th_proof_vane', 'party') && g.holds('th_keys_vane', 'party')).toBe(true);
    expect(g.gold()).toBe(4);
    await g.play('=day 9 19:00', '>ombra__urn_hall', 'Stand beside the Candid');
    expect(g.holds('handPlayed', 'party', 'hand_cast')).toBe(true);
    await g.play('=day 9 23:10');
    expect(g.page).toContain('said nine words');
  });

  it('is broken on the quay, which cannot be put back, and the faces are gone', async () => {
    const g = await loot();
    await g.play('>ombra__row_quay', "Break the Menders' row", 'Break the four Offices');
    expect(g.holds('th_proof_broken', 'party') && g.holds('th_keys_broken', 'party')).toBe(true);
    expect(g.carries('th_proof') || g.carries('th_keys')).toBe(false);
    expect(g.holds('handReady', 'party', 'hand_cast')).toBe(false);
    expect(g.holds('th_hands_squeezed', 'party')).toBe(true);
    // The Hands kept squeezes: on the night of the Swap they are worn; they may be bought back.
    await g.play('=day 5 23:00');
    expect(g.holds('th_swap_said', 'party')).toBe(true);
    expect(g.measure('faceHeat', 'face_key')).toBeGreaterThanOrEqual(2);
  });

  it('is put in the fire at the Drawing, one kind at a time, before the room', async () => {
    const g = await loot();
    await g.play('=day 9 18:30', '>ombra__urn_hall');
    expect(g.holds('handReady', 'party', 'hand_cast')).toBe(true);
    await g.play('Put the Menders', 'Put the four Offices');
    expect(g.holds('th_cast_fire', 'party')).toBe(true);
    expect(g.holds('handPlayed', 'party', 'hand_cast')).toBe(true);
    expect(g.carries('th_proof') || g.carries('th_keys')).toBe(false);
    expect(g.j.offers('Set the four Offices')).toBe(false);
  });

  it('is set down before the room, which has no fire for it', async () => {
    const g = await loot();
    await g.play('=day 9 18:30', '>ombra__urn_hall', 'Set the Menders');
    expect(g.holds('th_cast_room', 'party')).toBe(true);
    expect(g.page).toContain('looking at its own shelf');
  });

  it('is handed back to the Fitter, whole, and she says nothing; a boy stays', async () => {
    const g = await loot();
    await g.play('=day 2 08:30', '>ombra__fitting_room', "Hand the Menders' row", 'Hand the four Offices', "Hand Peck's cast");
    expect(g.holds('th_cast_back', 'party')).toBe(true);
    expect(g.carries('th_proof') || g.carries('th_keys') || g.carries('th_owed_cast')).toBe(false);
    expect(g.holds('th_took_any', 'party')).toBe(false);
    expect(g.holds('th_confessed', 'party')).toBe(true);
    expect(heat(g)).toBe(0);
  });

  it('is given to Peck, whose own face it is, if he is there to be given it', async () => {
    const g = await loot();
    if (!present(g, 'peck')) { return; }
    await g.play('>ombra__hospice_dorm', 'Give Peck his own cast');
    expect(g.holds('th_peck_cast', 'party')).toBe(true);
    expect(g.carries('th_owed_cast')).toBe(false);
  });

  it('is put back before the dawn, with the Fitter none the wiser', async () => {
    const g = await onSeed(async s => {
      await s.play(...sleeDeal, ...inByRoof);
      return at(s) === 'ombra__cast_cellar' && !s.holds('th_seen', 'party');
    }, burglar());
    await g.play('Take the Menders', 'Put the Menders');
    expect(g.holds('th_cast_back', 'party')).toBe(true);
    expect(g.holds('th_took_any', 'party')).toBe(false);
    await g.play(...out, '=day 2 10:00');
    expect(g.holds('th_found', 'party')).toBe(false);
    expect(heat(g)).toBe(0);
  });
});

describe('The Cast-Room keeps its law', () => {
  it('never puts a person in two places, nor a fact where it cannot be, whatever the first thing offered is, even by night', async () => {
    const g = await Ombra.start(campaign, 'explore', burglar());
    await g.play(...sleeDeal);
    const persons = ['pavane', 'dov', 'mk_maule', 'th_slee', 'peck', 'vane', 'lacke'].filter(p => present(g, p));
    const skip = /^(Attack|Lift|Name|Make camp|Search)|Set down|Pack|Light|Break|Sink|Wait › Until/;
    for (let i = 0; i < 200 && g.running; i++) {
      const offered = g.j.choices().filter(c => !skip.test(c.label) && !skip.test(c.full));
      if (!offered.length) { break; }
      const pick = offered[(i * 7) % offered.length]!;
      try { await g.j.perform(pick.command, pick.label, pick.grave); } catch (e) { if (g.running) { throw e; } }
      const world = g.j.campaign.world;
      for (const p of persons) { expect(world.related('at', o(p)).length).toBeLessThanOrEqual(1); }
      expect(world.related('at', 'party').length).toBe(1);
      if (g.holds('th_took_any', 'party')) { expect(g.knows('lie_wall') || g.holds('th_took_own', 'party') || g.holds('th_took_owed', 'party') || g.holds('th_took_keys', 'party')).toBe(true); }
      if (g.holds('th_crew_slee', 'party')) { expect(g.holds('th_crew_dov', 'party') || g.holds('th_crew_alone', 'party')).toBe(false); }
      if (g.holds('th_via_guest', 'party')) { expect(g.holds('mk_pavane_trust', 'party') || g.holds('th_found', 'party') || g.holds('th_took_any', 'party')).toBe(true); }
      if (g.holds('th_silenced', 'party')) { expect(g.holds('th_crew_slee', 'party')).toBe(true); }
      expect(g.measure('heat', 'party')).toBeLessThanOrEqual(6);
    }
  });

  it('keeps what was taken across the day: the casts stay carried, the heat cools by one a morning', async () => {
    const g = await onSeed(async s => {
      await s.play(...sleeDeal, ...inByRoof);
      if (at(s) !== 'ombra__cast_cellar' || s.holds('th_seen', 'party')) { return false; }
      await s.play('Take the Menders', ...out);
      return s.carries('th_proof');
    }, burglar());
    await g.play('=day 2 10:00');
    expect(heat(g)).toBe(2);
    await g.play('=day 3 10:00');
    expect(heat(g)).toBe(1);
    expect(g.carries('th_proof')).toBe(true);
    expect(g.holds('th_took_any', 'party')).toBe(true);
    expect(g.holds('state', 'mk_cellar_lock', 'locked')).toBe(true);
  });
});
