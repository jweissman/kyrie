import { beforeAll, describe, expect, it } from 'bun:test';
import { Glanced } from './support/glanced';
import type { Glance } from '../src/presentation/glance-types';
import { ModuleWriter } from '../src/lang/module-writer';

// A place at a glance in a generated country (OWN-18, OWN-19): kite, come home as kin, Wenna the warrior. The page had
// opened the bridge-foot on some two hundred and forty words, five people and animals and twenty-three choices; the
// glance leads with its one line, the brother on the rail, and three things to do, each with why. Coming back is
// briefer; the aim ranks what is led with; a danger is met with what can be done about it and the way back; nothing the
// company could do is left out of what the page draws.
class Kite {
  static g: Glanced;
  // What the page draws to choose among holds everything the glance leads with and rows.
  static drawn(g: Glanced, glance: Glance) {
    const menu = new Set(g.menu());
    expect(glance.acts.map(a => a.choice).filter(id => !menu.has(id))).toEqual([]);
    expect(glance.ways.filter(id => !menu.has(id))).toEqual([]);
    expect(glance.acts.length).toBeLessThanOrEqual(3);
    for (const a of glance.acts) { expect([a.why, a.tier, a.facets[0]]).toEqual([a.why, expect.any(Number), 'here']); }
    // And nothing legal is lost: every command is still to be had somewhere the page draws.
    const reachable = g.reachable();
    expect(g.legal().filter(c => !reachable.has(c))).toEqual([]);
  }
}
describe('kite at a glance', () => {
  beforeAll(async () => { Kite.g = await Glanced.country('kite'); }, 120000);
  it('opens on the road in with one way to go on, toward the aim', () => {
    const glance = Kite.g.glance;
    expect(glance.arrival).toBe('opening');
    expect(glance.acts.map(a => [a.choice, a.why])).toEqual([['exit:region__s2_green', 'toward']]);
    expect(glance.aim).toMatch(/^Your father went out by the bridge/);
    expect(glance.aimed).toContain('exit:region__s2_green');
    Kite.drawn(Kite.g, glance);
  });
  it('comes to the bridge-foot: its own line, the brother on the rail, three things to do', async () => {
    const glance = await Kite.g.choose(/,region__s2_green\)$/);
    expect(glance.arrival).toBe('first');
    expect(glance.sight?.id).toBe('region__s2_day');
    expect(Glanced.sentences(glance.sight!.text)).toBeLessThanOrEqual(2);
    expect(glance.life).toMatchObject({ subject: 'drover__son', text: expect.stringMatching(/^Your brother is sitting on a rail/) });
    expect(glance.acts.map(a => [a.choice, a.why, a.note])).toEqual([
      ['drover__son#talk', 'kin', 'your brother'],
      ['exit:region__s5_s2_way', 'named', 'your aim'],
      // The grey dog that holds one forefoot off the ground is a sign, and Wynn the carter, a fourth, is not led with.
      ['drover__dog/0:Make much of the grey dog', 'sign', undefined]]);
    expect(glance.acts[1]!.facets).toEqual(['here', 'aimed']);
    // The taproom the dog lies at the door of is named: first of the ways rowed.
    expect(glance.ways[0]).toBe('exit:region__s2_taproom');
    const words = Kite.g.words();
    expect(words.glance).toBeLessThan(words.full / 2);
    Kite.drawn(Kite.g, glance);
  });
  it('stays where it is on a wait: what was done leads, and the place is not told again', async () => {
    const glance = await Kite.g.choose(/^wait(\(|$)/);
    expect([glance.arrival, glance.sight, glance.life]).toEqual(['stay', undefined, undefined]);
    expect(glance.acts[0]!.choice).toBe('drover__son#talk');
  });
  it('at the bridge the aim names, searches it, and has the ruts that run off the road', async () => {
    const glance = await Kite.g.to('region__s5_s2_way');
    expect(glance.arrival).toBe('first');
    expect(glance.acts[0]).toMatchObject({ why: 'named', note: 'where your aim is' });
    expect(glance.acts.map(a => a.choice)).toContain('drover__ruts#look');
    Kite.drawn(Kite.g, glance);
  });
  it('comes back to the bridge-foot more briefly: the line recalled, no one listed', async () => {
    const first = Kite.g.words();
    const glance = await Kite.g.to('region__s2_green');
    expect(glance.arrival).toBe('return');
    expect(glance.sight?.text).toBe('The road runs down between the houses of Brightbridge to the Redwater, goes straight in, and comes out on the far bank darker and wetter.');
    expect(glance.life).toBeUndefined();
    expect(Kite.g.words().glance).toBeLessThan(first.glance);
    expect(glance.acts.slice(0, 2).map(a => a.why)).toEqual(['kin', 'named']);
    Kite.drawn(Kite.g, glance);
  });
  it('at nightfall leads with the aim, marked for the dark, and the way to a bed', async () => {
    const glance = await Kite.g.choose(/^wait_for_dark(\(|$)/);
    expect(glance.arrival).toBe('stay');
    const [bridge, inn] = glance.acts;
    expect(bridge).toMatchObject({ choice: 'exit:region__s5_s2_way', why: 'named' });
    expect(bridge!.marks.map(m => m.kind)).toContain('night');
    expect(inn).toMatchObject({ choice: 'exit:region__s2_taproom', why: 'night', tier: 2 });
  });
  it('comes back at night to its night line, whole, and nothing said to have changed', async () => {
    await Kite.g.to('region__s5_s2_way');
    const glance = await Kite.g.to('region__s2_green');
    expect(glance.arrival).toBe('return');
    expect(glance.sight).toEqual({ id: 'region__s2_night', text: 'Brightbridge is shuttered for the night.' });
    expect(glance.changed).toEqual([]);
  });
  it('meets the den with what can be done about it, the attack weighed, and the way back', async () => {
    const glance = await Kite.g.to('region__w11');
    expect(glance.life).toMatchObject({ subject: 'den__beasts', danger: true });
    expect(glance.acts.map(a => [a.why, a.subject ?? a.exit])).toEqual([['danger', 'den__beasts'],
      ['danger', 'den__beasts'], ['retreat', 'exit:region__t2']]);
    const [gentle, attack, back] = glance.acts;
    expect(gentle!.command).toMatch(/^den__smoke_out\(/);
    expect(attack!.marks).toEqual([expect.objectContaining({ kind: 'fight' })]);
    expect(back!.note).toBe('the way you came');
    Kite.drawn(Kite.g, glance);
  });
  it('on the fells leads with their own act, and rows the compass', async () => {
    const glance = await Kite.g.to('region__t2');
    // Its own act, and the camp only for the company's weariness.
    expect(glance.acts.map(a => a.why)).toContain('own');
    for (const camp of glance.acts.filter(a => a.why === 'exposed')) { expect(camp.note).toBe('you are weary'); }
    expect(glance.ways.length).toBeGreaterThan(1);
    expect(Kite.g.screen.exits.filter(e => glance.ways.includes(e.id)).every(e => !!e.bearing)).toBe(true);
  });
  it('offers the den\'s plunder at the den, not on the fells beside it, once its beasts are gone', async () => {
    const c = Kite.g.campaign as unknown as { world: { apply(x: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('den__driven', 'den__beasts') },
      { kind: 'assert', call: ModuleWriter.call('peaceable', 'den__beasts') },
      { kind: 'retract', call: ModuleWriter.call('at', 'den__beasts', 'region__w11') }]));
    await Kite.g.choose(/^wait(\(|$)/);
    expect(Kite.g.legal().filter(id => id.includes('plunder'))).toEqual([]);
    const den = await Kite.g.to('region__w11');
    expect(Kite.g.legal().filter(id => id.includes('plunder'))).toHaveLength(1);
    expect(den.acts.map(a => a.why)).not.toContain('danger');
  });
  it('works the glance out in a few milliseconds', () => {
    expect(Kite.g.timed()).toBeLessThan(2);
  });
});
