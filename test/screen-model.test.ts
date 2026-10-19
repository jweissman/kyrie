import { beforeAll, describe, expect, it } from 'bun:test';
import partyExamples from '../data/party-examples.json';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { CombatModel } from '../src/ui/combat-model';
import { ChoiceGrouping } from '../src/ui/choice-grouping';
import type { CreatureGenerationContext } from '../src/content';
import type { Act, Screen } from '../src/ui/screen-types';

class Fixture {
  static party = partyExamples.fellowship.map((p, i) => ({ ...p, backgroundId: ['forager', 'surveyor', 'pilgrim'][i] })) as
    CreatureGenerationContext[];
  static async start(...commands: string[]) {
    const s = await PlaySession.start('data/serewater/campaign.json', 'serewater', NodeBundleSource.shared, this.party);
    for (const c of commands) { await s.perform(c); }
    return s;
  }
  static leaves(screen: Screen): string[] {
    const acts: Act[] = [...screen.exits, ...screen.people, ...screen.things, ...screen.items, ...screen.party]
      .flatMap(r => r.acts);
    return ChoiceGrouping.leaves([...acts, ...screen.camp, ...screen.unplaced]).map(a => a.command!);
  }
  static find(acts: Act[], ...labels: string[]): Act | undefined {
    let level = acts, node: Act | undefined;
    for (const label of labels) {
      node = level.find(a => a.label === label || a.label.startsWith(label));
      level = node?.children ?? [];
    }
    return node;
  }
}

const toVestibule = ['travel(march__causeway)', 'travel(march__ridge)', 'travel(march__yard)', 'travel(march__vestibule)'];

describe('game screen model', () => {
  let start: PlaySession;
  beforeAll(async () => { start = await Fixture.start(); });

  it('places the party in a declared spatial hierarchy with typed transitions', () => {
    const screen = ScreenModel.build(start.campaign);
    expect(screen.path.map(p => p.kind)).toEqual(['region', 'settlement', 'room']);
    expect(screen.place.name).toBe('Ferry quay');
    const byDestination = Object.fromEntries(screen.exits.map(e => [e.destination.id, e]));
    expect(byDestination.march__outfitter).toMatchObject({ transition: 'enter', scope: 'Nera’s outfitter', passage: 'open' });
    expect(byDestination.march__causeway).toMatchObject({ transition: 'travel', scope: 'Willow floodplain and chalk ridge' });
    expect(screen.camp.map(a => a.label)).toEqual(['Wait a while', 'Eat a ration', 'Rest six hours']);
  });

  it('offers exactly the legal commands: nothing invented, nothing dropped', async () => {
    for (const s of [start, await Fixture.start('travel(march__outfitter)')]) {
      const legal = new Set(PlayerView.choices(s.campaign).map(c => c.choice.id));
      const offered = new Set(Fixture.leaves(ScreenModel.build(s.campaign)));
      expect([...offered].sort()).toEqual([...legal].sort());
    }
  });

  it('organizes a shop by person and intention rather than a flat command list', async () => {
    const s = await Fixture.start('travel(march__outfitter)');
    const nera = ScreenModel.build(s.campaign).people.find(p => p.id === 'march__nera')!;
    expect(nera.acts.map(a => a.label)).toEqual(['Give', 'Attack', 'Buy', 'Talk']);
    expect(Fixture.find(nera.acts, 'Buy', 'Nera’s healing draught', 'for Bran')?.command)
      .toBe('buy_item(march__draught_1,march__member_shield)');
    expect(Fixture.find(nera.acts, 'Attack')?.risk).toBe(true);
    expect(PlayerView.choices(s.campaign).length).toBeGreaterThan(15);
  });

  it('explains a known but blocked way instead of hiding it', async () => {
    const s = await Fixture.start('travel(march__causeway)');
    const screen = ScreenModel.build(s.campaign);
    const drain = screen.exits.find(e => e.destination.id === 'march__drain')!;
    expect(drain).toMatchObject({ passage: 'guarded', transition: 'enter', acts: [] });
    expect(drain.blocked).toContain('bars the way');
    expect(screen.people.find(p => p.id === 'march__marshfang')?.kind).toBe('creature');
  });

  it('gathers hazard responses on the crossing they affect and marks level changes', async () => {
    const s = await Fixture.start(...toVestibule, 'travel(march__workshop)', 'travel(march__stores)',
      'take_item(march__line_cache,march__member_shield)', 'equip_item(march__line_cache,march__member_shield)');
    const stair = ScreenModel.build(s.campaign).exits.find(e => e.destination.id === 'march__stair')!;
    expect(stair).toMatchObject({ transition: 'level', scope: 'Level II · Flood refuge' });
    await s.perform('travel(march__workshop)'); await s.perform('travel(march__gallery)');
    await s.perform('attack(march__roost)'); await s.perform('cross(march__roost,march__hoist)');
    expect(Fixture.find(ScreenModel.build(s.campaign).exits.find(e => e.destination.id === 'march__landing')!.acts, 'Brace'))
      .toBeUndefined();
    await s.perform('examine(march__scored_timber)');
    const landing = ScreenModel.build(s.campaign).exits.find(e => e.destination.id === 'march__landing')!;
    expect(landing.passage).toBe('hazard');
    expect(landing.transition).toBe('level');
    expect(Fixture.find(landing.acts, 'Risk')?.children?.map(a => a.label)).toEqual(['Elen goes first', 'Bran goes first', 'Dori goes first']);
    expect(Fixture.find(landing.acts, 'Brace')?.command).toBe('brace(march__counterweight,march__line_cache)');
    const yard = ScreenModel.build(s.campaign).exits.find(e => e.destination.id === 'march__yard')!;
    expect(yard).toMatchObject({ passage: 'climb', transition: 'leave' });
  });

  it('is a pure projection: identical after save and restore', async () => {
    const s = await Fixture.start('travel(march__outfitter)', 'buy_item(march__draught_1,march__member_shield)');
    const restored = PlaySession.resume(s.checkpoint());
    expect(ScreenModel.build(restored.campaign)).toEqual(ScreenModel.build(s.campaign));
    const item = ScreenModel.build(s.campaign).items[0]!;
    expect(item).toMatchObject({ name: 'Nera’s healing draught', kind: 'Minor healing potion', ownerName: 'Bran' });
    expect(Fixture.find(item.acts, 'Use on', 'Elen')?.command).toBe('use_item(march__draught_1,march__member_guide)');
  });

  it('projects combat abilities and targets only from legal battle commands', async () => {
    const s = await Fixture.start(...toVestibule, 'travel(march__workshop)', 'travel(march__gallery)');
    let seen = false;
    await s.perform('attack(march__roost)', battle => {
      const model = CombatModel.build(battle);
      if (!seen) {
        seen = true;
        expect(model.ours).toBe(true);
        expect(model.foes.map(f => f.name)).toEqual(['Ash the cave hound']);
        const attack = model.abilities.find(a => a.id === 'attack')!;
        expect(attack.targets.map(t => t.name)).toEqual(['Ash the cave hound']);
        const legal = battle.legalCommands();
        for (const a of model.abilities) { expect(legal.some(c => c.ability === a.id)).toBe(true); }
      }
      return PlaySession.auto(battle);
    });
    expect(seen).toBe(true);
  });

  it('treats typed-exit modules the same way', async () => {
    const s = await PlaySession.start('data/greenhollow/campaign.json', 'greenhollow', NodeBundleSource.shared);
    const screen = ScreenModel.build(s.campaign);
    expect(screen.path.length).toBeGreaterThan(2);
    expect(screen.exits.length).toBeGreaterThan(0);
    const legal = new Set(PlayerView.choices(s.campaign).map(c => c.choice.id));
    expect(new Set(Fixture.leaves(screen))).toEqual(legal);
  });
});
