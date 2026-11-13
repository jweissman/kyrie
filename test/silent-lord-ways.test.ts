import { describe, expect, it } from 'bun:test';
import { Placed } from './support/placed';
import { Keep } from './support/keep';

// The Silent Lord’s ways in and its dangers (data/situations/silent-lord): a gate shut at nine and opened to a civil
// word, a bell or three crowns; mastiffs loosed at curfew that a bone, the houndsman or a fight will answer; sentries
// who leave the wall in the dead watch; a drain with bad air and a vault older than the keep; a household that turns on
// a stranger caught at it. The spec says where a company is put down to skip a walk, never to bypass a mechanism.
const k = Keep.id;

describe('the silent lord: ways in, and what they cost', () => {
  it('shuts its gate at nine: a civil word at the bell opens the wicket, and the porter remembers three crowns', async () => {
    const site = await Keep.site();
    const j = await Keep.start();
    await j.play('=day 3 22:00');
    Placed.at(j, `region__${site}`);
    expect(j.takes('Into the keep by the gate')).toBe(false);
    expect(j.seen()).toContain('bell-rope');
    j.roll('pass');
    await j.play('Ring the bell and ask the porter');
    j.roll();
    expect(j.takes('Into the keep by the gate')).toBe(true);
    await j.play('Into the keep by the gate');
    expect(j.at('party')).toBe(k('gatehouse'));
    // And the same, paid: three crowns through the grating.
    const k2 = await Keep.start();
    await k2.play('=day 3 22:00');
    Placed.at(k2, `region__${site}`);
    k2.coin(10);
    await k2.play('Slip the porter three crowns');
    expect(k2.takes('Into the keep by the gate')).toBe(true);
  }, 300000);

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
  }, 300000);

  it('has a houndsman who trusts whoever sits with the old dog, and tells that one the way under the wall', async () => {
    const j = await Keep.at('kennels');
    expect(j.offers('Ask .* how a person might come and go')).toBe(false);
    await j.play('Sit with the lord.s old dog');
    await j.play('Ask .* how a person might come and go');
    expect(Keep.knows(j, 'drain_known')).toBe(true);
    expect(Placed.holds(j, 'tolerates', k('hounds'), 'party')).toBe(true);
  }, 240000);

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
  }, 300000);

  it('has a drain under the wall whose bad air a bar to the old grating clears, rats in it, a vault older than the keep, and by the oubliette a rider to be freed', async () => {
    // A warrior of the second level, as the keep's own are (its watch, its mutineers, the man at the solar stair): the
    // case is the drain's contents, past its rats, a warned fight a lone first-level warrior wins 95 times in 100
    // (94 before only a wound bled). At the first level it had rested on one of those rolls: when a blow for nothing
    // stopped making a rat save against shred, the next roll was a bleed of two at her two hit points.
    const j = await Keep.at(`region__${await Keep.site()}`, { wait: '=day 4 10:00', level: 2 });
    await j.play('Search here');
    expect(Keep.knows(j, 'drain_known')).toBe(true);
    j.give('crowbar');
    await j.play('A torch . Light');
    await j.play('prop the old grating open');
    expect(Keep.state(j, 'foul_air')).toBe(k('clear'));
    await j.play('Into the drain');
    expect(j.at('party')).toBe(k('drain'));
    await j.fight('Attack');
    await j.play('To the old vault');
    expect(Keep.knows(j, 'vault_known')).toBe(true);
    await j.play('a bronze die: Take', 'Search here', 'To the oubliette');
    expect(j.at('party')).toBe(k('oubliette'));
    await j.play('Ask .* who he is', 'Ask the rider to come out with you');
    expect(Keep.knows(j, 'captive_story')).toBe(true);
    expect(Keep.holds(j, 'freed', k('captive'))).toBe(true);
    await j.play('lift the bar off the hatch', 'To the undercroft');
    expect(j.at('party')).toBe(k('undercroft'));
    expect(j.at(k('captive'))).toBe(k('undercroft'));
  }, 400000);
});
