import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { KeepAlone as Keep } from './support/keep-alone';

// What the keep becomes, and what the first town is told of it (data/situations/silent-lord, feast.kyr and town.kyr),
// as a targeted scenario (see KeepAlone): a poisoned cup, a wrong word before the hall, an unpaid garrison, and the
// reckoning kept through a save. These cases had each drawn a country and walked across it (test/silent-lord-turns,
// up to ten minutes a case); the walk to the first town's green, which a spate on the ford could stop (AI-02), is not
// what they test, and the company is put down on the host's green (`gossip`) instead. Where a spec puts the company
// down or gives it a fact, it says so.
const k = Keep.id;

describe('the silent lord alone: consequences that leave the keep', () => {
  it('can be ended by a cup: the herald dies at the feast, the garrison paid, the lie holds, the town’s levy is remitted, and a save keeps it', async () => {
    const j = await Keep.at('kitchen');
    await j.play('=day 12 11:00', '>keep__ward');
    j.coin(100);
    await j.play('Ask .* how the garrison stands', 'Put eighty crowns');
    await j.play('>keep__kitchen', 'Ask .* what is in the jar', 'Peel and chop', 'Ask .* for the jar of monkshood');
    expect(Keep.carries(j, 'a jar of monkshood')).toBe(true);
    j.roll('pass');
    await j.play('Stir the monkshood into the herald');
    j.roll();
    expect(Keep.holds(j, 'dosed', k('house'))).toBe(true);
    await j.play('=day 12 19:30', '>keep__hall', '=day 12 21:30');
    expect(Placed.holds(j, 'dead', k('herald'))).toBe(true);
    expect(Keep.holds(j, 'unmasked', k('house'))).toBe(true);
    await j.play('=day 12 23:30');
    expect(Keep.state(j, 'banner')).toBe(k('hushed'));
    const again = PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true });
    expect(again.campaign.world.one('state', k('banner'))).toBe(k('hushed'));
    await j.play('=day 13 12:00');
    Placed.at(j, 'host__green'); // (put down on the first town's green: the walk there is not the point)
    await j.play('Wait › A while');
    expect(Keep.state(j, 'levy_post')).toBe(k('quashed'));
    Placed.at(j, 'host__taproom'); // (the host's rooms have no ways between them)
    await j.play('Ask .* what the remission has done');
    expect(Keep.holds(j, 'paid_keeper', k('house'))).toBe(true);
  }, 120000);

  it('turns the household on a company that names the seal a forgery with nothing to lay beside it: the herald’s men fall on them', async () => {
    const j = await Keep.at('kitchen');
    await j.play('=day 12 20:00', '>keep__hall');
    Placed.knows(j, k('lord_dead'));
    Placed.knows(j, k('herald_false'));
    await j.play('=day 12 21:10');
    j.roll('fail');
    await j.play('Name the herald.s seal a forgery');
    j.roll();
    expect(Keep.holds(j, 'hunted', k('house'))).toBe(true);
    expect(Keep.holds(j, 'unmasked', k('house'))).toBe(false);
    expect(Placed.holds(j, 'peaceable', k('bravos'))).toBe(false);
  }, 120000);

  it('lets a garrison that is not paid take the keep when the death is told: the castellan goes to her own oubliette, and unpaid spearmen ask a toll on the first town’s green', async () => {
    const j = await Keep.at('kitchen');
    // Ansel has been won (given as a fact: the duel and the misunderstanding have their own specs), or he would
    // call the company out across the hall at the second cup and halt it where it stands.
    j.assert('befriended', k('ansel'), 'party');
    j.assert('tolerates', k('hands'), 'party'); // (and the Hands, unpaid, would halt a company that knows the lord is dead)
    await j.play('=day 12 20:00', '>keep__hall');
    Placed.knows(j, k('lord_dead'));
    Placed.knows(j, k('herald_false'));
    await j.play('=day 12 21:10');
    j.roll('pass');
    await j.play('Name the herald.s seal a forgery', 'Rise at the high table and tell the hall');
    j.roll();
    expect(Keep.holds(j, 'unmasked', k('house'))).toBe(true);
    expect(Keep.holds(j, 'proclaimed', k('house'))).toBe(true);
    await j.play('=day 12 23:30');
    expect(Keep.state(j, 'banner')).toBe(k('mutinous'));
    expect(j.at(k('castellan'))).toBe(k('oubliette'));
    await j.play('=day 14 12:00');
    Placed.at(j, 'host__green'); // (put down on the first town's green: the walk there is not the point)
    await j.play('Wait › A while');
    expect(j.at(k('deserters'))).toBe('host__green');
    expect(Keep.state(j, 'levy_post')).toBe(k('abandoned'));
  }, 120000);
});
