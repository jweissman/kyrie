import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';
import { MapPlay } from './support/map-play';

// The Silent Lord (data/situations/silent-lord, scenario silent-lord, a standing scenario): a keep whose lord is dead
// and unannounced, a herald with a writ under the court's old seal, a king's rider in the oubliette, a household of
// eleven who want different things, and a feast with a clock. Every spec plays by the page's own labels; the places a
// spec is put in (Placed.at) are named where it is, to skip the walk and never a mechanism.
const k = (id: string) => `keep__${id}`;
const start = async (calling = 'warrior', seed = 'kahitude') => Journey.of(await DrawnWorld.start(seed, { origin: 'debt',
  party: [{ name: 'Mira', raceId: 'human', classId: calling }] }, NodeBundleSource.shared));
const holds = (j: Journey, relation: string, ...args: string[]) => Placed.holds(j, `keep__${relation}`, ...args);
const knows = (j: Journey, fact: string) => Placed.holds(j, 'knows', 'party', k(fact));
const carries = (j: Journey, name: string) => j.choices().some(c => new RegExp(`^Pack › ${name}`, 'i').test(c.full));
const state = (j: Journey, thing: string) => j.campaign.world.one('state', k(thing));
// A day of the clock, at a place of the keep, with the world waited up to it first (a wait in the gatehouse after dusk
// is a wait among the night sentries).
const arrive = async (j: Journey, place: string, wait = '==day 10 09:00') => {
  await j.play(wait);
  Placed.at(j, k(place));
};
const GOLD = (j: Journey, n: number) => j.coin(n);

describe('the silent lord: where it stands in the world', () => {
  it.each(['kahitude', 'a1', 'b2', 'thorn', 'c3', 'd4', 'kite'])('is placed in %s on a keep generated for it, its people named for the country', async seed => {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, {});
    const p = w.report.placements.find(x => x.scenario === 'silent-lord');
    expect(p).toBeDefined();
    expect(p!.bindings.keep).toMatch(/^w\d+$/);
    expect(p!.generated).toContain(p!.bindings.keep!);
    const site = w.report.region.sites.find(s => s.id === p!.bindings.keep)!;
    expect(site.kind).toBe('hold');
    expect(p!.bindings.home).toBe('s1');
    expect(p!.modules).toEqual(['keep']);
  }, 240000);

  it.each(['kahitude', 'a1'])('casts every inhabitant by name from the country’s folk in %s, and draws who wrote to the herald', async seed => {
    const j = await start('warrior', seed);
    const names = ['castellan', 'steward', 'chaplain', 'marshal', 'clerk', 'houndsman', 'cook', 'porter', 'groom', 'herald', 'captive']
      .map(id => j.campaign.module.entities.find(e => e.id === k(id))!.name);
    expect(names.some(n => /^Someone/.test(n))).toBe(false);
    expect(new Set(names).size).toBe(names.length);
    const leaguers = ['steward', 'marshal', 'clerk'].filter(x => holds(j, 'leaguer', k(x)));
    expect(leaguers.length).toBe(1);
  }, 240000);

  it('is heard of from the crier on the first town’s green, and walked to from the map, and the gate is a gate', async () => {
    const id = (await WorldAssembler.assemble('kahitude', NodeBundleSource.shared, {})).report.placements
      .find(x => x.scenario === 'silent-lord')!.bindings.keep!;
    const j = await start('ranger');
    await j.play('==day 2 09:00', '>s1_green');
    expect(knows(j, 'levy_called')).toBe(true);
    const done = await MapPlay.reach(j, `region__${id}`);
    expect(done.arrived).toBe(true);
    // Come to it after dark, its gate is shut and the porter asked at the wicket: the morning opens it (the journey
    // ends later since the standing modules came into every country).
    if (!j.offers('Into the keep by the gate')) { await j.play('Wait › Until first light'); }
    expect(j.offers('Into the keep by the gate')).toBe(true);
    await j.play('Into the keep by the gate');
    expect(j.at('party')).toBe(k('gatehouse'));
  }, 300000);

  it('is set right by talking: pay the garrison, win the chaplain, the clerk and the castellan, lay the king’s seal beside the herald’s, and the regency holds', async () => {
    const j = await start('warrior');
    await arrive(j, 'ward');
    GOLD(j, 120);
    // The marshal: the pay-roll says why there has been no mutiny, and eighty crowns settles it.
    await j.play('Ask .* how the garrison stands', 'Ask .* what became of the Empire', 'Put eighty crowns');
    expect(holds(j, 'paid_off', k('house'))).toBe(true);
    expect(knows(j, 'reading_garrison')).toBe(true);
    // The household's tells: the cook's trays, the old dog's howl.
    await j.play('>keep__kitchen', 'Ask .* what the kitchen makes of the herald');
    expect(knows(j, 'lord_trays')).toBe(true);
    await j.play('>keep__kennels', 'Ask .* about the dogs');
    expect(knows(j, 'dog_howls')).toBe(true);
    // The chaplain, who has been waiting for someone to ask.
    await j.play('>keep__chapel', 'Ask .* about the lord.s cup, and the old dog');
    expect(knows(j, 'lord_dead')).toBe(true);
    expect(holds(j, 'befriended', k('chaplain'), 'party')).toBe(true);
    await j.play('Ask .* what became of the Empire', 'Ask .* for the key to the chapel lock');
    expect(carries(j, 'the chaplain.s key')).toBe(true);
    // The clerk: the spoiled sheets, then the press.
    await j.play('>keep__chancery', 'Pick through the spoiled sheets', 'Put the spoiled sheets', 'Ask .* for the press key', 'Open the press with the clerk');
    await j.play('the lord.s will: Take', 'the court.s letter of spring: Take');
    expect(carries(j, 'the lord.s will')).toBe(true);
    await j.play('Pack . the lord.s will . Read', 'Pack . the court.s letter of spring . Read');
    expect(knows(j, 'will_read')).toBe(true);
    expect(knows(j, 'seal_ears')).toBe(true);
    // The herald shows his writ, and the two seals do not agree.
    await j.play('>keep__guest', 'Ask .* to show you the king.s writ');
    expect(knows(j, 'seal_plain')).toBe(true);
    expect(knows(j, 'herald_false')).toBe(true);
    // The castellan, told what is known: she asks what is wanted, and is offered help.
    await j.play('>keep__chancery');
    await j.play('Tell .* you have seen the lord on his bier', 'Offer to help her hold the keep');
    expect(holds(j, 'befriended', k('castellan'), 'party')).toBe(true);
    await j.play('Tell .* the hall should hear it from her');
    expect(holds(j, 'castellan_ready', k('house'))).toBe(true);
    await j.play('>keep__chapel', 'Ask .* to tell the hall the truth at the feast');
    expect(holds(j, 'chaplain_ready', k('house'))).toBe(true);
    // The feast: the king’s seal laid before the hall; the chaplain and the castellan tell it.
    await j.play('>keep__hall', '==day 12 21:10');
    await j.play('Lay the king.s own writ before the hall');
    expect(holds(j, 'unmasked', k('house'))).toBe(true);
    await j.play('==day 12 23:30');
    expect(holds(j, 'proclaimed', k('house'))).toBe(true);
    expect(holds(j, 'reckoned', k('house'))).toBe(true);
    expect(state(j, 'banner')).toBe(k('regency'));
    // The first town: the levy commuted, and the town’s collection for whoever told the truth.
    // The road home crosses the Fishwater by Elmham, which is in spate the morning after rain (and is then only to be
    // risked, not walked): the company waits at Elmham's green for the river to fall, as a player would.
    await j.play('==day 13 12:00', '>region__s2_green', '=until not state(region__s3_s2_way_water, region__spate)', '>region__s1_green');
    expect(state(j, 'levy_post')).toBe(k('commuted'));
  }, 900000);
});
