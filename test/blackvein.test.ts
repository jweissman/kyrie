import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Scenarios } from '../web/scenarios';
import { ModuleWriter } from '../src/lang/module-writer';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { World } from '../src/lang/world';

class Vale {
  static manifest = 'data/blackvein/campaign.json';
  static start() { return PlaySession.start(this.manifest, 'bells', Scenarios.source()); }
  static async play(s: PlaySession, commands: string[]) {
    for (const command of commands) { await s.perform(command); }
    return s;
  }
  static async until(s: PlaySession, watch: number) {
    while (s.campaign.state.elapsed < watch) { await s.perform('wait'); }
  }
  static investigator = ['travel(vale__square)', 'travel(vale__guild)', 'examine(vale__ledger)',
    'travel(vale__square)', 'travel(vale__toll)', 'tell(vale__vey,vale__charter)',
    'travel(vale__square)', 'travel(vale__ridge)', 'travel(vale__hollow)',
    'ask(vale__len,vale__escape_route)', 'examine(vale__bark)', 'tell(vale__len,vale__charter)',
    'travel(vale__ridge)',
    'passage(vale__vault)', 'disable(vale__bell)'];
  static partial = ['travel(vale__square)', 'travel(vale__ridge)', 'travel(vale__hollow)',
    'examine(vale__bark)', 'travel(vale__ridge)', 'travel(vale__mine)', 'tell(vale__ada,vale__danger)'];
  static outcomes(s: PlaySession) { return s.campaign.state.outcomes!; }
  static money(s: PlaySession) { return s.campaign.state.creatures.reduce((sum, c) => sum + c.state.gold, 0); }
}

describe('Bells Under Blackvein campaign', () => {
  it('offers a grounded, local introduction and preserves typed observations through source roundtrip', async () => {
    const s = await Vale.start(), v = PlayerView.observe(s.campaign);
    expect(s.campaign.module.entities.filter(e => e.type === 'place')).toHaveLength(11);
    expect(v.observations.map(o => o.text).join(' ')).toContain('MINE SHIFTS DELAYED');
    expect(v.knowledge).toEqual([]);
    expect(v.present.some(e => e.id === 'vale__len')).toBe(false);
    const source = ModuleWriter.write({ ...s.campaign.module, actions: s.campaign.schemas });
    const parsed = ModuleParser.parse(source);
    new ModuleCompiler([{ name: 'combat', types: ['group'], exclusive: false }]).validate(parsed);
    expect(parsed.observations).toEqual(s.campaign.module.observations);
    expect(parsed.rules).toEqual(s.campaign.module.rules);
    expect(parsed.pursuits).toEqual(s.campaign.module.pursuits);
    await Vale.play(s, ['travel(vale__square)']);
    expect(PlayerView.observe(s.campaign).observations[0]!.text).toContain('who will own the mine');
    expect(PlayerView.chronicle(s.campaign).some(e => e.kind === 'observation')).toBe(true);
  }, 30000);
  it('investigation changes a claim, returns the witness, and prevents the threat without closing the mine', async () => {
    const s = await Vale.play(await Vale.start(), Vale.investigator);
    await Vale.until(s, 43);
    const o = Vale.outcomes(s);
    expect([o['vale.bell_silenced'], o['vale.miner_home'], o['vale.mine_claim_defeated']]).toEqual([true, true, true]);
    expect([o['vale.mine_closed'], o['vale.mine_appropriated'], o['vale.water_spoiled'], o['vale.town_abandoned']])
      .toEqual([false, false, false, false]);
    expect(Vale.money(s)).toBe(16);
    expect(s.campaign.running).toBe(true);
    expect(PlayerView.chronicle(s.campaign).some(e => e.kind === 'discovery' && e.text.includes('charter'))).toBe(true);
  }, 120000);
  it('support accelerates occupation, changes access, and transfers actual conserved money', async () => {
    const s = await Vale.play(await Vale.start(), ['travel(vale__square)', 'travel(vale__toll)', 'endorse(vale__vey)']);
    await Vale.until(s, 10);
    expect(Vale.outcomes(s)['vale.mine_appropriated']).toBe(true);
    expect(s.campaign.state.creatures.find(c => c.id === 'vale__vey')!.state.gold).toBeGreaterThan(0);
    expect(Vale.money(s)).toBe(16);
    expect(PlayerView.observe(s.campaign).choices.some(c => c.id === 'travel(vale__mine)')).toBe(true);
    await Vale.until(s, 43);
    expect(Vale.outcomes(s)['vale.water_spoiled']).toBe(true);
    expect(Vale.outcomes(s)['vale.town_abandoned']).toBe(true);
  }, 120000);
  it('unattended history changes the road, mine, well and inhabitants offscreen; failure stays playable', async () => {
    const s = await Vale.start();
    await Vale.until(s, 43);
    expect(Vale.outcomes(s)['vale.mine_appropriated']).toBe(true);
    expect(Vale.outcomes(s)['vale.water_spoiled']).toBe(true);
    expect(Vale.outcomes(s)['vale.town_abandoned']).toBe(true);
    expect(Vale.outcomes(s)['vale.miner_home']).toBe(false);
    await s.perform('travel(vale__square)');
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).toContain('deserted');
    expect(PlayerView.chronicle(s.campaign).some(e => e.kind === 'observation' && e.text.includes('deserted'))).toBe(true);
    expect(s.campaign.running).toBe(true);
    expect(Vale.money(s)).toBe(16);
  }, 120000);
  it('closing the mine prevents contamination but displaces workers; disabling the source permits reopening', async () => {
    const s = await Vale.play(await Vale.start(), Vale.partial);
    await Vale.until(s, 12);
    expect(Vale.outcomes(s)['vale.mine_closed']).toBe(true);
    expect(Vale.outcomes(s)['vale.miners_displaced']).toBe(true);
    expect(Vale.outcomes(s)['vale.bell_silenced']).toBe(false);
    const checkpoint = s.checkpoint();
    expect(JSON.stringify(checkpoint).length).toBeLessThan(500000);
    const resumed = PlaySession.resume(JSON.parse(JSON.stringify(checkpoint)));
    const next = ['travel(vale__ridge)', 'examine(vale__survey)', 'passage(vale__vault)', 'disable(vale__bell)',
      'travel(vale__ridge)', 'travel(vale__mine)', 'wait', 'wait'];
    await Vale.play(s, next); await Vale.play(resumed, next);
    expect(resumed.canonical()).toBe(s.canonical());
    expect(Vale.outcomes(s)['vale.mine_closed']).toBe(false);
    expect(s.campaign.world.test(ModuleWriter.call('at', 'vale__ada', 'vale__mine'))).toBe(true);
    expect(s.campaign.state.creatures.map(c => c.id)).toEqual(checkpoint.save.creatures.map(c => c.id));
  }, 120000);
  it('asks only offered topics without exposing the answer, and preserves a witness memory after source destruction', async () => {
    const s = await Vale.play(await Vale.start(), ['travel(vale__square)', 'travel(vale__ridge)', 'travel(vale__hollow)']);
    const before = PlayerView.observe(s.campaign);
    expect(before.knowledge.some(k => k.id === 'vale__tunnel')).toBe(false);
    const question = before.choices.find(c => c.id === 'ask(vale__len,vale__escape_route)')!;
    expect(question.name).toContain('ventilation sketch');
    expect(question.name).not.toContain('bypassing the pumping gallery');
    await s.perform('destroy_source(vale__escape_route)');
    expect(PlayerView.observe(s.campaign).choices.some(c => c.id === 'examine(vale__escape_route)')).toBe(false);
    await s.perform('ask(vale__len,vale__escape_route)');
    expect(PlayerView.observe(s.campaign).knowledge.some(k => k.id === 'vale__tunnel')).toBe(true);
    expect(PlayerView.observe(s.campaign).choices.some(c => c.id === question.id)).toBe(false);
    expect(s.campaign.world.test(ModuleWriter.call('toldBy', 'party', 'vale__len', 'vale__tunnel'))).toBe(true);
  }, 30000);
  it('violence kills the canonical agent, cancels his control, and does not end the campaign', async () => {
    const s = await Vale.play(await Vale.start(), ['travel(vale__square)', 'travel(vale__toll)', 'attack(vale__vey)']);
    expect(Vale.outcomes(s)['vale.agent_dead']).toBe(true);
    const dead = s.campaign.state.creatures.find(c => c.id === 'vale__vey')!;
    expect(dead.state.hp).toBe(0);
    expect(Vale.money(s)).toBe(16);
    await Vale.play(s, ['travel(vale__square)', 'travel(vale__toll)']);
    expect(s.campaign.state.creatures.find(c => c.id === dead.id)).toEqual(dead);
    expect(PlayerView.observe(s.campaign).choices.some(c => c.id === 'pay(vale__vey)')).toBe(false);
    expect(s.campaign.running).toBe(true);
    const replay = await PlaySession.start(Vale.manifest, 'bells', NodeBundleSource.shared);
    await replay.replay(s.transcript.steps);
    expect(replay.canonical()).toBe(s.canonical());
  }, 60000);
});

describe('bounded world rules and descriptions', () => {
  it('validates places and predicates, uses ordered atomic effects, and does not grant knowledge by observation', () => {
    const text = `Module example "Example" { Kind place. Kind clock. Relation lit(place).
      Measure watch(clock). Entity yard: place "Yard". Entity clock: clock "Clock".
      Observe lamp at yard when lit(yard) "A lamp is lit.".
      Rule light when watch(clock) >= 2 and not lit(yard) { Assert lit(yard). }
      Goal lit(yard). }`;
    const c = new ModuleCompiler();
    const m = ModuleParser.parse(text); c.validate(m);
    expect(() => c.validate(ModuleParser.parse(text.replace('at yard when', 'at nowhere when')))).toThrow('observation place');
    expect(() => c.validate(ModuleParser.parse(text.replace('when lit(yard) "', 'when unknown(yard) "')))).toThrow('Unknown function');
    const world = new World(m).apply([{ kind: 'set', call: ModuleWriter.call('watch', 'clock'), value: ModuleWriter.number(2) }]);
    expect(world.test(m.rules![0]!.when)).toBe(true);
    expect(world.apply(m.rules![0]!.effects).test(m.observations![0]!.when)).toBe(true);
    expect(() => c.validate(ModuleParser.parse(text.replace('Assert lit(yard). }', 'Set watch(clock) to 0. }'))))
      .toThrow('Rules cannot change');
  });
});

describe('compositional Blackvein generation', () => {
  it('changes population and timing independently through inherited contexts, with frozen repeatable instances', async () => {
    const base = await Vale.start();
    const repeat = await Vale.start();
    const varied = await PlaySession.start('data/blackvein/upland.campaign.json', 'bells', Scenarios.source());
    expect(base.canonical()).toBe(repeat.canonical());
    expect(base.campaign.state.creatures.map(c => c.name))
      .toEqual(['Rowan', 'Tamsin', 'Ada Flint', 'Ser Caldus', 'Brother Iven', 'Len', 'The listening echo']);
    expect(base.campaign.state.creatures.map(c => c.classId))
      .toEqual(['fighter', 'cleric', 'commoner', 'fighter', 'cleric', 'commoner', 'commoner']);
    expect(varied.campaign.schemas).toEqual(base.campaign.schemas);
    expect(varied.campaign.module.rules).toEqual(base.campaign.module.rules);
    expect(base.campaign.world.number(ModuleWriter.call('enforceAt', 'vale__vey'))).toBe(18);
    expect(varied.campaign.world.number(ModuleWriter.call('enforceAt', 'vale__vey'))).toBe(12);
    expect(varied.campaign.state.creatures.map(c => c.raceId))
      .not.toEqual(base.campaign.state.creatures.map(c => c.raceId));
    const before = varied.campaign.state.creatures;
    await varied.perform('wait');
    expect(varied.campaign.state.creatures).toEqual(before);
    expect(PlaySession.resume(varied.checkpoint()).canonical()).toBe(varied.canonical());
    await varied.perform('travel(vale__square)'); await varied.perform('travel(vale__toll)');
    expect(PlayerView.observe(varied.campaign).observations.map(o => o.text).join(' ')).toContain('watch 12');
  }, 60000);
});
