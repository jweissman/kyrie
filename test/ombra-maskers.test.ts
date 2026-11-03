import { describe, expect, it, setDefaultTimeout } from 'bun:test';
import { Ombra, home, o } from './support/ombra';

// Maskers' Lane (data/adventures/book-of-faces/maskers.kyr): the Wall of Faces and the woman who keeps it, and the
// apprentice's mask that fits nobody. Played by the labels a player sees. A check's die depends on the seed and on what
// was done before it, so a flow that needs a check to go one way is tried on successive seeds until it does (the first
// seed that does is the same every run). Tests that need a person of another file (Peck, Mother Tibb, Goody Pallet) are
// skipped when the campaign has not got them: OMBRA_CAMPAIGN names another campaign (the author's, with stubs).
setDefaultTimeout(180_000);
const campaign = process.env.OMBRA_CAMPAIGN ?? home;
const seeds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n'];
const start = (seed = 'ombra') => Ombra.start(campaign, seed);
const present = (g: Ombra, who: string) => g.at(who) !== undefined;
async function onSeed(run: (g: Ombra) => Promise<boolean>): Promise<Ombra> {
  let last: unknown;
  for (const seed of seeds) {
    const g = await start(seed);
    try { if (await run(g)) { return g; } } catch (e) { last = e; }
  }
  throw new Error(`no seed let the check go the way the test needs: ${String(last)}`);
}
// After the Ninth Bell, on the roof with the boy: he tells his name, and what he holds.
const toDov = ['=20:30', '>ombra__maskers_roof', 'Say you only came up for the air'];
const sitWithDov = [...toDov, 'Sit by Dov on the ridge', 'Ask Dov if you may try the mask on'];
const at = (g: Ombra) => g.j.campaign.world.related('at', 'party')[0]!.args[1];

describe('Maskers\' Lane by day', () => {
  it('answers a bare face with one cold line, and a masked one as the face is met', async () => {
    const g = await start();
    await g.play('>ombra__fitting_room', 'Say good day to the Fitter');
    expect(g.page).toContain('not at home to the Bare');
    expect(g.j.offers('Ask the Fitter what a Fit is')).toBe(false);
    await g.play('Say good day to the apprentice');
    expect(g.page).toContain('It is a good deal easier by dark');
    await g.play('>ombra__mask_shop_floor', 'Say good day to the master of the shop');
    expect(g.page).toContain('We don');
    // Hired a face at the Annex, the same people answer: as a colleague, a customer, a stranger.
    await g.play('>ombra__annex_counter', 'Rent the Heron', 'Put on the Heron', '>ombra__fitting_room', 'Ask the Fitter what a Fit is');
    expect(g.knows('mk_fit_told')).toBe(true);
    expect(g.j.offers('Say good day to the Fitter')).toBe(false);
    await g.play('Ask the apprentice about the plaster');
    expect(g.page).toContain('hands have nothing to say by day');
    await g.play('>ombra__mask_shop_floor', 'Ask the master of the shop about his trade', 'Ask how an Office');
    expect(g.knows('mk_wall_known')).toBe(true);
  });

  it('casts a sitter in the chair, shows them the shelf that is theirs, and locks the door behind', async () => {
    const g = await start();
    const purse = g.gold();
    await g.play('>ombra__fitting_room', "Sit in the Fitter's chair");
    expect(g.holds('castTaken', 'party')).toBe(true);
    expect(g.gold()).toBe(purse - 6);
    await g.play('Ask Madame Pavane to take you down');
    expect(at(g)).toBe('ombra__cast_cellar');
    expect(g.holds('mk_guiding', 'pavane')).toBe(true);
    // The Menders' shelf, read from the chalk, is one of five signs of the Lie.
    expect(g.knows('lie_wall')).toBe(true);
    expect(g.knows('marrick_was_treasurer')).toBe(false);
    expect(g.measure('lieClues', 'party')).toBe(1);
    await g.play('>ombra__pavane_parlour', '=+2');
    expect(g.holds('mk_guiding', 'pavane')).toBe(false);
    expect(g.holds('state', 'mk_cellar_lock', 'locked')).toBe(true);
    // Her ledger is not private: by the third day a rival in the Lane has a squeeze of the face.
    await g.play('=day 3 10:00');
    expect(g.holds('mk_maule_has', 'party')).toBe(true);
    expect(g.page).toContain('It has your nose');
  });

  it('lets a company with a coin to spare buy a look as a commission, and no more than a look', async () => {
    const g = await start();
    await g.play('>ombra__annex_counter', 'Rent the Heron', 'Put on the Heron', '>ombra__fitting_room');
    expect(g.j.offers('Sit in the Fitter')).toBe(false);
    await g.play('Commission a Fitter');
    expect(g.gold()).toBe(14 - 3 - 10);
    expect(g.holds('mk_commissioned', 'party')).toBe(true);
    await g.play('Ask Madame Pavane to take you down');
    expect(g.knows('lie_wall')).toBe(true);
    // The veil is not part of the commission: she stands between the company and it.
    expect(g.j.offers('Lift the black cloth yourself')).toBe(false);
    expect(g.knows('marrick_was_treasurer')).toBe(false);
  });
});

describe('The Fitter by night', () => {
  it('receives a bare knock and takes a masked one for a burglar', async () => {
    const g = await start();
    await g.play('>ombra__annex_counter', 'Rent the Heron', 'Put on the Heron', '=20:30', '>ombra__fitting_room');
    expect(g.holds('masked', 'party')).toBe(false); // the Annex takes its faces back at the Ninth Bell
    await g.play('>ombra__pavane_parlour', 'Sit at the Fitter');
    expect(g.page).toContain('at night we are two people');
  });

  it('is waited for in the rain, and shows the Wall to someone who has been rained on', async () => {
    const g = await start();
    await g.play('=20:00', '>ombra__maskers_lane', 'Stand in the rain before');
    expect(g.holds('mk_pavane_trust', 'party')).toBe(true);
    await g.play('>ombra__pavane_parlour', 'Ask Madame Pavane to take you down');
    expect(g.knows('lie_wall')).toBe(true);
    // The cloth: persuasion, one try; or, if she refuses, lifted by hand with her watching: a rudeness she remembers.
    await g.play('?Ask Madame Pavane to lift the black cloth');
    if (!g.knows('marrick_was_treasurer')) {
      expect(g.holds('mk_veil_refused', 'party')).toBe(true);
      const heat = g.measure('heat', 'party');
      await g.play('Lift the black cloth yourself, with the Fitter standing by');
      expect(g.knows('marrick_was_treasurer')).toBe(true);
      expect(g.holds('mk_pavane_trust', 'party')).toBe(false);
      expect(g.measure('heat', 'party')).toBe(heat + 1);
      expect(at(g)).toBe('ombra__pavane_parlour');
    }
    expect(g.measure('lieClues', 'party')).toBe(1);
  });

  it('is seen: the blank mask, the cutting for no one, the empty niche, the Fitter\'s own face on her Wall', async () => {
    const g = await onSeed(async s => {
      await s.play('=20:00', '>ombra__pavane_parlour', 'Sit at the Fitter', 'Ask about the unfinished mask');
      await s.play('?Tell her what you see', '?Tell her what you see');
      if (!s.holds('mk_pavane_seen', 'party')) { return false; }
      await s.play('?Ask her to finish the mask');
      return s.holds('mk_pavane_moved', 'party');
    });
    expect(g.holds('mk_pavane_trust', 'party')).toBe(true);
    await g.play('Ask Madame Pavane to take you down');
    expect(g.knows('mk_empty_niche')).toBe(true);
    await g.play('Ask her why there is nothing on the Wall');
    expect(g.knows('mk_pavane_was_bare')).toBe(true);
    expect(g.knows('mk_pavane_name')).toBe(false);
    await g.play('Ask Madame Pavane what she wants you to do');
    expect(g.knows('mk_pavane_name')).toBe(true);
    await g.play('Ask the Fitter whether she has ever noticed');
    expect(g.knows('mk_pavane_knows_lie')).toBe(true);
    for (let i = 0; i < 12 && !g.holds('mk_cast_pavane', 'party'); i++) { await g.play("?Offer to take the Fitter's own cast"); }
    expect(g.holds('mk_cast_pavane', 'party')).toBe(true);
    expect(g.carries('mk_fitters_picks')).toBe(true);
    // Her own face on her Wall: the veil comes off unasked, with no check.
    await g.play('Ask Madame Pavane, whose face you have cast, to lift');
    expect(g.knows('marrick_was_treasurer')).toBe(true);
    expect(g.measure('lieClues', 'party')).toBe(1);
    // The Fit, free once, to a mask in hand: the Key, were it held. Not the White.
    expect(g.j.offers('Fit the White Face')).toBe(false);
  });

  it('is pressed with the Warrant only where the Warrant is live', async () => {
    const g = await start();
    await g.play('=20:00', '>ombra__pavane_parlour');
    expect(g.j.offers('Tell her the Warrant covers')).toBe(false);
  });

  it('is Named: the shutters go up, her house is shut to the company, and the news says so', async () => {
    const g = await start();
    await g.play('>ombra__fitting_room', "Lift Madame Pavane's mask", 'Name Madame Pavane aloud');
    expect(g.holds('named', 'pavane')).toBe(true);
    expect(g.knows('mk_pavane_name')).toBe(true);
    expect(g.page).toContain('the one from the far side of the delta road');
    expect(g.j.offers('Sit in the Fitter')).toBe(false);
    await g.play('=day 9 23:10');
    expect(g.page).toContain('went down the delta road at dawn with a bag');
  });
});

describe('The mask that fits nobody', () => {
  it('is told on the roof to someone who sits an hour and asks nothing', async () => {
    const g = await start();
    await g.play(...toDov, 'Sit by Dov on the ridge');
    expect(g.knows('mk_dov_story')).toBe(true);
    expect(g.knows('mk_dov_name')).toBe(true);
    expect(g.holds('mk_dov_showed', 'party')).toBe(true);
    await g.play('Ask Dov why he has not put it in the ground', 'Ask Dov if you may try the mask on');
    expect(g.knows('mk_mask_fits_bare')).toBe(true);
    expect(g.holds('mk_dov_trusts', 'party')).toBe(true);
  });

  it('is read by a company that sees what he loves, or sends him down the ladder for the night', async () => {
    const bad = await onSeed(async s => { await s.play(...toDov, '?Tell Dov you do not think'); return !s.holds('mk_dov_showed', 'party'); });
    expect(bad.holds('mk_dov_spooked', 'dov')).toBe(true);
    expect(bad.at('dov')).toBe('ombra__offstage');
    expect(bad.j.offers('Sit by Dov')).toBe(false);
    const good = await onSeed(async s => { await s.play(...toDov, '?Tell Dov you do not think'); return s.holds('mk_dov_showed', 'party'); });
    expect(good.knows('mk_dov_story')).toBe(true);
  });

  it('is burned, if the boy is told to, and he sits down a free man; the Guild finds him out on the ninth day', async () => {
    const g = await start();
    await g.play(...sitWithDov, 'Tell Dov to burn it');
    expect(g.holds('mk_drowned_burned', 'party')).toBe(true);
    expect(g.holds('mk_dov_free', 'party')).toBe(true);
    expect(g.holds('mk_dov_holds', 'dov')).toBe(false);
    await g.play('=day 9 15:00');
    expect(g.holds('mk_dov_dismissed', 'party')).toBe(true);
    // A rival who said he would take him: he is sent, and taken.
    await g.play('>ombra__maskers_lane');
    expect(g.at('dov')).toBe('ombra__maskers_lane');
  });

  it('is kept by the one who made it, if he is told that it is exact, and taken before the Guild', async () => {
    const g = await onSeed(async s => {
      await s.play(...sitWithDov, '?Tell Dov it is not a bad pour');
      return s.holds('mk_dov_proud', 'party');
    });
    await g.play('Tell Dov to keep it');
    expect(g.holds('mk_dov_keeps', 'party')).toBe(true);
    await g.play('=day 9 15:00');
    expect(g.holds('mk_dov_journeyman', 'party')).toBe(true);
    expect(g.holds('mk_dov_dismissed', 'party')).toBe(false);
  });

  it('is carried to the Fitter by the boy himself, in the morning, if he is pushed', async () => {
    const g = await onSeed(async s => {
      await s.play(...sitWithDov, '?Tell Dov it is not a bad pour');
      if (!s.holds('mk_dov_proud', 'party')) { return false; }
      await s.play('?Ask Dov to take it to Madame Pavane himself');
      return s.holds('mk_dov_will_show', 'party');
    });
    await g.play('=09:30');
    expect(g.holds('mk_drowned_pavane', 'party')).toBe(true);
    expect(g.holds('mk_dov_free', 'party')).toBe(true);
    // She was not moved, so it is a bad Fit made on purpose, and the Guild is to decide: it vouches for him on the
    // ninth.
    expect(g.holds('mk_dov_journeyman', 'party')).toBe(false);
    await g.play('=day 9 15:00');
    expect(g.holds('mk_dov_journeyman', 'party')).toBe(true);
    expect(g.holds('mk_dov_dismissed', 'party')).toBe(false);
  });

  it('is put in the Fitter\'s hands by a company that took it, and she makes him journeyman', async () => {
    const g = await start();
    await g.play(...sitWithDov, 'Ask Dov to let you take the mask', '=21:30', '>ombra__pavane_parlour', 'Put the mask that fits nobody');
    expect(g.holds('mk_drowned_pavane', 'party')).toBe(true);
    expect(g.holds('mk_dov_journeyman', 'party')).toBe(true);
    expect(g.holds('mk_pavane_trust', 'party')).toBe(true);
    expect(g.carries('mk_drowned_mask')).toBe(false);
    expect(g.holds('holdsFace', 'party', 'mk_face_drowned')).toBe(false);
  });

  it('is sunk in the Cuff, once the company has been asked twice', async () => {
    const g = await start();
    await g.play(...sitWithDov, 'Ask Dov to let you take the mask', '>ombra__row_quay', 'Sink the mask');
    expect(g.holds('mk_drowned_buried', 'party')).toBe(true);
    expect(g.carries('mk_drowned_mask')).toBe(false);
    expect(g.holds('mk_dov_free', 'party')).toBe(true);
  });

  it('is claimed by Peck, who writes that he is not known and then that he is', async () => {
    const g = await start();
    if (!present(g, 'peck')) { return; }
    await g.play(...sitWithDov, 'Ask Dov to let you take the mask', '>ombra__hospice_dorm', 'Show Peck the mask');
    expect(g.holds('mk_peck_claimed', 'party')).toBe(true);
    expect(g.carries('mk_drowned_mask')).toBe(false);
  });

  it('is worn to the Sluice\'s dead, who speak to it: and the third will not come off, until the boy cuts it', async () => {
    const g = await start();
    if (!present(g, 'peck') || !present(g, 'tibb') || !present(g, 'rainmother')) { return; }
    const purse = g.gold();
    await g.play(...sitWithDov, 'Ask Dov to let you take the mask', 'Put on the Drowned', '>ombra__hospice_dorm', 'Let Peck see', 'Let Mother Tibb see');
    expect(g.measure('mk_hold', 'party')).toBe(2);
    expect(g.page).toContain('lose the edges of what you meant to say');
    await g.play('>ombra__rain_hall_floor', 'Let the Rain-Wife see');
    expect(g.measure('mk_hold', 'party')).toBe(3);
    expect(g.gold()).toBe(purse + 4);
    expect(g.measure('goodwill', 'mk_face_drowned')).toBe(3);
    expect(g.page).toContain('It does not come off');
    // Taking the face off is a thing the shared rules offer; the face puts itself back.
    await g.play('Take your face off', '=+1');
    expect(g.holds('masked', 'party')).toBe(true);
    expect(g.holds('wears', 'party', 'mk_face_drowned')).toBe(true);
    // It may not be given away while it clings.
    expect(g.j.offers('Show Peck the mask')).toBe(false);
    await g.play('>ombra__maskers_roof', 'Ask Dov to cut the mask off your face');
    expect(g.holds('masked', 'party')).toBe(false);
    expect(g.measure('mk_hold', 'party')).toBe(0);
    expect(g.holds('mk_freed', 'party')).toBe(true);
  });

  it('is cut off by the Fitter too, with a remark', async () => {
    const g = await start();
    if (!present(g, 'peck') || !present(g, 'tibb') || !present(g, 'rainmother')) { return; }
    await g.play(...sitWithDov, 'Ask Dov to let you take the mask', 'Put on the Drowned', '>ombra__hospice_dorm', 'Let Peck see', 'Let Mother Tibb see',
      '>ombra__rain_hall_floor', 'Let the Rain-Wife see', '>ombra__pavane_parlour', 'Ask the Fitter to take the Drowned Face off you');
    expect(g.holds('masked', 'party')).toBe(false);
    expect(g.page).toContain('He will want it back');
  });
});

describe('What the Lane keeps', () => {
  it('keeps what was done across a night and a day: a cast, a trust, a boy\'s regard', async () => {
    const g = await start();
    await g.play('>ombra__fitting_room', "Sit in the Fitter's chair", ...sitWithDov);
    await g.play('=day 4 09:00');
    expect(g.holds('castTaken', 'party')).toBe(true);
    expect(g.holds('mk_dov_trusts', 'party')).toBe(true);
    expect(g.knows('mk_mask_fits_bare')).toBe(true);
    expect(g.knows('mk_wall_known')).toBe(true);
  });

  it('keeps the Fitter, Dov and the master of the shop where their hours put them', async () => {
    const g = await start();
    for (const [stamp, pavane, dov, maule] of [['=10:00', 'fitting_room', 'fitting_room', 'mask_shop_floor'],
      ['=21:00', 'pavane_parlour', 'maskers_roof', 'offstage'], ['=02:00', 'offstage', 'offstage', 'offstage']] as const) {
      await g.play(stamp);
      expect([g.at('pavane'), g.at('dov'), g.at('mk_maule')]).toEqual([pavane, dov, maule].map(x => `ombra__${x}`));
    }
  });

  it('never puts a person in two places, nor a fact where it cannot be, whatever the first thing offered is', async () => {
    const g = await start('explore');
    await g.play('=20:30', '>ombra__maskers_roof', 'Say you only came up for the air', 'Sit by Dov on the ridge', 'Ask Dov if you may try the mask on');
    const persons = ['pavane', 'dov', 'mk_maule', 'peck', 'tibb', 'rainmother', 'vane', 'lacke', 'moll'].filter(p => present(g, p));
    const skip = /^(Attack|Lift|Name|Sink|Make camp|Search)|Burn|Set down|Pack|Light|Wait › Until dark/;
    for (let i = 0; i < 200 && g.running; i++) {
      const offered = g.j.choices().filter(c => !skip.test(c.label) && !skip.test(c.full));
      if (!offered.length) { break; }
      const pick = offered[i % offered.length]!;
      try { await g.j.perform(pick.command, pick.label, pick.grave); } catch (e) { if (g.running) { throw e; } }
      const world = g.j.campaign.world;
      for (const p of persons) { expect(world.related('at', o(p)).length).toBeLessThanOrEqual(1); }
      expect(world.related('at', 'party').length).toBe(1);
      if (g.holds('mk_guiding', 'pavane')) { expect(g.at('pavane')).toBe('ombra__cast_cellar'); expect(at(g)).toBe('ombra__cast_cellar'); }
      if (g.knows('marrick_was_treasurer')) { expect(g.knows('lie_wall')).toBe(true); }
      if (g.holds('mk_cast_pavane', 'party')) { expect(g.knows('mk_pavane_was_bare')).toBe(true); }
      if (g.holds('mk_dov_holds', 'dov')) { expect(g.carries('mk_drowned_mask')).toBe(false); }
      if (g.holds('holdsFace', 'party', 'mk_face_drowned')) { expect(g.holds('mk_dov_holds', 'dov')).toBe(false); }
      if (g.holds('mk_drowned_burned', 'party')) { expect(g.carries('mk_drowned_mask')).toBe(false); }
    }
  });
});
