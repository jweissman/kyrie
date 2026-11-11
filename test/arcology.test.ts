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

describe('the Hanging Garden', () => {
  it('puts a company to sleep by day, is learned from the Gardener, who gives wet cloth, and is safe at night', async () => {
    const j = await House.at('terrace', 'kahitude', 'warrior');
    expect(j.offers('Tie wet cloth')).toBe(false);
    await j.play('Ask the Gardener about the bell-lilies', 'Ask the Gardener for something to tie over your faces');
    expect(j.offers('Tie wet cloth over your mouths and go through')).toBe(true);
    await j.play('Tie wet cloth over your mouths and go through', 'To the Hanging Garden');
    expect(j.at('party')).toMatch(/garden$/);
    const sleeper = await House.at('terrace', 'kahitude', 'warrior');
    await sleeper.play('To the Hanging Garden');
    expect(sleeper.offers('Lie as you are')).toBe(true);
    const night = await House.at('terrace', 'kahitude', 'warrior');
    await night.play('=21:00');
    expect(House.is(night, 'state', 'blossoms', 'folded')).toBe(true);
    await night.play('To the Hanging Garden');
    expect(night.at('party')).toMatch(/garden$/);
  }, 420000);
});

describe('the Question Hall and its hum', () => {
  it('answers by device, raises the hum with each answer, posts the keepers across the arches at four and turns them at six', async () => {
    const j = await House.at('hall', 'kahitude', 'mage');
    expect(House.hum(j)).toBe(0);
    for (const q of ['steps', 'a disc and a hand', 'a notched ring', 'a row of dots']) {
      await j.play(`Ask the tablet marked with ${q}`);
    }
    expect(House.hum(j)).toBe(4);
    expect(House.is(j, 'state', 'keepers', 'posted')).toBe(true);
    expect(j.takes('To the Drawer Gallery')).toBe(false);
    expect(House.is(j, 'peaceable', 'keepers')).toBe(true);
    await j.play('Wait › An hour');
    await j.play('Wait › An hour');
    await j.play('Wait › An hour');
    expect(House.hum(j)).toBeLessThanOrEqual(2);
    expect(House.is(j, 'state', 'keepers', 'niched')).toBe(true);
    expect(j.takes('To the Drawer Gallery')).toBe(true);
  }, 420000);

  it('breaks its peace if the closed eye is asked: the keepers turn and, past eight, the Marshal wakes and comes', async () => {
    const j = await House.at('hall', 'kahitude', 'mage');
    expect(j.offers('Ask the tablet marked with a closed eye')).toBe(true);
    for (const q of ['steps', 'a disc and a hand', 'a notched ring', 'a row of dots']) {
      await j.play(`Ask the tablet marked with ${q}`);
    }
    await j.play('Ask the tablet marked with a closed eye');
    expect(House.hum(j)).toBeGreaterThanOrEqual(8);
    expect(House.is(j, 'peaceable', 'keepers')).toBe(false);
    expect(House.is(j, 'state', 'marshal', 'roused')).toBe(true);
    expect(House.is(j, 'assails', 'marshal', 'party')).toBe(true);
  }, 420000);

  it('is quiet to those it has counted: no keeper is turned on a counted company however loud', async () => {
    const j = await House.at('hall', 'kahitude', 'mage');
    await House.set(j, 'counted', 'party');
    await House.set(j, 'tolerates', 'keepers', 'party');
    await House.set(j, 'tolerates', 'marshal', 'party');
    for (const q of ['steps', 'a disc and a hand', 'a notched ring', 'a row of dots', 'a door behind a door', 'a closed eye']) {
      await j.play(`Ask the tablet marked with ${q}`);
    }
    expect(House.is(j, 'assails', 'keepers', 'party')).toBe(false);
    expect(House.is(j, 'assails', 'marshal', 'party')).toBe(false);
  }, 420000);
});

describe('the ring in the drawers, the governor, and the lift', () => {
  it('jams on a wrong notch for an hour and the hum, opens on the tablet’s number, and the governor mends the lift for good', async () => {
    const j = await House.at('drawers', 'kahitude', 'mage');
    const target = House.n(j, 'target', 'ring');
    expect(target).toBeGreaterThanOrEqual(2);
    expect(target).toBeLessThanOrEqual(6);
    // One notch short, or one past it on the wheel, is wrong.
    const wrongTurns = target === 2 ? 1 : 0;
    for (let i = 0; i < wrongTurns; i++) { await j.play('Turn the ring one notch'); }
    if (wrongTurns) { await j.play('Press the ring home'); expect(House.is(j, 'state', 'drawer', 'jammed')).toBe(true); expect(House.hum(j)).toBe(1); }
    else { await j.play('Press the ring home'); expect(House.is(j, 'state', 'drawer', 'jammed')).toBe(true); }
    await j.play('Wait › An hour');
    expect(House.is(j, 'state', 'drawer', 'locked')).toBe(true);
    const have = House.n(j, 'notch', 'ring');
    for (let i = have; i !== target; i = i % 6 + 1) { await j.play('Turn the ring one notch'); }
    await j.play('Press the ring home');
    expect(House.is(j, 'state', 'drawer', 'open')).toBe(true);
    await j.play('Take from the drawer of the ring');
    Placed.at(j, 'arcology__cage');
    expect(House.is(j, 'state', 'cage_gear', 'stalled')).toBe(true);
    await j.play('Fit the governor and free the cage');
    expect(House.is(j, 'state', 'cage_gear', 'running')).toBe(true);
    Placed.at(j, 'arcology__terrace');
    expect(j.takes('To the foot of the Great Void')).toBe(true);
  }, 600000);
});

describe('the Reckoning Room and the disc', () => {
  it('answers to the sun at noon, never to the uncounted, and rises for the counted', async () => {
    const j = await House.at('reckoning', 'kahitude', 'mage');
    expect(j.offers('Turn the ring until its mark meets the shaft of light')).toBe(false);
    await j.play('=11:00');
    await j.play('Turn the ring until its mark meets the shaft of light');
    expect(House.is(j, 'state', 'disc', 'risen')).toBe(true);
    expect(j.offers('^To the Quiet Floor$')).toBe(false);
    await House.set(j, 'counted', 'party');
    expect(j.offers('^To the Quiet Floor$')).toBe(true);
  }, 420000);
});

describe('the Quiet Floor', () => {
  it('feeds the counted, makes them tenants, notices when the company has changed, and counts a pocketed spoon as owed', async () => {
    const j = await House.at('table_room', 'kahitude', 'warrior');
    expect(j.offers('Sit down and eat what is laid')).toBe(false);
    await House.set(j, 'counted', 'party');
    await j.play('Sit down and eat what is laid');
    expect(House.is(j, 'tenant', 'party')).toBe(true);
    expect(House.n(j, 'seatedFor', 'party')).toBe(1);
    await j.play('laid silver spoons: Take');
    expect(House.is(j, 'owed', 'party')).toBe(true);
    Placed.at(j, 'arcology__quiet');
    await j.play('Settle the account for the spoon');
    expect(House.is(j, 'owed', 'party')).toBe(false);
  }, 420000);
});

describe('the water', () => {
  it('sends the town its spring when the roofed-house wheel is turned, and costs the Gardener hers', async () => {
    const { p } = await House.world('kahitude');
    const town = p!.bindings.town!;
    const j = await House.at('valves', 'kahitude', 'warrior');
    expect(House.is(j, 'state', 'spring', 'failing')).toBe(true);
    expect(House.is(j, 'state', 'blossoms', 'open')).toBe(true);
    await j.play('Open the wheel with the roofed house');
    expect(House.is(j, 'state', 'spring', 'running')).toBe(true);
    expect(House.is(j, 'state', 'blossoms', 'wilting')).toBe(true);
    Placed.at(j, `region__${town}_shrine`);
    expect(j.offers('Tell')).toBe(true);
    await j.play('the spring will run again');
    expect(House.is(j, 'paid_spring', 'party')).toBe(true);
    Placed.at(j, 'arcology__valves');
    await j.play('Shut the wheel with the roofed house');
    expect(House.is(j, 'state', 'spring', 'failing')).toBe(true);
  }, 420000);

  it('drains the Drowned Level through the tipped bucket: the garden door clears, the eels are stranded, and the brook floods', async () => {
    const j = await House.at('valves', 'a1', 'warrior');
    await j.play('Open the wheel with the tipped bucket', 'Wait › A while');
    expect(House.is(j, 'state', 'waterlevel', 'low')).toBe(true);
    expect(House.is(j, 'state', 'roots_lock', 'clear')).toBe(true);
    expect(House.is(j, 'state', 'eels', 'stranded')).toBe(true);
    expect(House.is(j, 'state', 'culvert_water', 'flowing')).toBe(true);
  }, 420000);
});

describe('the man in the lift cage, and the shrine’s lamp-chain', () => {
  it('is freed by the mended lift, tells where the chain is, goes home when the company comes out, and the priest pays for the chain', async () => {
    const { p } = await House.world('kahitude');
    const town = p!.bindings.town!, site = p!.bindings.works!;
    const j = await House.at('cage', 'kahitude', 'warrior');
    await j.play('Ask Oswy how he came');
    await j.play('Ask Oswy about the brass in his pack');
    expect(House.is(j, 'knows', 'party', 'chain_seen')).toBe(true);
    await j.play('chain: Take', 'the shrine’s lamp-chain: Take').catch(() => undefined);
    await House.set(j, 'state', 'cage_gear', 'running');
    await j.play('Ride the mended lift up with');
    expect(House.is(j, 'following', 'salvager', 'party')).toBe(true);
    Placed.at(j, `region__${site}`);
    await j.play('=+1');
    expect(House.is(j, 'state', 'salvager', 'safe_home')).toBe(true);
    Placed.at(j, `region__${town}_shrine`);
    expect(j.offers('Give')).toBe(true);
  }, 420000);
});

describe('the Service Way', () => {
  it('opens a way from the House to the town’s shrine, for good, and the priest learns of it', async () => {
    const { p } = await House.world('kahitude');
    const town = p!.bindings.town!;
    const j = await House.at('cliff', 'kahitude', 'warrior');
    expect(j.takes('To the')).toBe(true);
    await j.play('Search here');
    await j.play('Draw the bar and heave the slab on its edge');
    expect(House.is(j, 'state', 'slab', 'open')).toBe(true);
    await j.play('Lift the beam from the bronze door');
    Placed.at(j, `region__${town}_shrine`);
    expect(House.is(j, 'state', 'slab', 'open')).toBe(true);
    await j.play('Tell');
    expect(House.is(j, 'paid_slab', 'party')).toBe(true);
  }, 420000);
});

describe('the Marshal, and the figure on the green', () => {
  it('has its key drawn by one who can be quiet, which wins every keeper’s peace and winds down the counter at the green', async () => {
    const { p } = await House.world('kahitude');
    const town = p!.bindings.town!;
    const j = await House.at('bay', 'kahitude', 'thief');
    j.roll('pass');
    await j.play('Draw the winding-key out of the Marshal’s back');
    expect(House.is(j, 'state', 'marshal', 'wound_down')).toBe(true);
    // The Roll, written in chalk, reopens the count: a brass figure walks to the green by night until it is wound down.
    await House.set(j, 'rolled', 'house');
    Placed.at(j, `region__${town}_green`);
    await j.play('=until dark()').catch(() => j.play('Wait › Until dark'));
    await j.play('=+1');
    expect(House.is(j, 'state', 'counter', 'counting')).toBe(true);
    expect(j.at('counter')).toMatch(/green$/);
    await j.play('Wind the counting figure down with the Marshal’s key');
    expect(House.is(j, 'state', 'counter', 'stilled')).toBe(true);
  }, 600000);

  it('makes the keepers tolerate whoever holds the key', async () => {
    const j = await House.at('bay', 'kahitude', 'thief');
    j.roll('pass');
    await j.play('Draw the winding-key out of the Marshal’s back', 'Wait › A while');
    expect(House.is(j, 'tolerates', 'keepers', 'party')).toBe(true);
    expect(House.is(j, 'tolerates', 'usher', 'party')).toBe(true);
  }, 300000);
});

describe('the ways round the Count', () => {
  it('lets one who can climb go up the Ledge, past the Lodge and the Usher, to the Terrace by the narrow stair', async () => {
    const j = await House.at('landing', 'kahitude', 'monk');
    await j.play('To the Goat Ledge');
    expect(j.at('party')).toMatch(/ledge$/);
    expect(House.is(j, 'counted', 'party')).toBe(false);
    await j.play('To the Terrace of Tiers');
    expect(j.at('party')).toMatch(/terrace$/);
    expect(House.is(j, 'counted', 'party')).toBe(false);
  }, 240000);

  it('shows the hull from the Ledge to anyone', async () => {
    const j = await House.at('ledge', 'kahitude', 'ranger');
    expect(j.seen()).toMatch(/curved wall of dark metal/);
    await j.play('Wait › A while');
    expect(House.is(j, 'knows', 'party', 'hull_seen')).toBe(true);
  }, 240000);

  it('enters by the brook for those who found the arch: the sluice-race, in the dark', async () => {
    const { p } = await House.world('kahitude');
    const j = await House.start('kahitude', 'warrior');
    Placed.at(j, `region__${p!.bindings.works}`);
    await j.play('Search here', 'Into the sluice-race');
    expect(j.at('party')).toMatch(/race$/);
  }, 300000);

  it('counts the company on the Roll, in chalk found at the Landing, and reopens the count: the cheap way, with a cost outside', async () => {
    const j = await House.at('landing', 'kahitude', 'mage');
    await j.play('Search here', 'a stub of the survey’s chalk: Take');
    Placed.at(j, 'arcology__drawers');
    await j.play('Write the company’s names in the Roll, in chalk');
    expect(House.is(j, 'counted', 'party')).toBe(true);
    expect(House.is(j, 'rolled', 'house')).toBe(true);
    expect(House.hum(j)).toBeGreaterThanOrEqual(1);
  }, 300000);

  it('shows the ring in the sky from the roof, and leaves the drowned city a view', async () => {
    const j = await House.at('ring_walk', 'kahitude', 'mage');
    expect(j.seen()).toMatch(/great ring stands on edge/);
    await j.play('Wait › A while');
    expect(House.is(j, 'knows', 'party', 'ring_seen')).toBe(true);
  }, 240000);
});

describe('light, air, bait and the Gardener’s gift', () => {
  it('vents the seed-vault before the door is safe: dead air stands behind it until the wheel is turned', async () => {
    const j = await House.at('roots', 'kahitude', 'warrior');
    expect(House.is(j, 'state', 'vault_air', 'foul')).toBe(true);
    await j.play('Turn the vent-wheel');
    await j.play('Wait › A while');
    expect(House.is(j, 'state', 'vault_air', 'clean')).toBe(true);
  }, 240000);

  it('sets the bronze ring by the surveyors’ plate and a lit candle at night, when the sun will not do', async () => {
    const j = await House.at('landing', 'kahitude', 'mage');
    await j.play('Search here', 'the surveyors’ signal-plate: Take');
    Placed.at(j, 'arcology__reckoning');
    await j.play('=22:00');
    expect(House.is(j, 'state', 'bronze_ring', 'unset')).toBe(true);
    await j.play('a candle: Light');
    expect(j.offers('Throw lamplight onto the ring’s mark')).toBe(true);
    await j.play('Throw lamplight onto the ring’s mark with the surveyors’ plate');
    expect(House.is(j, 'state', 'disc', 'risen')).toBe(true);
  }, 300000);

  it('gives rations to the owlbear for peace at the foot of the Void, and the pod to one who has been below', async () => {
    const j = await House.at('foot', 'kahitude', 'warrior');
    expect(j.offers('Leave rations at the edge of the pool for the owlbear')).toBe(true);
    await j.play('Leave rations at the edge of the pool for the owlbear');
    expect(House.is(j, 'tolerates', 'owlbear', 'party')).toBe(true);
    const g = await House.at('terrace', 'kahitude', 'warrior');
    expect(g.offers('Ask the Gardener for a seed-pod')).toBe(false);
    g.assert('been', 'party', 'arcology__roots');
    await g.play('Wait › A while');
    expect(g.offers('Ask the Gardener for a seed-pod of the bells')).toBe(true);
  }, 300000);
});
