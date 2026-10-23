import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ModuleWriter } from '../src/lang/module-writer';

// Containers, things hidden until found, traps that spring on what they guard, and trying things: the cartographer's
// strongroom (test/fixtures/strongroom) played by commands.
class Strongroom {
  static start() {
    return PlaySession.start('test/fixtures/strongroom/campaign.json', 'strongroom', NodeBundleSource.shared);
  }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static fact(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static state(s: PlaySession, id: string) {
    return s.campaign.world.snapshot.relations.find(r => r.name === 'state' && r.args[0] === id)?.args[1];
  }
  static hurt(s: PlaySession) { return s.campaign.state.party.filter(f => f.hp < f.maxHp).map(f => f.name); }
  static present(s: PlaySession) { return PlayerView.observe(s.campaign).present.map(p => p.id); }
  static async walk(s: PlaySession, commands: string[]) { for (const c of commands) { await s.perform(c); } }
  // Says what the player would read after a command.
  static async said(s: PlaySession, command: string) {
    const before = PlayerView.observe(s.campaign), event = await s.perform(command);
    const f = ActionFeedbackView.read(s.campaign, event, before);
    return [f.result, ...f.observations, ...f.events, ...f.immediate].join(' ');
  }
}

describe('containers and what is inside them', () => {
  it('shows what an open chest holds, and lets it be taken out; a shut chest shows nothing', async () => {
    const s = await Strongroom.start();
    await s.perform('go(world__study_door,world__study)');
    expect(Strongroom.present(s)).not.toContain('world__chart');
    // Nell eases the needle out once she has seen the tell, then picks the lock and lifts the lid.
    await s.perform('look_closely(world__chest)');
    expect(Strongroom.fact(s, 'knows', 'party', 'world__needle_known')).toBe(true);
    await Strongroom.walk(s, ['change_thing(world__lock_disarm)', 'change_thing(world__chest_pick)',
      'change_thing(world__chest_lift)']);
    expect(Strongroom.hurt(s)).toEqual([]);
    expect(Strongroom.present(s)).toEqual(expect.arrayContaining(['world__chart', 'world__vial']));
    const take = Strongroom.legal(s).find(c => c.startsWith('take_out(world__chart'))!;
    await s.perform(take);
    expect(Strongroom.fact(s, 'inside', 'world__chart', 'world__chest')).toBe(false);
    expect(s.campaign.state.creatures.some(c => c.state.inventory?.some(i => i.id === 'world__chart'))).toBe(true);
  }, 60000);
  it('springs the needle on whoever opens the lock without dealing with it', async () => {
    const s = await Strongroom.start();
    await s.perform('go(world__study_door,world__study)');
    const picked = await s.perform('change_thing(world__chest_pick)');
    expect(Strongroom.state(s, 'world__lock')).toBe('world__sprung');
    // It goes for one of them; whether it gets into a hand is the hand's quickness, rolled.
    const pricked = picked.combat.filter(c => c.type === 'action' && c.source?.kind === 'trap');
    expect(pricked).toHaveLength(1);
    expect(Strongroom.hurt(s).length).toBeLessThanOrEqual(1);
  }, 60000);
  it('lets the pole trip the needle from a pace away, and brute force break what the chest holds', async () => {
    const s = await Strongroom.start();
    await Strongroom.walk(s, [Strongroom.legal(s).find(c => c.startsWith('take_item(world__long_pole'))!,
      'go(world__study_door,world__study)', 'change_thing(world__lock_trip)']);
    expect([Strongroom.state(s, 'world__lock'), Strongroom.hurt(s)]).toEqual(['world__sprung', []]);
    const t = await Strongroom.start();
    await Strongroom.walk(t, ['go(world__study_door,world__study)', 'change_thing(world__chest_smash)']);
    expect([Strongroom.hurt(t), Strongroom.fact(t, 'inside', 'world__vial', 'world__chest'),
      Strongroom.fact(t, 'inside', 'world__chart', 'world__chest')]).toEqual([[], false, true]);
  }, 60000);
});

describe('things hidden until found', () => {
  it('keeps the alcove and what is in it out of reach until the study is searched', async () => {
    const s = await Strongroom.start();
    await s.perform('go(world__study_door,world__study)');
    expect(Strongroom.legal(s).some(c => c.includes('alcove'))).toBe(false);
    const said = await Strongroom.said(s, 'search(world__study)');
    expect(said).toContain('Behind the hanging map');
    expect(Strongroom.fact(s, 'knows', 'party', 'world__alcove_known')).toBe(true);
    await s.perform('go(world__alcove_way,world__alcove)');
    expect(Strongroom.present(s)).toContain('world__rings');
  }, 60000);
  it('says so when a search or a try finds nothing', async () => {
    const s = await Strongroom.start();
    expect(await Strongroom.said(s, 'search(world__hall)')).toContain('You find nothing out of the ordinary.');
    await s.perform('go(world__study_door,world__study)');
    expect(await Strongroom.said(s, 'push(world__wall_map)')).toContain('Nothing comes of it.');
  }, 60000);
});

describe('trying things', () => {
  it('shows the pit under the flagstone to a pole, after which the way can be walked round it', async () => {
    const s = await Strongroom.start();
    expect(Strongroom.legal(s)).not.toContain('go(world__vault_way,world__vault)');
    await s.perform(Strongroom.legal(s).find(c => c.startsWith('take_item(world__long_pole'))!);
    expect(await Strongroom.said(s, 'prod(world__flagstone)')).toContain('a pit bristles with stakes');
    expect(Strongroom.legal(s)).toContain('go(world__vault_way,world__vault)');
    expect(Strongroom.hurt(s)).toEqual([]);
  }, 60000);
});

describe('a pressure plate', () => {
  const into = ['take_item(world__long_pole', 'prod(world__flagstone)', 'take_item(world__brand', 'take_item(world__sand',
    'go(world__vault_way,world__vault)'];
  async function vault() {
    const s = await Strongroom.start();
    for (const prefix of into) { await s.perform(Strongroom.legal(s).find(c => c.startsWith(prefix))!); }
    await s.perform(Strongroom.legal(s).find(c => c.startsWith('light_item(world__brand'))!);
    return s;
  }
  it('brings the ceiling down on someone when the idol is lifted off it', async () => {
    const s = await vault();
    const event = await s.perform(Strongroom.legal(s).find(c => c.startsWith('take_out(world__idol'))!);
    expect(Strongroom.state(s, 'world__ceiling')).toBe('world__fallen');
    // The falling stone is turned on one member, who may dodge it (a save) or not.
    expect(event.combat.some(e => e.type === 'save' || e.type === 'damage')).toBe(true);
  }, 60000);
  it('stays down while something else weighs it', async () => {
    const s = await vault();
    await s.perform(Strongroom.legal(s).find(c => c.startsWith('put_in(world__sand'))!);
    await s.perform(Strongroom.legal(s).find(c => c.startsWith('take_out(world__idol'))!);
    expect([Strongroom.state(s, 'world__ceiling'), Strongroom.hurt(s)]).toEqual(['world__poised', []]);
  }, 60000);
});
