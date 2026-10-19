import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Content } from '../src/content';
import { PartyCapabilities } from '../src/campaign/party-capabilities';
import { OrraHistories } from './orra-histories';

class Orra {
  static async start(company = 'fellowship') {
    return PlaySession.start(`data/orra/${company}.campaign.json`, 'orra', NodeBundleSource.shared);
  }
  static async play(commands: string[], company = 'fellowship') {
    const s = await this.start(company);
    for (const command of commands) { await s.perform(command); }
    return s;
  }
  static test(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
}

describe('Saint Orra connected adventures', () => {
  it('lets evidence change a judgment and offscreen work, then rescues Ys without killing the guardians', async () => {
    const s = await Orra.play(OrraHistories.investigator);
    expect(s.campaign.state.outcomes).toMatchObject({ 'refuge.accusation_withdrawn': true,
      'refuge.heating_lost': true, 'refuge.water_spoiled': false, 'tower.healer_home': true,
      'tower.siphon_stopped': true, 'tower.warden_dead': false });
    expect(s.campaign.events.flatMap(e => e.npc ?? []).some(n => n.actor === 'refuge__mere'
      && n.action.startsWith('disable('))).toBe(true);
    expect(Orra.test(s, 'at', 'tower__ys', 'refuge__green')).toBe(true);
    const restored = PlaySession.resume(s.checkpoint());
    expect(restored.canonical()).toBe(s.canonical());
    const replay = await Orra.start(); await replay.replay(s.transcript.steps);
    expect(replay.canonical()).toBe(s.canonical());
    expect(PlayerView.observe(s.campaign).observations.some(o => o.id === 'tower__returned')).toBe(true);
  });
  it('makes the Fellowship and ranger matter without locking other parties out of the adventures', async () => {
    const s = await Orra.start(); const hired = await Orra.start('company');
    await s.perform('travel(refuge__porch)'); await hired.perform('travel(refuge__porch)');
    const command = 'request_passage(refuge__mere,fellowship)';
    expect(PlayerView.observe(s.campaign).choices.some(c => c.id === command)).toBe(true);
    expect(PlayerView.observe(hired.campaign).choices.some(c => c.id === command)).toBe(false);
    await s.perform(command);
    expect(Orra.test(s, 'closed', 'refuge__cell')).toBe(false);
    const investigator = await Orra.play(OrraHistories.investigator, 'company');
    expect(investigator.campaign.state.outcomes!['tower.healer_home']).toBe(true);
    const partial = await Orra.play(OrraHistories.expedition);
    for (let i = partial.campaign.state.elapsed; i < 30; i++) { await partial.perform('wait'); }
    expect(partial.campaign.state.outcomes).toMatchObject({ 'tower.siphon_stopped': true,
      'refuge.accusation_withdrawn': false, 'refuge.water_spoiled': true, 'refuge.expelled': true });
    expect(partial.campaign.running).toBe(true);
  });
  it('keeps unattended losses physical and preserves collected water, history and a late alternative entrance', async () => {
    const s = await Orra.start();
    await s.perform('collect(water,refuge__cistern)');
    for (let i = s.campaign.state.elapsed; i < 38; i++) { await s.perform('wait'); }
    expect(s.campaign.state.outcomes).toMatchObject({ 'refuge.water_spoiled': true,
      'refuge.expelled': true, 'tower.moor_flooded': true });
    expect(Orra.test(s, 'carrying', 'party', 'water')).toBe(true);
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'refuge__cistern', 'water'))).toBe(0);
    await s.perform('travel(tower__moor)'); await s.perform('approach_wildlife(tower__wolf,woodcraft)');
    expect(PlayerView.observe(s.campaign).choices.some(c => c.id === 'cross(tower__wolf,tower__cairn)')).toBe(false);
    await s.perform('travel(refuge__green)'); await s.perform('travel(refuge__kiln)');
    await s.perform('examine(refuge__sketch)'); await s.perform('passage(tower__vault)');
    await s.perform('travel(tower__spring)'); await s.perform('disable(tower__siphon)');
    expect(s.campaign.state.outcomes!['tower.moor_flooded']).toBe(true);
    expect(s.campaign.running).toBe(true);
  });
  it('offers independent evidence and loses a destroyed source without deleting the truth', async () => {
    const s = await Orra.start();
    await s.perform('travel(refuge__kiln)'); await s.perform('destroy_source(refuge__ledger)');
    expect(PlayerView.observe(s.campaign).choices.some(c => c.id === 'examine(refuge__ledger)')).toBe(false);
    await s.perform('travel(refuge__green)'); await s.perform('examine(refuge__cup)');
    expect(Orra.test(s, 'knows', 'party', 'refuge__runoff')).toBe(true);
    expect(Orra.test(s, 'knows', 'refuge__mere', 'refuge__runoff')).toBe(false);
  });
  it('retains canonical injuries and exposes a distinctive, replayable encounter', async () => {
    const s = await Orra.play(OrraHistories.violence, 'company');
    const event = s.campaign.events.at(-1)!;
    expect(event.combat.length).toBeGreaterThan(0);
    expect(event.combat.some(e => e.type === 'damage' && e.modifiers?.resistance === 0.5)).toBe(true);
    const warden = s.campaign.state.creatures.find(c => c.id === 'tower__warden')!;
    expect(warden.base.abilities).toEqual(['attack', 'drain', 'ward', 'sleep']);
    expect(warden.state.hp).toBeLessThan(warden.base.maxHp);
    const restored = PlaySession.resume(s.checkpoint());
    expect(restored.campaign.state.creatures).toEqual(s.campaign.state.creatures);
    const replay = await Orra.start('company'); await replay.replay(s.transcript.steps);
    expect(replay.canonical()).toBe(s.canonical());
  });
  it('derives capabilities from living canonical members, counting each member only once', () => {
    const c = new Content('identity');
    const members = [c.createCreature('a', { raceId: 'human' }), c.createCreature('b', { raceId: 'elf' }),
      c.createCreature('c', { raceId: 'dwarf' })];
    expect(PartyCapabilities.has('fellowship', members)).toBe(true);
    members[2]!.state.hp = 0;
    expect(PartyCapabilities.has('fellowship', members)).toBe(false);
    expect(PartyCapabilities.has('fellowship', [members[0]!, members[0]!, members[1]!])).toBe(false);
  });
  it('requires recovering a fallen keeper’s key and operating the latch, without establishing innocence', async () => {
    const s = await Orra.start('company');
    await s.perform('travel(refuge__porch)'); await s.perform('attack(refuge__mere)');
    expect(Orra.test(s, 'dead', 'refuge__mere')).toBe(true);
    expect(Orra.test(s, 'closed', 'refuge__cell')).toBe(true);
    await s.perform('take_control(refuge__latch,refuge__mere)');
    expect(Orra.test(s, 'closed', 'refuge__cell')).toBe(true);
    await s.perform('open(refuge__latch)');
    expect(Orra.test(s, 'closed', 'refuge__cell')).toBe(false);
    expect(s.campaign.state.outcomes!['refuge.accusation_withdrawn']).toBe(false);
    for (let i = s.campaign.state.elapsed; i < 30; i++) { await s.perform('wait'); }
    expect(s.campaign.state.outcomes!['refuge.expelled']).toBe(false);
    expect(Orra.test(s, 'closed', 'refuge__cell')).toBe(false);
    expect(s.campaign.running).toBe(true);
  });
});
