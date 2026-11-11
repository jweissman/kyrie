import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

// The Empire's posting-house (data/generation/works/roadstation.kyrt): one on the old road in every country, drawn
// after every other work so that nothing drawn before it moves, written in the Empire's voice, and left with its end
// unexplained. Its documents are read for lore; its ways in are a gate, a loft and two hidden culverts; its strong-room
// has a seal, a lock and a crowbar; and what it teaches leads on to the nearest other place on the road.
class Station {
  static async regionOf(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, {});
    const files = (w.source as unknown as { files: Map<string, string> }).files;
    return [...files.values()].join('\n');
  }
  static id(text: string) {
    return [...text.matchAll(/Place ((?:w|e)\d+)_gate "the carriage-arch"/g)].map(m => m[1]!);
  }
  static async at(cls: string, room: string, site = false, seed = 'kahitude') {
    const j = Journey.of(await DrawnWorld.start(seed, { origin: 'debt',
      party: [{ name: 'Mira', raceId: 'human', classId: cls }] }, NodeBundleSource.shared));
    const id = this.id(await this.regionOf(seed))[0]!;
    Placed.at(j, site ? `region__${id}` : `region__${id}_${room}`);
    return { j, id };
  }
}

describe('the Empire’s posting-house', () => {
  it.each(['kahitude', 'a1', 'thorn', 'c3'])('stands once on the old road in %s, numbered apart (e1) so that no other site’s id moves', async seed => {
    const text = await Station.regionOf(seed), ids = Station.id(text);
    expect(ids.length).toBe(1);
    expect(ids[0]).toMatch(/^e\d+$/);
    expect(text).toMatch(new RegExp(`Discovery ${ids[0]}_named `));
    expect(text).toMatch(new RegExp(`Place ${ids[0]}_cistern "the cistern"`));
  }, 120000);

  it('is read for lore: a mage reads the tariff and the day-book, a warrior is not offered the reading', async () => {
    const mage = await Station.at('mage', 'hall');
    expect(mage.j.offers('Read the notice on the door')).toBe(true);
    await mage.j.play('Read the notice on the door');
    expect(Placed.holds(mage.j, 'knows', 'party', `region__${mage.id}_posts`)).toBe(true);
    const warrior = await Station.at('warrior', 'hall');
    expect(warrior.j.offers('Read the notice on the door')).toBe(false);
  }, 120000);

  it('shows from its painted road the nearest other place on the road, and where to find it', async () => {
    const { j, id } = await Station.at('warrior', 'hall');
    await j.play('Follow the painted road along the wall');
    const text = await Station.regionOf('kahitude');
    const sight = /Observe \w+_map_found [^\n]* teaches (w\d+)_found/.exec(text)?.[1]
      ?? /teaches (w\d+)_found\./.exec(text)?.[1];
    expect(id).toMatch(/^e\d+$/);
    expect(sight).toBeDefined();
    expect(Placed.holds(j, 'knows', 'party', `region__${sight}_found`)).toBe(true);
  }, 120000);

  it('keeps its strong-room behind a balance, a seal, a lock, a crowbar and a hidden void, and its fisc holds a late coin', async () => {
    const { j, id } = await Station.at('mage', 'office');
    expect(j.offers('Set the standard weights in the pan, in order')).toBe(true);
    await j.play('Set the standard weights in the pan, in order', 'seal-ring: Take', 'Press the stationmaster\'s seal-ring');
    await j.play('Down to the fisc-room', 'light a candle', 'Break the lead seal and open the chest');
    expect(Placed.carried(j, `region__${id}_late_coin`)).toBe(false);
    await j.play('late coin: Take');
    expect(Placed.carried(j, `region__${id}_late_coin`)).toBe(true);
  }, 120000);

  it('can be entered without the gate: a hidden outfall culvert, found by searching at the post', async () => {
    const outside = await Station.at('mage', '', true);
    expect(outside.j.offers('Search here')).toBe(true);
    await outside.j.play('Search here');
    expect(outside.j.takes('Into the cistern by the outfall culvert')).toBe(true);
  }, 120000);

  it('trades the cistern’s dropped things for the heating-void: draining it floods the crawl to the strong-room', async () => {
    const { j, id } = await Station.at('warrior', 'stoke');
    await j.play('Search here');
    expect(Placed.holds(j, 'state', `region__${id}_flue`, 'region__dry')).toBe(true);
    await j.play('Turn the valve-wheel');
    expect(Placed.holds(j, 'state', `region__${id}_water`, 'region__low')).toBe(true);
    await j.play('=until untilLight(clock) == 1').catch(() => '');
    expect(Placed.holds(j, 'state', `region__${id}_flue`, 'region__wet')).toBe(true);
  }, 120000);
});
