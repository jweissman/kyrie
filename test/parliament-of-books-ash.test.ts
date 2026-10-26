import { describe, expect, it } from 'bun:test';
import { Arcs, Calamy, C, Steps } from './support/calamy';
import type { CreatureGenerationContext } from '../src/content';
import type { Journey } from '../src/session/journey';

// The Ash (doc/adventures/parliament-of-books/11-second-pass.md): books burned without leave go down to the
// Cinderfield under the Foxing, where Censor-General Pardoe's Index drills them for the Kindling. Each way of
// answering it is one journey: the Lamp's flame, the names read, Rhule's light put out, the knife fought.
const withCrake = [...Steps.corvell, ...Steps.crakeTrust];
const taper = ['go:vestry', 'Talk to Canon', 'light from the Lamp', 'Take your leave', 'taper lit at the Lamp: Take'];
const burning = ['go:ashpit', '=169'];
const reached = (j: Journey) => j.campaign.world.related('reached').map(r => r.args[0]);

describe('A Parliament of Books: the Ash', () => {
  it('hears where the burned copies went; carries the Lamp\'s flame through the Cinderfield; and hears the Index out', async () => {
    const j = await Calamy.start('ash');
    await Calamy.play(j, ...Steps.arrive, ...burning, 'Talk to the Almanack', 'where its burned copies went', 'Take your leave',
      'go:nave', ...taper);
    for (const f of ['ash_rumour', 'pardoe_known', 'taper_given']) { expect(Calamy.knows(j, f)).toBe(true); }
    await Calamy.play(j, ...withCrake, 'go:cinderfield');
    // The burned give way to a flame every book in Calamy consented to.
    expect(j.at('party')).toBe(C('cinderfield'));
    expect(j.holds('tolerates', C('cinders'), 'party')).toBe(true);
    for (const f of ['ash_known', 'rhule_beam', 'almanack_kin']) { expect(Calamy.knows(j, f)).toBe(true); }
    await Calamy.play(j, 'Search here', 'Talk to the Almanack', 'last year.s almanack', 'Take your leave');
    expect(Calamy.knows(j, 'father_cinder')).toBe(true);
    expect(Calamy.holds(j, 'almanackSawAsh', 'almanack')).toBe(true);
    await Calamy.play(j, 'go:hearth', 'Talk to the Index', 'who it is', 'what it means to do', 'anything would keep', 'Take your leave');
    expect(Calamy.knows(j, 'index_bargain')).toBe(true);
    expect(j.holds('tolerates', C('penknife'), 'party')).toBe(true);
    expect(Calamy.holds(j, 'indexEnded', 'index')).toBe(false);
  }, 600000);

  it('tells Hester Rhule her father\'s book is in the Ash and her reading lights the Index; she puts out her candle, '
    + 'lends her register, and the burned are read their names', async () => {
    const j = await Calamy.start('rhule-ash');
    await Calamy.play(j, ...Arcs.rhuleKept, 'Talk to Hester', 'why she reads out every title', 'Take your leave', ...taper,
      ...withCrake, 'go:cinderfield', 'Search here', 'go:remainder_market', 'go:imp_kitchen', '=218', 'Talk to Hester',
      'her father.s knot', 'only light the Index has', 'lend you her register', 'Take your leave', 'go:rhule_room',
      'register of the burned: Take');
    expect(Calamy.holds(j, 'rhuleKnowsFather', 'rhule')).toBe(true);
    expect(Calamy.holds(j, 'rhuleStopsReading', 'rhule')).toBe(true);
    await Calamy.play(j, 'go:remainder_market', 'go:cinderfield', 'Read the burned their names');
    expect(Calamy.holds(j, 'ashReleased', 'cinders')).toBe(true);
    expect(j.at(C('cinders'))).not.toBe(C('cinderfield'));
    // A day and a half without her light, and the Index foxes like any unread book.
    await Calamy.play(j, `=${j.watch() + 40}`);
    expect(Calamy.holds(j, 'indexFaded', 'index')).toBe(true);
  }, 600000);

  it('a soldier goes down by force: through the pickets and the ranks, past the Penknife, and the Index into its own fire',
    async () => {
      const j = await Calamy.start('ash-fight',
        [{ name: 'Brand', raceId: 'human', classId: 'warrior', backgroundId: 'soldier', level: 8 } as CreatureGenerationContext]);
      await Calamy.play(j, ...withCrake, 'go:char_edge', 'Attack', 'go:cinderfield', 'Attack', 'go:hearth', 'Attack');
      expect(j.holds('dead', C('penknife')) || Calamy.holds(j, 'routed', 'penknife')).toBe(true);
      await Calamy.play(j, 'Throw the Index into its own furnace');
      expect(Calamy.holds(j, 'indexBurned', 'index')).toBe(true);
      // Nothing else done: the almanacks burn at the Kindling, but there is no Index to take them. The Year of Voices.
      for (const w of [1240, 1300]) { try { await j.play(`=${w}`); } catch (e) { if (!reached(j).length) { throw e; } } }
      expect(Calamy.holds(j, 'almanacksBurned', 'ashpit')).toBe(true);
      expect(reached(j)).toEqual([C('unsewn')]);
    }, 900000);
});
