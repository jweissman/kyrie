import { describe, expect, it } from 'bun:test';
import { Placed } from './support/placed';
import { KeepAlone as Keep } from './support/keep-alone';

// The Silent Lord's ways in that are the keep's own (data/situations/silent-lord), as a targeted scenario (see
// KeepAlone): mastiffs loosed at curfew that a bone or the houndsman will answer, and sentries who leave the wall in
// the dead watch. These cases had drawn a country first (test/silent-lord-ways); what needs the generated site stays
// there. The spec says where a company is put down to skip a walk, never to bypass a mechanism.
const k = Keep.id;

describe('the silent lord alone: the hounds and the dead watch', () => {
  it('looses its hounds in the ward at the bell: a marrow-bone from the cook, who is told of it by the houndsman, quiets them', async () => {
    const j = await Keep.at('kennels');
    await j.play('Ask .* about the dogs');
    expect(Keep.knows(j, 'hounds_bone')).toBe(true);
    await j.play('>keep__kitchen', 'Ask .* for a marrow-bone');
    expect(Keep.carries(j, 'a marrow-bone')).toBe(true);
    // Dusk: the ward is the hounds’.
    await j.play('=day 10 22:00');
    Placed.at(j, k('hall'));
    const told = await j.play('>keep__ward');
    expect(told).toMatch(/hounds come out of the dark/);
    expect(j.offers('Throw the hounds the marrow-bone')).toBe(true);
    await j.play('Throw the hounds the marrow-bone');
    expect(Placed.holds(j, 'tolerates', k('hounds'), 'party')).toBe(true);
    expect(Keep.carries(j, 'a marrow-bone')).toBe(false);
  }, 120000);

  it('has a houndsman who trusts whoever sits with the old dog, and tells that one the way under the wall', async () => {
    const j = await Keep.at('kennels');
    expect(j.offers('Ask .* how a person might come and go')).toBe(false);
    await j.play('Sit with the lord.s old dog');
    await j.play('Ask .* how a person might come and go');
    expect(Keep.knows(j, 'drain_known')).toBe(true);
    expect(Placed.holds(j, 'tolerates', k('hounds'), 'party')).toBe(true);
  }, 120000);

  it('leaves the wall empty between two and three in the morning: the sentries are at the brazier, and say so to whoever asks', async () => {
    const j = await Keep.at('gatehouse');
    await j.play('Ask the sentries when the watch changes');
    expect(Keep.knows(j, 'dead_watch')).toBe(true);
    await j.play('=day 11 01:30');
    expect(j.at(k('night_guard'))).toBe(k('walk'));
    // (The hounds are answered in the spec above; here they are taken as answered.)
    j.assert('tolerates', k('hounds'), 'party');
    Placed.at(j, k('ward'));
    await j.play('=day 11 02:10');
    expect(j.at(k('night_guard'))).toBe(k('gatehouse'));
    const quiet = await j.play('To the wall-walk');
    expect(quiet).not.toMatch(/Halt/);
    expect(j.at('party')).toBe(k('walk'));
  }, 120000);
});
