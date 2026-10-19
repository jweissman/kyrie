import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import type { CampaignEvent } from '../src/campaign/campaign';

class Situation {
  static readonly river = 'data/caught-below/river.campaign.json';
  static readonly quarry = 'data/caught-below/quarry.campaign.json';
  static async start(manifest = Situation.river, ...commands: string[]) {
    const s = await PlaySession.start(manifest, 'serewater', NodeBundleSource.shared);
    for (const c of commands) { await s.perform(c); }
    return s;
  }
  static fact(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static where(s: PlaySession, id: string) {
    return s.campaign.world.snapshot.relations.find(r => r.name === 'at' && r.args[0] === id)?.args[1];
  }
  static state(s: PlaySession, id: string) {
    return s.campaign.world.snapshot.relations.find(r => r.name === 'state' && r.args[0] === id)?.args[1];
  }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static seen(event: CampaignEvent) { return (event.perceptions ?? []).filter(p => p.kind === 'event').map(p => p.text); }
  // The river route to Pell with the bar in hand, via the low culvert and a soothed hound.
  static readonly toPell = ['go(world__causeway_path,world__causeway)', 'go(world__low_path,world__drain_mouth)',
    'go(world__culvert,world__workshop)', 'change_thing(world__padlock_pick)', 'go(world__stores_door,world__stores)',
    'take_item(rescue__bar,world__member_party_2)',
    'go(world__stores_door,world__workshop)', 'go(world__gallery_steps,world__gallery)', 'change_thing(world__hound_soothe)',
    'go(world__hoist_passage,world__hoist)'];
  static async waitUntil(s: PlaySession, test: () => boolean, limit = 30) {
    for (let i = 0; i < limit && !test(); i++) { await s.perform('wait'); }
  }
}

describe('passages are physical and two-sided', () => {
  it('a closing way shuts from both ends, and its obstacle explains itself from either side', async () => {
    const s = await Situation.start(Situation.river, 'go(world__causeway_path,world__causeway)', 'go(world__low_path,world__drain_mouth)');
    expect(Situation.legal(s)).toContain('go(world__culvert,world__workshop)');
    await Situation.waitUntil(s, () => Situation.state(s, 'rescue__water') === 'rescue__closed');
    expect(Situation.legal(s)).not.toContain('go(world__culvert,world__workshop)');
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text)).toContain('The rising river has closed the drain culvert.');
    const inside = await Situation.start(Situation.river, 'go(world__causeway_path,world__causeway)',
      'go(world__low_path,world__drain_mouth)', 'go(world__culvert,world__workshop)');
    await Situation.waitUntil(inside, () => Situation.state(inside, 'rescue__water') === 'rescue__closed');
    expect(Situation.legal(inside)).not.toContain('go(world__culvert,world__drain_mouth)');
    expect(PlayerView.observe(inside.campaign).observations.map(o => o.text)).toContain('The rising river has closed the drain culvert.');
  }, 60000);
  it('a guardian holds its passage from both sides, until its condition changes', async () => {
    const s = await Situation.start(Situation.river, 'go(world__causeway_path,world__causeway)', 'go(world__low_path,world__drain_mouth)',
      'go(world__culvert,world__workshop)', 'go(world__workshop_door,world__vestibule)', 'examine(world__survey_board)',
      'go(world__workshop_door,world__workshop)', 'change_thing(world__padlock_pick)', 'go(world__stores_door,world__stores)',
      'go(world__tram_crawl,world__hoist)');
    expect(Situation.legal(s)).not.toContain('go(world__hoist_passage,world__gallery)');
    await s.perform('go(world__tram_crawl,world__stores)'); await s.perform('go(world__stores_door,world__workshop)');
    await s.perform('go(world__gallery_steps,world__gallery)');
    expect(Situation.legal(s)).not.toContain('go(world__hoist_passage,world__hoist)');
    await s.perform('change_thing_paying(world__hound_feed)');
    expect(Situation.state(s, 'world__hound')).toBe('world__calm');
    expect(Situation.legal(s)).toContain('go(world__hoist_passage,world__hoist)');
    await s.perform('go(world__hoist_passage,world__hoist)');
    expect(Situation.legal(s)).toContain('go(world__hoist_passage,world__gallery)');
  }, 60000);
  it('a hidden way exists for nobody who has not learned of it', async () => {
    const s = await Situation.start(Situation.river, 'go(world__causeway_path,world__causeway)', 'go(world__low_path,world__drain_mouth)',
      'go(world__culvert,world__workshop)', 'change_thing(world__padlock_pick)', 'go(world__stores_door,world__stores)');
    expect(Situation.legal(s).some(c => c.includes('tram_crawl'))).toBe(false);
  }, 60000);
  it('a hazard threatens whoever crosses in either direction, and its aftermath can close the way', async () => {
    const q = await Situation.start(Situation.quarry, 'go(world__beck_path,world__lane_foot)', 'go(world__beck_lane,world__quarry_floor)',
      'go(world__adit_mouth,world__adit)', 'go(world__gallery_way,world__upper_gallery)');
    expect(Situation.legal(q)).not.toContain('go(world__ladder_shaft,world__lower_gallery)');
    await q.perform('risk(world__ladder,world__member_party_2)');
    expect(Situation.where(q, 'party')).toBe('world__lower_gallery');
    expect(Situation.state(q, 'world__ladder')).toBe('world__broken');
    expect(Situation.legal(q).some(c => c.includes('ladder'))).toBe(false);
    expect(Situation.legal(q)).toContain('go(world__tub_incline,world__incline_top)');
  }, 60000);
});

describe('the rescued person has intentions, not a flag', () => {
  it('levering frees them unhurt; they wait while you are there, then make their own way home', async () => {
    const s = await Situation.start(Situation.river, ...Situation.toPell);
    expect(Situation.legal(s)).not.toContain('lead(rescue__guest)');
    await s.perform('rescue__lever_free(party,world__hoist)');
    expect([Situation.state(s, 'rescue__rack'), Situation.state(s, 'rescue__guest')]).toEqual(['rescue__propped', 'rescue__hurt']);
    expect(Situation.fact(s, 'hobbled', 'rescue__guest')).toBe(false);
    await s.perform('wait');
    expect(Situation.where(s, 'rescue__guest')).toBe('world__hoist');
    await s.perform('part_ways(rescue__guest)');
    await Situation.waitUntil(s, () => Situation.fact(s, 'rescue__returned', 'rescue__guest'));
    expect(Situation.where(s, 'rescue__guest')).toBe('world__ferry_room');
    expect(Situation.fact(s, 'rescue__escortedHome', 'rescue__guest', 'party')).toBe(false);
    expect(Situation.where(s, 'party')).toBe('world__hoist');
  }, 90000);
  it('a person who has been led follows step for step, is met by the one waiting for them, and cannot be led away again', async () => {
    const s = await Situation.start(Situation.river, ...Situation.toPell, 'rescue__lever_free(party,world__hoist)', 'lead(rescue__guest)');
    for (const c of ['go(world__hoist_passage,world__gallery)', 'go(world__gallery_steps,world__workshop)',
      'go(world__workshop_door,world__vestibule)', 'go(world__arch,world__yard)']) {
      await s.perform(c);
      expect(Situation.where(s, 'rescue__guest')).toBe(Situation.where(s, 'party'));
    }
    for (const c of ['go(world__yard_track,world__ridge)', 'go(world__ridge_track,world__causeway)']) { await s.perform(c); }
    const quay = await s.perform('go(world__causeway_path,world__quay)');
    expect(Situation.seen(quay).join(' ')).toContain('Wren sees Pell, and runs.');
    expect(Situation.fact(s, 'following', 'rescue__guest', 'party')).toBe(false);
    expect(Situation.fact(s, 'rescue__escortedHome', 'rescue__guest', 'party')).toBe(true);
    expect(Situation.legal(s)).not.toContain('lead(rescue__guest)');
    await Situation.waitUntil(s, () => Situation.fact(s, 'rescue__returned', 'rescue__guest'));
    expect([Situation.where(s, 'rescue__guest'), Situation.where(s, 'rescue__relative')]).toEqual(['world__ferry_room', 'world__ferry_room']);
  }, 90000);
  it('heaving breaks the leg: the person cannot walk alone, can follow with support, and can be splinted', async () => {
    const s = await Situation.start(Situation.river, ...Situation.toPell, 'rescue__heave_free(world__member_party_2)');
    expect([Situation.state(s, 'rescue__rack'), Situation.state(s, 'rescue__guest')]).toEqual(['rescue__toppled', 'rescue__lame']);
    const bran = s.campaign.state.creatures.find(c => c.name === 'Bran')!;
    expect(bran.state.hp).toBeLessThan(bran.base.maxHp);
    await s.perform('go(world__hoist_passage,world__gallery)'); await s.perform('wait'); await s.perform('wait');
    expect(Situation.where(s, 'rescue__guest')).toBe('world__hoist');
    await s.perform('go(world__hoist_passage,world__hoist)'); await s.perform('lead(rescue__guest)');
    await s.perform('go(world__hoist_passage,world__gallery)');
    expect(Situation.where(s, 'rescue__guest')).toBe('world__gallery');
    await s.perform('rescue__set_leg(party,world__gallery)');
    expect(Situation.state(s, 'rescue__guest')).toBe('rescue__hurt');
  }, 90000);
  it('when every way home is shut to them, they say so instead of pretending to travel', async () => {
    const s = await Situation.start(Situation.river, 'go(world__causeway_path,world__causeway)', 'go(world__low_path,world__drain_mouth)',
      'go(world__culvert,world__workshop)', 'go(world__workshop_door,world__vestibule)', 'examine(world__survey_board)',
      'go(world__workshop_door,world__workshop)', 'change_thing(world__padlock_pick)', 'go(world__stores_door,world__stores)',
      'take_item(rescue__bar,world__member_party_2)', 'go(world__tram_crawl,world__hoist)', 'rescue__lever_free(party,world__hoist)',
      'part_ways(rescue__guest)', 'wait');
    expect(Situation.where(s, 'rescue__guest')).toBe('world__hoist');
    expect(PlayerView.observe(s.campaign).present.find(p => p.id === 'rescue__guest')?.activity)
      .toBe('making for the ferry house, but no way is open to them');
    await s.perform('lead(rescue__guest)'); await s.perform('go(world__tram_crawl,world__stores)');
    expect(Situation.where(s, 'rescue__guest')).toBe('world__stores');
  }, 90000);
});

describe('actions apply to what is actually there', () => {
  it('offers no violence against the people you came to help, and no gifts to animals', async () => {
    const s = await Situation.start(Situation.river);
    expect(Situation.legal(s).some(c => c.startsWith('attack'))).toBe(false);
    const gallery = await Situation.start(Situation.river, 'go(world__causeway_path,world__causeway)', 'go(world__low_path,world__drain_mouth)',
      'go(world__culvert,world__workshop)', 'go(world__gallery_steps,world__gallery)');
    const legal = Situation.legal(gallery);
    expect(legal).toContain('attack(world__hound)');
    expect(legal.some(c => /^(pay|give_food)\(/.test(c))).toBe(false);
  }, 60000);
  it('the gentle approach needs the tool in hand; the harmful one is never needed', async () => {
    const s = await Situation.start(Situation.river, 'go(world__causeway_path,world__causeway)', 'go(world__low_path,world__drain_mouth)',
      'go(world__culvert,world__workshop)', 'go(world__gallery_steps,world__gallery)', 'change_thing(world__hound_soothe)',
      'go(world__hoist_passage,world__hoist)');
    expect(Situation.legal(s)).not.toContain('rescue__lever_free(party,world__hoist)');
    expect(Situation.legal(s)).toContain('rescue__dig_free(party,world__hoist)');
    const started = s.campaign.state.elapsed;
    const event = await s.perform('rescue__dig_free(party,world__hoist)');
    expect(event.elapsed).toBe(started + 4);
    expect(Situation.state(s, 'rescue__rack')).toBe('rescue__dug');
    expect(Situation.legal(s).some(c => c.includes('heave_free'))).toBe(false);
  }, 60000);
});

describe('consequences are perceived where they happen', () => {
  it('the closing is told only to those beside it; the cry only to those who reach the trapped person', async () => {
    const away = await Situation.start(Situation.river, 'go(world__ferry_door,world__ferry_room)');
    expect(Situation.where(away, 'rescue__relative')).toBe('world__quay');
    const events: string[] = [];
    for (let i = 0; i < 40; i++) { events.push(...Situation.seen(await away.perform('wait'))); }
    expect(Situation.state(away, 'rescue__water')).toBe('rescue__closed');
    expect(events.join(' ')).not.toContain('closes over');
    const s = await Situation.start(Situation.river, ...Situation.toPell.slice(0, -1));
    expect(Situation.seen(await s.perform('go(world__hoist_passage,world__hoist)')).join(' ')).toContain('Mind the fallen timber rack');
  }, 90000);
});

describe('one situation, two places', () => {
  it('installs with different people, things, geography and timing but the same causes', async () => {
    const river = await Situation.start(Situation.river), quarry = await Situation.start(Situation.quarry);
    const names = (s: PlaySession) => ['rescue__guest', 'rescue__relative', 'rescue__rack', 'rescue__bar', 'rescue__water']
      .map(id => s.campaign.module.entities.find(e => e.id === id)!.name);
    expect(names(river)).toEqual(['Pell, surveyor', 'Wren, ferry-keeper', 'the fallen timber rack', 'a pry bar', 'the rising river']);
    expect(names(quarry)).toEqual(['Tamsin, quarry tally-keeper', "Marrit, Tamsin's grandmother", 'the derailed ore tub', 'a crowbar', 'the drifting snow']);
    const schemas = (s: PlaySession) => s.campaign.schemas.filter(a => a.id.startsWith('rescue__')).map(a => a.id).sort();
    expect(schemas(river)).toEqual(schemas(quarry));
    const goals = (s: PlaySession) => s.campaign.actors.find(a => a.id === 'rescue__guest')!.goals.map(g => g.id);
    expect(goals(river)).toEqual(goals(quarry));
    expect(Situation.where(river, 'rescue__guest')).toBe('world__hoist');
    expect(Situation.where(quarry, 'rescue__guest')).toBe('world__lower_gallery');
    const closes = (s: PlaySession) => s.campaign.world.number(ModuleWriter.call('rescue__closesAt', 'rescue__water'));
    expect(closes(river)).toBeGreaterThan(30); expect(closes(quarry)).toBeLessThanOrEqual(28);
  }, 60000);
  it('in the quarry the freed person also walks home alone, by a route that exists only there', async () => {
    const q = await Situation.start(Situation.quarry, 'go(world__beck_path,world__lane_foot)', 'go(world__beck_lane,world__quarry_floor)',
      'go(world__smithy_door,world__smithy)', 'take_item(rescue__bar,world__member_party_2)', 'go(world__smithy_door,world__quarry_floor)',
      'go(world__adit_mouth,world__adit)', 'go(world__incline_way,world__incline_top)', 'go(world__tub_incline,world__lower_gallery)',
      'rescue__lever_free(party,world__lower_gallery)', 'part_ways(rescue__guest)');
    await Situation.waitUntil(q, () => Situation.fact(q, 'rescue__returned', 'rescue__guest'), 40);
    expect(Situation.where(q, 'rescue__guest')).toBe('world__cottage_room');
    expect(Situation.fact(q, 'rescue__reunited', 'rescue__guest')).toBe(true);
    const path = q.campaign.events.flatMap(e => e.npc ?? []).filter(d => d.actor === 'rescue__guest').map(d => d.action.split(',')[1]);
    expect(path.some(w => w === 'world__tub_incline')).toBe(true);
  }, 90000);
});

describe('persistence', () => {
  it('replays a recorded history to the identical canonical state and resumes from a save', async () => {
    const s = await Situation.start(Situation.quarry, 'go(world__beck_path,world__lane_foot)', 'go(world__beck_lane,world__quarry_floor)',
      'go(world__smithy_door,world__smithy)', 'take_item(world__coil,world__member_party_1)', 'go(world__smithy_door,world__quarry_floor)',
      'go(world__adit_mouth,world__adit)', 'go(world__gallery_way,world__upper_gallery)', 'change_thing(world__ladder_brace)',
      'go(world__ladder_shaft,world__lower_gallery)', 'rescue__heave_free(world__member_party_1)', 'lead(rescue__guest)');
    const replay = await PlaySession.start(Situation.quarry, 'serewater', NodeBundleSource.shared);
    await replay.replay(s.transcript.steps);
    expect(replay.canonical()).toBe(s.canonical());
    expect(PlaySession.resume(s.checkpoint()).canonical()).toBe(s.canonical());
  }, 90000);
});
