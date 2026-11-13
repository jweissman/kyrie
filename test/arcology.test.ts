import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';
import { Placed } from './support/placed';
import { MapPlay } from './support/map-play';

// The Numbered House (data/situations/arcology, data/scenarios/arcology.scenario.json): a standing scenario, so every
// first country holds one. These specs play its mechanisms by the page's own labels. A spec sets the company down in
// a room with `Placed.at` only to skip the walk there, never to bypass what the room does; where a spec asserts a fact
// to reach a later room (the lift mended, the Roll written in) the mechanism that makes it so has its own spec.
class House {
  static readonly seeds = ['kahitude', 'a1', 'b2', 'thorn', 'c3', 'd4', 'kite'];
  // Names of the House's own, in full: its states are named like the region's (open, read, low), so a short name
  // would be taken for the region's.
  static a(x: string) { return x === 'party' || x.includes('__') ? x : `arcology__${x}`; }
  static is(j: Journey, rel: string, ...args: string[]) { return j.holds(rel, ...args.map(x => this.a(x))); }
  static n(j: Journey, rel: string, ...args: string[]) { return j.measure(rel, ...args.map(x => this.a(x))); }
  // A fact made so for the test is seen by the page after the next command, so a short wait follows it.
  static async set(j: Journey, rel: string, ...args: string[]) {
    j.assert(rel, ...args.map(x => this.a(x)));
    await j.play('Wait › A while');
  }
  static async world(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'debt', party: [{ name: 'Mira', raceId: 'human', classId: 'warrior' }] });
    const p = w.report.placements.find(x => x.scenario === 'arcology');
    return { w, p, text: [...(w.source as unknown as { files: Map<string, string> }).files.values()].join('\n') };
  }
  static async start(seed = 'kahitude', cls = 'warrior') {
    return Journey.of(await DrawnWorld.start(seed, { origin: 'debt',
      party: [{ name: 'Mira', raceId: 'human', classId: cls }] }, NodeBundleSource.shared));
  }
  static async at(room: string, seed = 'kahitude', cls = 'warrior', lit = true) {
    const j = await this.start(seed, cls);
    Placed.at(j, `arcology__${room}`, lit);
    return j;
  }
  // Which of the stair's three orders this country's House keeps, and the plates that strike it.
  static order(j: Journey): string[] {
    const plates: Record<string, string[]> = { pat_a: ['Strike the middle disc', 'Strike the small disc', 'Strike the great disc'],
      pat_b: ['Strike the great disc', 'Strike the small disc', 'Strike the middle disc'],
      pat_c: ['Strike the small disc', 'Strike the middle disc', 'Strike the great disc'] };
    return plates[['pat_a', 'pat_b', 'pat_c'].find(p => House.is(j, 'pattern', 'treads', p))!]!;
  }
  static hum(j: Journey) { return this.n(j, 'hum', 'house'); }
}

describe('the Numbered House is a standing scenario', () => {
  it.each(House.seeds)('is installed in %s on a site generated for it, with three rumours and its own module', async seed => {
    const { p, text, w } = await House.world(seed);
    expect(p).toBeDefined();
    expect(p!.generated.length).toBe(1);
    expect(p!.modules).toEqual(['arcology']);
    expect(p!.bindings.works).toMatch(/^w\d+$/);
    for (const hook of ['arcology.rumour', 'arcology.hum_talk', 'arcology.culvert_talk']) {
      expect(p!.carriers[hook]?.length ?? 0).toBeGreaterThan(1);
    }
    expect(w.report.region.sites.find(s => s.id === p!.bindings.works)!.kind).toBe('ruin');
    expect(text).toMatch(/word-arcology/);
  }, 180000);

  it('is held by every first country whatever else is drawn, after the drawn scenarios, once', async () => {
    const standing = JSON.parse(await NodeBundleSource.shared.read(NodeBundleSource.shared.resolve('data/scenarios/standing.json'))) as
      { scenarios: string[] };
    expect(standing.scenarios).toContain('arcology.scenario.json');
    const { w } = await House.world('a1');
    const order = w.report.placements.map(x => x.scenario);
    expect(order.filter(s => s === 'arcology').length).toBe(1);
    expect(order.indexOf('arcology')).toBeGreaterThan(order.indexOf('circus') - 1);
  }, 120000);
});

describe('finding the House', () => {
  it('is overheard in the first town’s taproom from the third day, leads the page as an aim, and is set out for from the map', async () => {
    const { p } = await House.world('kahitude');
    const site = p!.bindings.works!;
    const j = await House.start('kahitude');
    // Nothing is said of it on the first day, or the second.
    await j.play('>s1_taproom');
    expect(House.is(j, 'knows', 'party', 'rumour')).toBe(false);
    await j.play('=day 2 09:00');
    expect(House.is(j, 'knows', 'party', 'rumour')).toBe(false);
    const heard = await j.play('=day 3 09:00');
    expect(heard).toMatch(/Some say the hill hums/);
    expect(House.is(j, 'knows', 'party', 'rumour')).toBe(true);
    expect(ScreenModel.build(j.campaign).objectives.join(' ')).toMatch(/bends round a hill with nothing in it/);
    // Out of doors first: from inside a building nothing is set out for across the country (the owner, 14 November:
    // CN-02, no overland travel that bypasses the place's own ways).
    await j.play('>s1_green');
    const done = await MapPlay.press(j, `region__${site}`);
    expect(done).toEqual({ to: `region__${site}`, arrived: true });
    expect(j.at('party')).toMatch(new RegExp(`${site}$`));
  }, 300000);

  it('is told of too by the nearest town’s keepers: the hum and the culvert are asked about there', async () => {
    const { p } = await House.world('kahitude');
    const town = p!.bindings.town!, site = p!.bindings.works!;
    const j = await House.start('kahitude');
    await j.play(`>${town}_taproom`);
    expect(j.offers('Ask about the bend in the old road')).toBe(true);
    await j.play('Ask about the bend in the old road');
    expect(House.is(j, 'knows', 'party', 'rumour')).toBe(true);
    // The hook that names the culvert reveals the hidden way; the one that names the hum does not.
    await j.play('Ask about the hum');
    expect(House.is(j, 'knows', 'party', 'hum_talk')).toBe(true);
    const arrived = await j.play(`>${site}`);
    expect(arrived).toMatch(/fallen walls/);
    expect(j.at('party')).toMatch(new RegExp(`${site}$`));
  }, 240000);

  it('shows the Bend’s milestone, the hum under the hand, and a second way in by the brook: searched for, then swum', async () => {
    const { p } = await House.world('kahitude');
    const site = p!.bindings.works!;
    const j = await House.start('kahitude', 'mage');
    Placed.at(j, `region__${site}`);
    expect(j.offers('Read the figures on the milestone')).toBe(true);
    await j.play('Read the figures on the milestone');
    expect(House.is(j, 'state', 'bend_stone', 'read')).toBe(true);
    expect(j.takes('Into the sluice-race')).toBe(false);
    await j.play('Search here');
    expect(j.takes('Into the sluice-race')).toBe(true);
  }, 240000);
});

describe('the Count', () => {
  it('asks how many you are and how many you lead: a lone warrior is one, two wrong answers bring the Usher down on her, the right one stills it', async () => {
    const j = await House.at('lodge', 'kahitude', 'warrior');
    expect(j.offers('Give the post your number: one')).toBe(true);
    await j.play('Give the post your number: three');
    expect(House.n(j, 'errors', 'party')).toBe(1);
    expect(House.hum(j)).toBe(1);
    await j.play('Give the post your number: two');
    expect(j.latest).toMatch(/The Usher comes at you/);
    expect(House.is(j, 'counted', 'party')).toBe(false);
    const k = await House.at('lodge', 'kahitude', 'warrior');
    await k.play('Give the post your number: one');
    expect(House.is(k, 'counted', 'party')).toBe(true);
    expect(House.is(k, 'tolerates', 'usher', 'party')).toBe(true);
    expect(House.is(k, 'state', 'usher', 'stood_aside')).toBe(true);
    expect(k.offers('To the Terrace of Tiers')).toBe(true);
  }, 300000);

  it('counts those you lead as heads: the led are the second answer, and one is then wrong', async () => {
    const j = await House.at('lodge', 'kahitude', 'warrior');
    j.assert('following', 'arcology__salvager', 'party');
    j.put('arcology__salvager', 'arcology__lodge');
    await j.play('Give the post your number: one');
    expect(House.is(j, 'counted', 'party')).toBe(false);
    await j.play('Give the post your number: two');
    expect(House.is(j, 'counted', 'party')).toBe(true);
  }, 300000);

  it('can be fought, and can be talked to: the Usher says who is permitted', async () => {
    const j = await House.at('lodge', 'kahitude', 'warrior');
    await j.play('Ask the Usher who is permitted');
    expect(j.latest).toMatch(/THE PERMITTED ARE THE COUNTED/);
    await j.play('Ask the Usher what happens to those who are not counted');
    expect(j.latest).toMatch(/THEY WAIT/);
  }, 240000);
});

describe('the Stair That Counts', () => {
  it.each(['kahitude', 'a1', 'thorn'])('is stilled in %s by the order its country keeps, and a wrong plate costs the hum', async seed => {
    const j = await House.at('lodge', seed, 'mage');
    await j.play('Give the post your number: one');
    expect(House.is(j, 'counted', 'party')).toBe(true);
    const order = House.order(j);
    // A plate struck out of order rings flat, resets the stair and raises the hum.
    const wrong = order[1]!;
    await j.play(wrong);
    expect(House.n(j, 'progress', 'treads')).toBe(0);
    expect(House.hum(j)).toBe(1);
    for (const plate of order) { await j.play(plate); }
    expect(House.is(j, 'state', 'treads', 'stilled')).toBe(true);
    expect(j.offers('To the Terrace of Tiers')).toBe(true);
  }, 300000);

  it('names its order in three hands, of which exactly one is true in each country, and the Hall’s tablet settles it', async () => {
    const claims = { pat_a: 'MIDDLE, HIGH, LOW', pat_b: 'LOW, HIGH, MIDDLE', pat_c: 'HIGH, MIDDLE, LOW' };
    for (const seed of ['kahitude', 'a1', 'b2', 'thorn']) {
      const j = await House.at('hall', seed, 'mage');
      const truth = (['pat_a', 'pat_b', 'pat_c'] as const).find(p => House.is(j, 'pattern', 'treads', p))!;
      await j.play('Ask the tablet marked with steps');
      expect(j.latest).toContain(claims[truth]);
    }
  }, 600000);
});

describe('the Bridge of Weights', () => {
  it('tips a company that carries more than ten to the head, and throws it back to the near end, hurt; it rights itself in an hour', async () => {
    const j = await House.at('bridge_near', 'kahitude', 'warrior');
    expect(j.latest + j.seen()).toMatch(/Ten to the head/);
    await j.play('To the middle of the Bridge of Weights');
    expect(House.is(j, 'state', 'deck', 'canted')).toBe(true);
    expect(j.at('party')).toMatch(/bridge_near$/);
    await j.play('Wait › An hour');
    expect(House.is(j, 'state', 'deck', 'level')).toBe(true);
  }, 300000);

  it('is crossed light by a mage, or heavy once the capstan is wound or the mail set down', async () => {
    const mage = await House.at('bridge_near', 'kahitude', 'mage');
    await mage.play('To the middle of the Bridge of Weights');
    expect(mage.at('party')).toMatch(/bridge_mid$/);
    await mage.play('To the far landing of the Bridge');
    expect(mage.at('party')).toMatch(/bridge_far$/);
    const warrior = await House.at('gantry', 'kahitude', 'warrior');
    expect(House.n(warrior, 'limit', 'deck')).toBe(10);
    await warrior.play('Wind the near capstan to the last notch');
    expect(House.n(warrior, 'limit', 'deck')).toBe(15);
    Placed.at(warrior, 'arcology__bridge_near');
    await warrior.play('To the middle of the Bridge of Weights');
    expect(warrior.at('party')).toMatch(/bridge_mid$/);
    const shed = await House.at('bridge_near', 'kahitude', 'warrior');
    await shed.play('scale mail: Set down here');
    await shed.play('To the middle of the Bridge of Weights');
    expect(shed.at('party')).toMatch(/bridge_mid$/);
  }, 420000);
});
