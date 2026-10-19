import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { FictionalTime } from '../src/presentation/fictional-time';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { FieldUse } from '../src/campaign/field-use';
import { FrontierHistories } from './frontier-histories';

describe('adventuring loop and coherent authoring', () => {
  it('authors conversations as ordinary guarded actions with private belief and observable feedback', async () => {
    const s = await FrontierHistories.start();
    await s.perform('travel(refuge__porch)');
    let before = PlayerView.observe(s.campaign);
    const e = await s.perform('refuge__mere_concern');
    expect(e.response).toContain('I promised these families shelter');
    expect(ActionFeedbackView.read(s.campaign, e, before).discoveries).toEqual([]);
    expect(PlayerView.observe(s.campaign).knowledge).toEqual([]);
    await s.perform('travel(refuge__green)'); await s.perform('examine(refuge__cup)');
    await s.perform('travel(refuge__porch)'); before = PlayerView.observe(s.campaign);
    const taught = await s.perform('tell(refuge__mere,refuge__runoff)');
    const result = ActionFeedbackView.read(s.campaign, taught, before);
    expect(result.available).toContain('Travel to Locked guest house');
    expect(result.immediate.some(t => t.includes('open') || t.includes('Open'))).toBe(true);
    expect(result.immediate.join(' ')).not.toContain('ice-pump');
    expect(PlayerView.observe(s.campaign).choices.some(c => c.id === 'refuge__mere_admission')).toBe(true);
  }, 30000);
  it('shares the actual effect executor for field healing and poison removal, charging persistent mana', () => {
    const content = new Content('field');
    const healer = content.createCreature('cleric', { classId: 'cleric' });
    const patient = content.createCreature('patient', { classId: 'fighter' });
    patient.state.hp = 1; patient.state.conditions = [{ id: 'poisoned', remaining: 3 }];
    const store = new CreatureStore([healer, patient]);
    const events = FieldUse.perform(store, ['cleric', 'patient'],
      { ability: 'heal', caster: 'cleric', target: 'patient', seed: 'care' });
    expect(store.get('patient').state.hp).toBeGreaterThan(1);
    expect(store.get('cleric').state.mana).toBe(healer.state.mana - 2);
    expect(events.some(e => e.type === 'heal')).toBe(true);
    FieldUse.perform(store, ['cleric', 'patient'],
      { ability: 'purify', caster: 'cleric', target: 'patient', seed: 'cleanse' });
    expect(store.get('patient').state.conditions).toEqual([]);
    expect(() => FieldUse.perform(store, ['cleric', 'patient'],
      { ability: 'bolt', caster: 'cleric', target: 'patient', seed: 'unsafe' })).toThrow('Unsupported');
  });
  it.each(['fellowship', 'company'] as const)('completes two expeditions with the %s, a learned reward, recovery and persistence', async kind => {
    const s = await FrontierHistories.start(FrontierHistories[kind]);
    await FrontierHistories.commands(s, FrontierHistories.first);
    const shield = s.campaign.state.creatures.find(c => c.id === 'refuge__shield')!;
    expect(shield.state.learnedAbilities).toContain('cinder');
    expect(shield.state.experience).toBe(40);
    expect(s.campaign.state.elapsed).toBe(54);
    expect(s.campaign.state.party.every(p => p.hp === p.maxHp && p.mana === p.maxMana)).toBe(true);
    await FrontierHistories.commands(s, FrontierHistories.second);
    const events = s.campaign.events.flatMap(e => e.combat);
    expect(events.some(e => e.type === 'action' && e.command.actor === 'refuge__shield'
      && e.command.ability === 'cinder')).toBe(true);
    expect(events.some(e => e.type === 'damage' && e.damageType === 'fire' && e.modifiers?.resistance === -0.5))
      .toBe(true);
    expect(s.campaign.state.outcomes!['margin.font_stopped']).toBe(true);
    expect(PlaySession.resume(s.checkpoint()).canonical()).toBe(s.canonical());
    const replay = await FrontierHistories.start(FrontierHistories[kind]); await replay.replay(s.transcript.steps);
    expect(replay.canonical()).toBe(s.canonical());
  }, 60000);
  it('offers a noncombat bypass and cancels recovery when the occupied shelter freezes during it', async () => {
    const s = await FrontierHistories.start(); await FrontierHistories.commands(s, FrontierHistories.first);
    await FrontierHistories.commands(s, ['travel(refuge__green)', 'travel(margin__track)', 'travel(margin__camp)',
      'margin__tala_route', 'travel(margin__track)', 'passage(margin__shrine)', 'examine(margin__tide_marks)',
      'salvage_coin(margin__purse)', 'travel(margin__track)', 'travel(margin__camp)']);
    expect(s.campaign.events.every(e => e.combat.every(c => c.type !== 'end'))).toBe(true);
    while (s.campaign.state.elapsed < 80) { await s.perform('wait'); }
    const result = await s.perform('rest(margin__camp)');
    expect(result.result).toBe('failure');
    expect(result.response).toContain('unsafe');
    expect(s.campaign.state.outcomes!['margin.camp_lost']).toBe(true);
    expect(s.campaign.state.outcomes!['margin.guide_displaced']).toBe(true);
    expect(s.campaign.running).toBe(true);
  }, 60000);
  it('lowers native people and topics without bespoke controllers and composes independent biome constraints', async () => {
    const source = 'Module native "New" { Person eva "Eva" at room { Race human. Class ranger. Uses travel. } '
      + 'Topic home with eva "Ask why she stayed" when true { Says "This is my home.". } Goal false. }';
    const parsed = ModuleParser.parse(source);
    expect(ModuleParser.parse(ModuleWriter.write(parsed))).toEqual(parsed);
    const fen = await FrontierHistories.start();
    const pine = await FrontierHistories.start(FrontierHistories.fellowship, 'data/frontier/pine.campaign.json');
    expect(fen.campaign.state.creatures.find(c => c.id === 'margin__tala_person')!.name).not.toBe('The northern margin');
    expect(fen.campaign.module.entities.find(e => e.id === 'margin__camp')!.name)
      .not.toBe(pine.campaign.module.entities.find(e => e.id === 'margin__camp')!.name);
    expect(pine.campaign.world.number(ModuleWriter.call('quantity', 'margin__tala', 'rations'))).toBeLessThan(4);
    expect(fen.campaign.module.actions.filter(a => a.speaker).length).toBeGreaterThan(2);
    expect(FictionalTime.at(36)).toBe('Day 1, 2:00 p.m.');
    expect(FictionalTime.duration(36)).toBe('6h');
  }, 30000);
});
