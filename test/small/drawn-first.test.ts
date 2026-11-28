import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';

// What is in a room is one act to draw out (OR-1950). The deep renewed sends its newcomers into the room where the
// company killed a band; on s4 they came into the haulage beside its pump's dwellers, and two bands to draw out of one
// room had been two acts of the same words ("Draw out what is in the haulage, and wait for it here"), so the engine
// refused to draw the page at all ("Ambiguous public command") and the five expeditions stopped there. Now the band
// that was there before the newcomers comes first, the newcomers after it.
const world = `
  Place yard "the shaft bottom" is room at 0, 0 underground.
  Place haulage "the haulage" is room at 1, 0 underground.
  Passage run "the haulage way" is passage between yard and haulage.
  Person pumpers "the pump's dwellers" at haulage { Role "what lives by the pump". Species rat. Numbers 2. Level 1. Temperament savage. }
  Person newcomers "the newcomers" at haulage { Role "what came in after". Species rat. Numbers 2. Level 1. Temperament savage. }
  Initially Assert drawable(pumpers). Initially Assert drawable(newcomers).
  Initially Assert deepHeld(newcomers, haulage).
  Company party "You" of 1 at yard.
  Goal false.`;
const draws = (t: Tiny) => PlayerView.choices(t.campaign).filter(x => x.choice.name.startsWith('Draw out'));
describe('two bands to draw out of one room', () => {
  it('is one act, the band there before the newcomers drawn first', async () => {
    const t = await Tiny.start(world, { horizon: ['inhabitants', 'canon'],
      party: [{ name: 'Odile', raceId: 'human', classId: 'warrior' }] });
    const offered = draws(t);
    expect(offered.map(x => x.choice.name)).toEqual(['Draw out what is in the haulage, and wait for it here']);
    expect(offered[0]!.action.id).toContain('t__pumpers');
  });
});
