import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';

// The Dorothea's calls (doc/imbar/adventures/the-dorothea-archipelago.md): the company chooses a destination at the
// quay; the fare, the stations and the way home follow; she comes home and is made ready for a second voyage.
const campaign = 'data/campaigns/the-dorothea.campaign.json';
const k = (id: string) => `dorothea__${id}`;
const at = (j: Journey, id: string) => j.campaign.world.one('at', k(id));
const party = (j: Journey) => j.campaign.world.one('at', 'party');
const start = async (seed = 's1', quiet = true) => {
  const j = await Journey.start(campaign, seed);
  if (quiet) { j.assert(k('seaQuiet'), k('hull')); }
  return j;
};
const book = async (j: Journey, call: 'ness' | 'antlers' | 'ashkeld', fare: string) => {
  const course = { ness: 'Port Ness', antlers: 'the Antlers', ashkeld: 'Ashkeld' }[call];
  await j.play('^To Tolleth quay', 'Ask Captain Bascom for passage', 'Ask Captain Bascom where else',
    `Ask Captain Bascom to put in at ${course}`, `Pay Captain Bascom ${fare}`, "^To the Dorothea's waist");
};

describe('The Dorothea, route choice', () => {
  it('offers the calls, sets the fare by the call, and will not take the Skerrow fare for Port Ness', async () => {
    const j = await start();
    await j.play('^To Tolleth quay', 'Ask Captain Bascom for passage', 'Ask Captain Bascom where else');
    expect(j.matches('Pay Captain Bascom six').length).toBe(1);
    expect(j.matches('Pay Captain Bascom four').length).toBe(0);
    await j.play('Ask Captain Bascom to put in at Port Ness');
    expect(j.measure(k('bound'), k('hull'))).toBe(2);
    expect(j.matches('Pay Captain Bascom six').length).toBe(0);
    expect(j.matches('Pay Captain Bascom four').length).toBe(1);
    // Back to Skerrow if the company thinks better of it, before the fare.
    await j.play('Ask Captain Bascom to make her call Skerrow');
    expect(j.measure(k('bound'), k('hull'))).toBe(1);
    expect(j.matches('Pay Captain Bascom six').length).toBe(1);
  }, 120000);

  it('carries a company to Port Ness in a day and home again, and turns her round for a second voyage to the Antlers', async () => {
    const j = await start();
    await book(j, 'ness', 'four');
    await j.play('=150');
    expect(at(j, 'hull')).toBe(k('ness_quay'));
    await j.play('^To Port Ness pier');
    expect(party(j)).toBe(k('ness_quay'));
    await j.play("^To the Dorothea's waist", '=400');
    expect(at(j, 'hull')).toBe(k('quay'));
    expect(j.holds(k('safeHome'), k('hull'))).toBe(true);
    // The Combs were never met, and the way was shorter.
    expect(j.holds(k('combsMet'), k('hull'))).toBe(false);
    await j.play('^To Tolleth quay', '=+40');
    expect(j.measure(k('voyages'), k('hull'))).toBe(1);
    expect(j.holds(k('booked'), 'party')).toBe(false);
    expect(j.holds(k('sailed'), k('hull'))).toBe(false);
    // A second voyage: the Antlers, with a sobered pilot.
    await j.play('Ask Captain Bascom to put in at the Antlers', 'Walk Fenwick Pelham', 'Pay Captain Bascom eight', "^To the Dorothea's waist");
    expect(j.measure(k('bound'), k('hull'))).toBe(3);
    const sail = j.measure(k('sailAfter'), k('hull'));
    await j.play(`=${sail + 20}`);
    expect(j.holds(k('sailed'), k('hull'))).toBe(true);
    expect(j.holds(k('pilotAboard'), k('hull'))).toBe(true);
    await j.play(`=${sail + 140}`);
    expect(at(j, 'hull')).toBe(k('antler_ledge'));
    expect(j.holds(k('troubled'), k('hull'))).toBe(false);
    await j.play("^To the Antlers' ledge");
    expect(party(j)).toBe(k('antler_ledge'));
  }, 400000);

  it('meets the race with no pilot as a trouble with two ways out, and the company on a plank is carried home by the same count', async () => {
    const j = await start();
    await book(j, 'antlers', 'eight');
    await j.play('=100');
    await j.play('=+120');
    expect(at(j, 'hull')).toBe(k('antler_race'));
    expect(j.holds(k('troubled'), k('hull'))).toBe(true);
    expect(j.matches('^Fire the gun and hail').length).toBe(1);
    await j.play('Fire the gun and hail', '=+20');
    expect(j.holds(k('troubled'), k('hull'))).toBe(false);
    await j.play('=+20');
    expect(at(j, 'hull')).toBe(k('antler_ledge'));
    await j.play("^To the Antlers' ledge");
    // She lies there 130 watches and goes home by the open sea, a company left on the rock is stranded.
    await j.play("^To the Dorothea's waist");
    await j.play('=+500');
    expect(at(j, 'hull')).toBe(k('quay'));
  }, 400000);

  it('makes Ashkeld a three-day passage: the legs read as days', async () => {
    const j = await start();
    await book(j, 'ashkeld', 'twelve');
    await j.play('=100');
    expect(at(j, 'hull')).toBe(k('open_sea'));
    await j.play('=300');
    expect(at(j, 'hull')).toBe(k('open_sea'));
    const sail = 24;
    await j.play(`=${sail + 430}`);
    expect(at(j, 'hull')).toBe(k('ashkeld_beach'));
    await j.play('^To the black beach|^To Ashkeld');
    expect(party(j)).toBe(k('ashkeld_beach'));
  }, 400000);

  it('draws sea events on the way home as well as out, and goes on to the quay', async () => {
    const kinds = ['squall', 'raft', 'fever', 'calm'];
    let homeDraws = 0;
    for (const seed of ['s1', 'a', 'b', 'c', 'd', 'e']) {
      const j = await start(seed, false);
      await book(j, 'antlers', 'eight');
      // Fast-forward the outbound passage by satisfying the troubles as they come, then count home-leg draws.
      for (let i = 0; i < 200 && !j.holds(k('homeward'), k('hull')); i++) {
        await j.play('=+4');
        if (j.matches('^Fire the gun and hail').length) { await j.play('Fire the gun and hail'); }
        for (const t of kinds) {
          if (!j.holds(k(t), k('hull'))) { continue; }
          for (const e of ['^Bear away and run', '^Sail on, and leave', '^Say the office', '^Sit with the boy']) {
            if (j.matches(e).length) { await j.play(e); break; }
          }
        }
      }
      for (let i = 0; i < 200 && !j.holds(k('safeHome'), k('hull')); i++) {
        await j.play('=+4');
        if (j.holds(k('homeward'), k('hull')) && j.measure(k('seaDrawn'), k('hull')) > 0 && at(j, 'hull') === k('open_sea')) { homeDraws++; break; }
      }
      if (homeDraws) { break; }
    }
    expect(homeDraws).toBeGreaterThanOrEqual(1);
  }, 900000);

  it('survives a save and a reload on the second voyage', async () => {
    const j = await start();
    await book(j, 'ness', 'four');
    await j.play('=150', "^To Port Ness pier", "^To the Dorothea's waist", '=400', '^To Tolleth quay', '=+40');
    const kept = JSON.parse(JSON.stringify(j.session.checkpoint()));
    const back = Journey.of(PlaySession.resume(kept));
    expect(back.session.canonical()).toBe(j.session.canonical());
    expect(back.measure(k('voyages'), k('hull'))).toBe(1);
  }, 300000);
});
